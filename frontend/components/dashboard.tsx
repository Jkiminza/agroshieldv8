'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, CircleHelp, CloudRain, LayoutDashboard, LogOut, Menu, ShieldCheck, Wallet, X } from 'lucide-react'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { BrandLogo } from '@/components/brand-logo'
import { WalletConnectButton } from '@/components/wallet-connect-button'
import BuyCoverageButton from '@/components/BuyCoverageButton'

interface DashboardProps {
  user: { name: string; email: string; role?: string } | null
  profile?: {
    phoneNumber: string
    nationalId: string
    county: string
    cropType: string
    plotSizeAcres: string
    role: string
  } | null
}

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Coverage', href: '/dashboard/coverage', icon: ShieldCheck },
  { label: 'Weather Monitor', href: '/dashboard/weather', icon: CloudRain },
  { label: 'Payouts', href: '/dashboard/payouts', icon: Wallet },
  { label: 'Profile', href: '/dashboard/profile', icon: CircleHelp },
]

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e7f6ee] text-[#16834e]"><ShieldCheck size={22} /></div>
      <h2 className="mt-5 text-xl font-semibold text-neutral-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">{description}</p>
    </div>
  )
}

export function Dashboard({ user, profile }: DashboardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const onLogout = async () => {
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }
  const displayName = user?.name || 'Farmer'
  const initials = displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const pageTitle = pathname === '/dashboard' ? 'Overview' : navItems.find((item) => item.href === pathname)?.label || 'Dashboard'

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <div className="flex min-h-screen">
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-neutral-200 bg-white px-5 py-6 transition-transform lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between px-2">
            <BrandLogo href="/dashboard" className="text-neutral-950" imageClassName="h-14" />
            <button aria-label="Close navigation" className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 lg:hidden" onClick={() => setMobileOpen(false)}><X size={20} /></button>
          </div>
          <div className="mt-10 rounded-2xl bg-[#e7f6ee] p-4"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#19a463] font-bold text-white">{initials}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{displayName}</p><p className="text-xs text-[#16834e]">{profile?.role === 'partner' ? 'Partner account' : 'Farmer account'}</p></div></div><p className="mt-4 border-t border-[#ccebd9] pt-3 text-xs leading-5 text-[#276749]">Your account is connected. Add a coverage plan to start seeing live farm data.</p></div>
          <nav className="mt-8 flex-1 space-y-1" aria-label="Dashboard navigation">
            {navItems.map(({ label, href, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${pathname === href ? 'bg-[#19a463] text-[#0a0a0a]' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950'}`}><Icon size={19} />{label}</Link>)}
          </nav>
          <div className="space-y-1 border-t border-neutral-100 pt-5"><button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950"><CircleHelp size={19} />Help center</button><button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-neutral-500 hover:bg-red-50 hover:text-red-600"><LogOut size={19} />Log out</button></div>
        </aside>
        {mobileOpen && <button aria-label="Close navigation overlay" className="fixed inset-0 z-30 bg-neutral-950/20 lg:hidden" onClick={() => setMobileOpen(false)} />}
        <section className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-neutral-200 bg-white px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <button aria-label="Open navigation" className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#16834e]">Farmer portal</p>
                <h1 className="mt-1 text-xl font-semibold">{pageTitle}</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <WalletConnectButton />
              <button aria-label="Notifications" className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100"><Bell size={20} /></button>
              <span className="hidden text-sm font-medium text-neutral-500 sm:block">{displayName}</span>
            </div>
          </header>
          <div className="mx-auto max-w-6xl space-y-7 p-5 sm:p-10">
            {pathname === '/dashboard' ? <><div><p className="text-sm text-neutral-500">Welcome back, {displayName.split(' ')[0]}.</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Protect your farm with confidence.</h2><p className="mt-3 max-w-2xl text-base leading-7 text-neutral-500">Your dashboard will show coverage, weather signals, and payouts once your AgroShield plan is connected.</p></div><div className="mt-6"><BuyCoverageButton /></div><div className="grid gap-5 md:grid-cols-3"><EmptyState title="No coverage yet" description="Your active coverage plans will appear here once you enroll a plot." /><EmptyState title="No weather data connected" description="Weather monitoring will begin after a coverage location is set." /><EmptyState title="No payouts yet" description="Payout history will appear here after a verified trigger event." /></div></> : pathname === '/dashboard/coverage' ? <div className="space-y-6"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Your Coverage</h2><BuyCoverageButton /></div><EmptyState title="No coverage plans" description="You have not added a coverage plan yet. Start by completing your farm profile." /></div> : pathname === '/dashboard/weather' ? <EmptyState title="Weather monitoring is not connected" description="Connect a covered plot to begin receiving location-specific weather monitoring." /> : pathname === '/dashboard/payouts' ? <EmptyState title="No payouts yet" description="Verified payouts will appear here when a coverage trigger is reached." /> : <div className="rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm"><h2 className="text-xl font-semibold">Your profile</h2><dl className="mt-6 grid gap-5 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Name</dt><dd className="mt-1 text-sm font-medium">{displayName}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Email</dt><dd className="mt-1 text-sm font-medium">{user?.email}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Account type</dt><dd className="mt-1 text-sm font-medium">{user?.role === 'partner' ? 'Partner' : 'Farmer'}</dd></div></dl></div>}
          </div>
        </section>
      </div>
    </main>
  )
}
