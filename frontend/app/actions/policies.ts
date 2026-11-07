'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { policies } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export type PolicyRecordInput = {
  onChainPolicyId: number
  holder: string
  location?: string | null
  countyRuleId?: number | null
  crop?: string
  exitMm?: number | null
  seasonStart?: string | null
  seasonEnd?: string | null
  coverageDays?: number | null
  thresholdMm: number
  coverageEth: string
  premiumEth: string
  txHash?: string
}

export async function recordPolicy(input: PolicyRecordInput) {
  const userId = await getUserId()
  await db.insert(policies).values({
    userId,
    onChainPolicyId: input.onChainPolicyId,
    holder: input.holder,
    thresholdMm: input.thresholdMm,
    countyRuleId: input.countyRuleId ?? null,
    crop: input.crop ?? null,
    coverageEth: input.coverageEth,
    premiumEth: input.premiumEth,
    exitMm: input.exitMm ?? null,
    seasonStart: input.seasonStart ?? null,
    seasonEnd: input.seasonEnd ?? null,
    coverageDays: input.coverageDays ?? null,
    location: input.location ?? null,
    txHash: input.txHash ?? null,
    status: 'active',
  })
}

export async function getUserPolicies() {
  const userId = await getUserId()
  return db
    .select()
    .from(policies)
    .where(eq(policies.userId, userId))
    .orderBy(desc(policies.purchasedAt))
}

export async function getUserPolicyCount() {
  const rows = await getUserPolicies()
  return rows.length
}

import { createPublicClient, http, formatEther } from 'viem'
import { baseSepolia } from 'viem/chains'
import { CONTRACT_ADDRESS } from '@/lib/agroshield'
import { CONTRACT_ABI } from '@/lib/abi'

const policyAbi = CONTRACT_ABI as any

export async function syncPoliciesFromChain(holderAddress: string) {
  const userId = await getUserId()
  const client = createPublicClient({ chain: baseSepolia, transport: http('https://sepolia.base.org') })
  const count = await client.readContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: policyAbi,
    functionName: 'policyCount',
  }) as bigint
  const n = Number(count)
  const existing = await getUserPolicies()
  const existingIds = new Set(existing.map((p) => p.onChainPolicyId))
  const inserted: number[] = []
  for (let i = 1; i <= n; i++) {
    try {
      const pol = await client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: policyAbi,
        functionName: 'getPolicy',
        args: [BigInt(i)],
      }) as any
      if (pol.holder?.toLowerCase() !== holderAddress.toLowerCase()) continue
      if (existingIds.has(i)) continue
      await db.insert(policies).values({
        userId,
        onChainPolicyId: i,
        holder: pol.holder,
        thresholdMm: Number(pol.threshold),
        coverageEth: formatEther(pol.coverage),
        premiumEth: formatEther(pol.premium),
        location: 'Nairobi, Kenya',
        status: pol.paid ? 'paid' : pol.active ? 'active' : 'closed',
      })
      inserted.push(i)
    } catch (e) {
      // skip
    }
  }
  return { inserted, total: n }
}
