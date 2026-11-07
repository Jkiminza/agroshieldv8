'use client'

import { useEffect, useRef, useState } from 'react'
import { PlayCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AutoPayout() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const ranOnce = useRef(false)

  const run = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/payout/trigger', { method: 'POST' })
      const data = await res.json()
      setResult(data)
      router.refresh()
    } catch (e: any) {
      setResult({ error: e?.message || 'failed' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ranOnce.current) return
    ranOnce.current = true
    const t = setTimeout(() => run(), 1500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-950">Auto-payout (oracle)</h3>
          <p className="text-xs text-neutral-500">Uses live weather for each policy; pays out if rainfall is below threshold.</p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-[#19a463] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#00c896] disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
          Run auto-payout
        </button>
      </div>
      {result && (
        <pre className="max-h-60 overflow-auto rounded-lg bg-neutral-50 p-3 text-xs text-neutral-700">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
