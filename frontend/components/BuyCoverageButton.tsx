'use client'

import { useEffect, useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, parseEventLogs, formatEther } from 'viem'
import { CONTRACT_ADDRESS } from '@/lib/agroshield'
import { CONTRACT_ABI } from '@/lib/abi'
import { getExplorerUrl, getContractUrl } from '@/lib/agroshield'
import { recordPolicy } from '@/app/actions/policies'

interface Rule {
  id: number
  countyId: number
  county: string
  crop: string
  triggerMm: number
  exitMm: number
  seasonStart: string
  seasonEnd: string
  coverageDays: number
  premiumRate: string
  active: boolean
  notes: string | null
}

interface Props {
  location?: string | null
  crop?: string | null
}

const SUM_INSURED_ETH = 0.01

export default function BuyCoverageButton({ location, crop = 'maize' }: Props) {
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash })
  const [message, setMessage] = useState('')
  const [recorded, setRecorded] = useState(false)
  const [rule, setRule] = useState<Rule | null>(null)
  const [loadingRule, setLoadingRule] = useState(false)
  const [ruleError, setRuleError] = useState('')

  const countyName = location ? location.split(',')[0].trim() : null

  useEffect(() => {
    if (!countyName) return
    setLoadingRule(true)
    setRuleError('')
    fetch(`/api/county-rules?county=${encodeURIComponent(countyName)}&crop=${encodeURIComponent(crop || 'maize')}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.rule) setRule(d.rule as Rule)
        else setRuleError(d.reason === 'no-active-rule' ? 'No active coverage for this county/crop yet.' : 'County not in registry.')
      })
      .catch((e) => setRuleError(e?.message || 'Failed to load rule'))
      .finally(() => setLoadingRule(false))
  }, [countyName, crop])

  useEffect(() => {
    if (!isSuccess || !receipt || recorded) return
    try {
      const logs = parseEventLogs({ abi: CONTRACT_ABI, logs: receipt.logs })
      const purchased = logs.find((l: any) => l.eventName === 'PolicyPurchased') as any
      if (purchased && address && rule) {
        const args = purchased.args
        recordPolicy({
          onChainPolicyId: Number(args.policyId),
          holder: address,
          thresholdMm: Number(args.threshold ?? rule.triggerMm),
          coverageEth: formatEther(args.coverage),
          premiumEth: formatEther(args.premium),
          countyRuleId: rule.id,
          crop: rule.crop,
          exitMm: rule.exitMm,
          seasonStart: String(rule.seasonStart),
          seasonEnd: String(rule.seasonEnd),
          coverageDays: rule.coverageDays,
          location: location || null,
          txHash: receipt.transactionHash,
        }).then(() => setRecorded(true)).catch((e) => console.error('recordPolicy failed', e))
      }
    } catch (e) {
      console.error('parse event failed', e)
    }
  }, [isSuccess, receipt, recorded, address, rule, location])

  const premiumEth = rule ? (SUM_INSURED_ETH * parseFloat(rule.premiumRate)).toFixed(6) : '0.0001'

  const handleBuy = async () => {
    if (!isConnected) {
      setMessage('Please connect your wallet first')
      return
    }
    if (!rule) {
      setMessage('No active rule for your county/crop.')
      return
    }
    try {
      setMessage('Waiting for wallet signature...')
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'buy',
        args: [BigInt(rule.triggerMm), parseEther(SUM_INSURED_ETH.toString())],
        value: parseEther(premiumEth),
      })
    } catch (err: any) {
      console.error(err)
      setMessage(err?.message || 'Transaction failed')
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">Policy purchased successfully!</p>
          {recorded && <p className="text-green-700 text-sm">Saved to your account.</p>}
          <a href={getExplorerUrl(hash!)} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-sm">
            View transaction on explorer →
          </a>
        </div>
        <p className="text-xs text-gray-500">
          Contract:{' '}
          <a href={getContractUrl()} target="_blank" rel="noopener noreferrer" className="text-[#19a463] hover:underline">
            {CONTRACT_ADDRESS}
          </a>{' '}
          on Base Sepolia
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {loadingRule ? (
        <p className="text-sm text-gray-600">Loading county rule…</p>
      ) : rule ? (
        <div className="text-xs text-neutral-600 space-y-1">
          <p>County rule (auto-locked): trigger ≤ <strong>{rule.triggerMm}mm</strong> · premium <strong>{(parseFloat(rule.premiumRate) * 100).toFixed(2)}%</strong> of sum insured · season {String(rule.seasonStart).slice(0, 10)} → {String(rule.seasonEnd).slice(0, 10)} · coverage {rule.coverageDays} days</p>
          <p>Sum insured: {SUM_INSURED_ETH} ETH · Premium: ~{premiumEth} ETH ({rule.notes})</p>
        </div>
      ) : (
        <p className="text-sm text-amber-700">{ruleError || 'No active rule found for your county/crop.'}</p>
      )}

      <button
        onClick={handleBuy}
        disabled={isPending || isConfirming || !isConnected || !rule}
        className="rounded-full bg-[#19a463] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#00c896] shadow-sm shadow-[#19a463]/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending || isConfirming ? 'Processing...' : `Buy Coverage (${premiumEth} ETH)`}
      </button>

      {error && <p className="text-sm text-red-600">{error.message}</p>}
      {message && !error && <p className="text-sm text-gray-600">{message}</p>}

      <p className="text-xs text-gray-500">
        Contract:{' '}
        <a href={getContractUrl()} target="_blank" rel="noopener noreferrer" className="text-[#19a463] hover:underline">
          {CONTRACT_ADDRESS}
        </a>{' '}
        on Base Sepolia
      </p>
    </div>
  )
}
