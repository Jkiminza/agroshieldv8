'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { BrandLogo } from '@/components/brand-logo'

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#111827]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <BrandLogo className="text-white" imageClassName="h-12" />

        <div className="hidden items-center gap-7 md:flex">
          <a href="#how-it-works" className="text-sm text-white/70 transition hover:text-[#00d9a8]">How it works</a>
          <a href="#why-us" className="text-sm text-white/70 transition hover:text-[#00d9a8]">Why AgroShield</a>
          <a href="#partners" className="text-sm text-white/70 transition hover:text-[#00d9a8]">Partners</a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/sign-in" className="rounded-lg px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white">Log in</Link>
          <Link href="/sign-up" className="rounded-lg bg-[#00c896] px-4 py-2 text-sm font-semibold text-[#0a0f1e] transition hover:bg-[#00d9a8]">Get covered</Link>
        </div>

        <button aria-label={isOpen ? 'Close menu' : 'Open menu'} className="rounded-lg p-2 text-white md:hidden" onClick={() => setIsOpen((open) => !open)}>
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-white/10 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <a href="#how-it-works" onClick={() => setIsOpen(false)} className="py-2 text-sm text-white/75">How it works</a>
            <a href="#why-us" onClick={() => setIsOpen(false)} className="py-2 text-sm text-white/75">Why AgroShield</a>
            <a href="#partners" onClick={() => setIsOpen(false)} className="py-2 text-sm text-white/75">Partners</a>
            <Link href="/sign-in" onClick={() => setIsOpen(false)} className="py-2 text-sm text-white/75">Log in</Link>
            <Link href="/sign-up" onClick={() => setIsOpen(false)} className="rounded-lg bg-[#00c896] px-4 py-2.5 text-center text-sm font-semibold text-[#0a0f1e]">Get covered</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
