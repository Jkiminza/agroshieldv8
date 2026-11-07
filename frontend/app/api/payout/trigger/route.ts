import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { policies } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { CONTRACT_ADDRESS } from '@/lib/agroshield'
import { CONTRACT_ABI } from '@/lib/abi'
import { getWalletClient } from '@/lib/server-wallet'
import { fetchWeatherByLocation, generateReportHash } from '@/lib/weather-oracle'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const all = searchParams.get('all') === '1'

  let rows = await db.select().from(policies)
  if (!all) rows = rows.filter((r) => r.userId === session.user.id)

  const { walletClient, publicClient, account } = getWalletClient()
  const abi = CONTRACT_ABI as any

  const results: any[] = []

  for (const row of rows) {
    if (row.status !== 'active') {
      results.push({ policyId: row.onChainPolicyId, action: 'skipped', reason: `status=${row.status}` })
      continue
    }

    try {
      // read on-chain state
      const pol = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi,
        functionName: 'getPolicy',
        args: [BigInt(row.onChainPolicyId)],
      }) as any

      if (pol.paid) {
        await db.update(policies).set({ status: 'paid' }).where(eq(policies.id, row.id))
        results.push({ policyId: row.onChainPolicyId, action: 'already_paid' })
        continue
      }
      if (!pol.active) {
        await db.update(policies).set({ status: 'closed' }).where(eq(policies.id, row.id))
        results.push({ policyId: row.onChainPolicyId, action: 'inactive' })
        continue
      }

      const location = row.location || 'Nairobi, Kenya'
      const weather = await fetchWeatherByLocation(location)
      const rainfall = weather.rainfallMm
      const reportedMm = rainfall > 0 ? Math.max(1, Math.ceil(rainfall)) : 0
      const threshold = row.thresholdMm

      // Already reported? reportedValue > 0
      const alreadyReported = Number(pol.reportedValue) > 0

      if (rainfall < threshold && reportedMm > 0) {
        // report if needed
        let reportTx: string | undefined
        if (!alreadyReported) {
          const reportHash = generateReportHash({
            policyId: row.onChainPolicyId,
            rainfallMm: reportedMm,
            reportHash: '0x0000000000000000000000000000000000000000000000000000000000000000' as any,
            timestamp: weather.timestamp,
          } as any)
          const tx = await walletClient.writeContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi,
            functionName: 'report',
            args: [BigInt(row.onChainPolicyId), BigInt(reportedMm), reportHash],
            account,
          })
          await publicClient.waitForTransactionReceipt({ hash: tx })
          reportTx = tx
        }

        // settle
        const settleTx = await walletClient.writeContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi,
          functionName: 'settle',
          args: [BigInt(row.onChainPolicyId)],
          account,
        })
        await publicClient.waitForTransactionReceipt({ hash: settleTx })

        await db.update(policies).set({ status: 'paid', txHash: settleTx }).where(eq(policies.id, row.id))

        results.push({
          policyId: row.onChainPolicyId,
          action: 'paid_out',
          rainfallMm: rainfall,
          reportedMm,
          threshold,
          reportTx,
          settleTx,
        })
      } else if (rainfall < threshold && reportedMm === 0) {
        results.push({
          policyId: row.onChainPolicyId,
          action: 'no_settle_possible',
          rainfallMm: rainfall,
          threshold,
          reason: 'rainfall is 0mm; contract requires reported rainfall > 0 to settle',
        })
      } else {
        results.push({
          policyId: row.onChainPolicyId,
          action: 'no_trigger',
          rainfallMm: rainfall,
          threshold,
          reason: `rainfall (${rainfall}mm) >= threshold (${threshold}mm)`,
        })
      }
    } catch (e: any) {
      results.push({ policyId: row.onChainPolicyId, action: 'error', error: e?.message || 'unknown' })
    }
  }

  return NextResponse.json({ results })
}
