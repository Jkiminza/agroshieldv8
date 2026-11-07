'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { syncPoliciesFromChain } from '@/app/actions/policies'

export function SyncPolicies() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [status, setStatus] = useState('')

  const sync = async () => {
    if (!isConnected || !address) {
      setStatus('Connect your wallet first.')
      return
    }
    setStatus('Syncing…')
    try {
      const res = await syncPoliciesFromChain(address)
      if (res.inserted.length > 0) {
        setStatus(`Imported ${res.inserted.length} polic${res.inserted.length > 1 ? 'ies' : 'y'}.`)
        router.refresh()
      } else {
        setStatus('No new policies to import.')
      }
    } catch (e: any) {
      setStatus(e?.message || 'Sync failed')
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      sync()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address])

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={sync}
        disabled={!isConnected}
        className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
      >
        <RefreshCw size={14} />
        Sync on-chain policies
      </button>
      {status && <span className="text-xs text-neutral-500">{status}</span>}
    </div>
  )
}
