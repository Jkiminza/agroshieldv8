'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'

export function Marketplace() {
  const [query, setQuery] = useState('')

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-5 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#72d6a1]">Marketplace</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Invoice opportunities</h1><p className="mt-4 text-base leading-7 text-white/60">Live opportunities will appear here when verified invoices are available.</p></div>
        <div className="mt-10 flex max-w-xl items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3"><Search size={18} className="text-white/45" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search available opportunities" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40" /></div>
        <div className="mt-8 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-12 text-center"><h2 className="text-xl font-semibold">No live listings yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/55">We are not showing sample listings. Once verified invoice data is connected, eligible opportunities will be listed here.</p>{query && <p className="mt-5 text-xs text-[#72d6a1]">No results for “{query}”.</p>}</div>
      </div>
    </main>
  )
}
