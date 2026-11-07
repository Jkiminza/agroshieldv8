import { db } from '@/lib/db'
import { farmerProfiles, policies, counties, countyRules } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getWalletClient } from '@/lib/server-wallet'
import { CONTRACT_ADDRESS } from '@/lib/agroshield'
import { CONTRACT_ABI } from '@/lib/abi'
import { sendSMS, generatePolicyPurchaseSMS } from '@/lib/africastalking'
import { parseEventLogs, formatEther } from 'viem'

export interface FulfillInput {
  phone: string
  county: string
  crop?: string
  amountKes: number
  providerRef: string
  simulated?: boolean
}

export async function fulfillPayment(input: FulfillInput) {
  const crop = input.crop || 'maize'
  const countyRows = await db.select().from(counties).where(eq(counties.name, input.county))
  const county = countyRows[0] || (await db.select().from(counties))[0]
  if (!county) throw new Error('County not found in DB')

  const rules = await db.select().from(countyRules).where(and(eq(countyRules.countyId, county.id), eq(countyRules.crop, crop), eq(countyRules.active, true)))
  const rule = rules[0]
  if (!rule) throw new Error(`No active rule for ${county.name}/${crop}`)

  const farmers = await db.select().from(farmerProfiles)
  const farmer = farmers.find((f: any) => String(f.phoneNumber || '').replace(/\D/g, '').slice(-9) === String(input.phone).replace(/\D/g, '').slice(-9))
  if (!farmer) throw new Error('No farmer profile for phone')

  // idempotency: don't double-process the same provider ref
  const existing = await db.select().from(policies).where(eq(policies.txHash, input.providerRef))
  if (existing.length > 0) {
    return { txHash: input.providerRef, county: county.name, ruleId: rule.id, simulated: !!input.simulated, alreadyProcessed: true }
  }

  const { walletClient, publicClient, account } = getWalletClient()
  const abi = CONTRACT_ABI as any
  const sumInsuredEth = 0.01
  const premiumEth = (sumInsuredEth * parseFloat(String(rule.premiumRate))).toFixed(6)

  const tx = await walletClient.writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi,
    functionName: 'buy',
    args: [BigInt(rule.triggerMm), BigInt(Math.round(sumInsuredEth * 1e18))],
    value: BigInt(Math.round(parseFloat(premiumEth) * 1e18)),
    account,
  })
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx })

  let onChainPolicyId = 0
  try {
    const logs = parseEventLogs({ abi, logs: receipt.logs })
    const purchased = logs.find((l: any) => l.eventName === 'PolicyPurchased') as any
    if (purchased) onChainPolicyId = Number(purchased.args.policyId)
  } catch { /* leave 0 */ }

  await db.insert(policies).values({
    userId: farmer.userId,
    onChainPolicyId: onChainPolicyId || 0,
    holder: account.address,
    thresholdMm: rule.triggerMm,
    countyRuleId: rule.id,
    crop: rule.crop,
    coverageEth: String(sumInsuredEth),
    premiumEth: String(premiumEth),
    exitMm: rule.exitMm,
    seasonStart: rule.seasonStart,
    seasonEnd: rule.seasonEnd,
    coverageDays: rule.coverageDays,
    location: county.name,
    txHash: input.providerRef,
    status: 'active',
  })

  try {
    await sendSMS({ to: input.phone, message: generatePolicyPurchaseSMS(onChainPolicyId, `${sumInsuredEth} ETH`, `${premiumEth} ETH`) + (input.simulated ? ' (simulated payment)' : '') })
  } catch { /* non-fatal */ }

  return { txHash: tx, onChainPolicyId, county: county.name, ruleId: rule.id, simulated: !!input.simulated }
}
