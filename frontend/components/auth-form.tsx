'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { saveFarmerProfile, savePartnerProfile } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { BrandLogo } from '@/components/brand-logo'
import { X } from 'lucide-react'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [county, setCounty] = useState('')
  const [cropType, setCropType] = useState('maize')
  const [plotSize, setPlotSize] = useState('')
  const [role, setRole] = useState<'farmer' | 'partner'>('farmer')
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPin, setLoginPin] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [usePhone, setUsePhone] = useState(false)

  const isSignUp = mode === 'sign-up'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = isSignUp
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password })

      if (result.error) {
        const message = result.error.message?.toLowerCase() ?? ''
        if (message.includes('already') || message.includes('exist')) {
          setError('An account with this email already exists. Try signing in instead.')
        } else if (message.includes('password')) {
          setError('Use a password with at least 8 characters.')
        } else {
          setError(result.error.message ?? 'Unable to create your account. Please check your details and try again.')
        }
        return
      }

      if (isSignUp) {
        if (role === 'farmer') {
          await saveFarmerProfile({
            phoneNumber,
            nationalId,
            county,
            cropType,
            plotSizeAcres: plotSize,
            role,
            pin: pin.trim() || undefined,
          })
          router.push('/dashboard')
          router.refresh()
        } else {
          await savePartnerProfile()
          setShowSuccess(true)
        }
      } else if (usePhone) {
        const res = await fetch('/api/auth/phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: loginPhone, pin: loginPin }),
          credentials: 'include',
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data?.error || 'Unable to sign in with phone/PIN.')
          return
        }
        router.push('/dashboard')
        router.refresh()
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-svh bg-muted/40 px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-primary/5">
        <Link
          href="/"
          aria-label="Close and return to home"
          className="absolute right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition hover:bg-black/50 lg:border-border lg:bg-card/80 lg:text-foreground lg:hover:bg-muted"
        >
          <X size={20} aria-hidden="true" />
        </Link>
        <aside className="relative hidden w-[38%] flex-col justify-between overflow-hidden bg-primary p-8 text-primary-foreground lg:flex xl:p-10">
            <div
              className={`absolute inset-0 bg-cover bg-center opacity-100`}
              style={{ backgroundImage: `url(/${isSignUp ? 'signup-farmers.jpg' : 'signin-farmers.jpg'})` }}
              aria-hidden="true"
            />
            <div className={`absolute inset-0 bg-black/70`} aria-hidden="true" />
            <BrandLogo className="relative z-10 text-black" imageClassName="h-14" />
            <div className="relative z-10 max-w-sm">
              <p className={`mb-4 text-sm font-medium uppercase tracking-[0.2em] text-white/85`}>Your harvest. Protected.</p>
              <h2 className="text-balance text-4xl font-semibold leading-tight xl:text-5xl">{isSignUp ? 'Build a stronger season from day one.' : 'Protect your harvest with confidence.'}</h2>
              <p className={`mt-5 text-base leading-7 text-white/85`}>{isSignUp ? role === 'farmer' ? 'Create your profile to access weather-backed cover, fast payouts, and practical tools for your farm.' : 'Create your partner profile and connect with a team building stronger farming communities.' : 'Sign in to manage your cover, view your protection, and keep your harvest moving forward.'}</p>
              <div className={`mt-8 flex items-center gap-3 text-sm text-white/85`}>
                <span className="flex size-8 items-center justify-center rounded-full bg-primary-foreground/15">✓</span>
                <span>Simple, transparent protection</span>
              </div>
            </div>
            <p className={`relative z-10 text-xs text-white/70`}>Trusted tools for the people growing tomorrow.</p>
          </aside>

        <section className="flex w-full flex-col justify-center p-6 sm:p-10 lg:w-[62%] lg:p-12 xl:p-16">
          <div className="mx-auto w-full max-w-xl">
            <div className="mb-8">
              <BrandLogo className="mb-5 text-foreground lg:hidden" imageClassName="h-12" />
              <p className="mb-2 text-sm font-medium text-primary">{isSignUp ? 'Start your protection plan' : 'Welcome back'}</p>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {isSignUp ? 'Create your account' : 'Sign in to AgroShield'}
              </h1>
              <p className="mt-3 max-w-md text-pretty text-sm leading-6 text-muted-foreground">
                {isSignUp ? role === 'farmer' ? 'Tell us a little about yourself and your farm. It only takes a few minutes.' : 'Share your details and our team will contact you about partnering with AgroShield.' : 'Sign in to manage your cover and keep your harvest moving forward.'}
              </p>
            </div>

            {showSuccess ? (
              <div className="rounded-2xl border border-primary/20 bg-accent/50 p-6 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">✓</div>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Thanks for signing up</h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Your partner account is ready. Our team will review your details and reach out to you soon with the next steps.</p>
                <Button type="button" onClick={() => router.push('/')} className="mt-6 w-full rounded-xl">Back to AgroShield</Button>
              </div>
            ) : (
              <>
            {!isSignUp && (
                <div className="flex items-center justify-between rounded-xl bg-muted p-1">
                  <button type="button" onClick={() => setUsePhone(false)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${!usePhone ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>Email + password</button>
                  <button type="button" onClick={() => setUsePhone(true)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${usePhone ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>Phone + PIN</button>
                </div>
              )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {isSignUp && (
                <fieldset className="flex flex-col gap-2">
                  <legend className="text-sm font-medium text-foreground">I&apos;m signing up as</legend>
                  <div className="grid grid-cols-2 rounded-xl bg-muted p-1">
                    {(['farmer', 'partner'] as const).map((option) => (
                      <button key={option} type="button" onClick={() => setRole(option)} aria-pressed={role === option} className={`rounded-lg px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${role === option ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                        {option}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Choose the account type that best describes you.</p>
                </fieldset>
              )}

              {isSignUp && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">{role === 'partner' ? 'Partner name' : 'Full name'}</Label>
                  <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder={role === 'partner' ? 'Your name or organization' : 'e.g. Amina Wanjiku'} required autoComplete="name" />
                </div>
              )}

              {isSignUp && role === 'farmer' && (
                <>
                  <div className="rounded-xl border border-primary/15 bg-accent/50 px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">Farmer details</p>
                    <p className="mt-1 text-xs text-muted-foreground">These details help us tailor protection to your farm.</p>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input id="phone" type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="+254 700 000 000" required autoComplete="tel" />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="county">County / sub-county</Label>
                      <Input id="county" value={county} onChange={(event) => setCounty(event.target.value)} placeholder="Where is your farm?" required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="plotSize">Farm size <span className="font-normal text-muted-foreground">(acres)</span></Label>
                      <Input id="plotSize" type="number" min="0.1" step="0.1" value={plotSize} onChange={(event) => setPlotSize(event.target.value)} placeholder="e.g. 2.5" required />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="cropType">Main crop</Label>
                      <select id="cropType" value={cropType} onChange={(event) => setCropType(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-ring" required>
                        <option value="maize">Maize</option><option value="beans">Beans</option><option value="sorghum">Sorghum</option><option value="wheat">Wheat</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="nationalId">National ID</Label>
                      <Input id="nationalId" value={nationalId} onChange={(event) => setNationalId(event.target.value)} placeholder="For secure KYC" required autoComplete="off" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <Label htmlFor="pin">USSD PIN <span className="font-normal text-muted-foreground">(4-6 digits, for phone login)</span></Label>
                    <Input id="pin" type="password" inputMode="numeric" value={pin} onChange={(event) => setPin(event.target.value)} placeholder="Optional" minLength={4} maxLength={6} autoComplete="off" />
                  </div>
                </>
              )}

              {isSignUp && role === 'partner' && (
                <div className="rounded-xl border border-border bg-muted/50 px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">Partner onboarding</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Create your partner account with your name and email. Our team will reach out to you with the next steps.</p>
                </div>
              )}

{!(usePhone && !isSignUp) && (
              <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required={!usePhone || isSignUp} autoComplete="email" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between"><Label htmlFor="password">Password</Label>{isSignUp && <span className="text-xs text-muted-foreground">8+ characters</span>}</div>
                <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isSignUp ? "Create a secure password" : "Your password"} required={!usePhone || isSignUp} minLength={isSignUp ? 8 : 1} autoComplete={isSignUp ? 'new-password' : 'current-password'} />
              </div>
              </>
            )}

              {usePhone && !isSignUp && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="loginPhone">Phone number</Label>
                    <Input id="loginPhone" type="tel" value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} placeholder="+254 700 000 000" required autoComplete="tel" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="loginPin">USSD PIN</Label>
                    <Input id="loginPin" type="password" inputMode="numeric" value={loginPin} onChange={(e) => setLoginPin(e.target.value)} placeholder="4-6 digits" required minLength={4} maxLength={6} autoComplete="off" />
                  </div>
                </>
              )}

              {error && <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">{error}</p>}
              <Button type="submit" disabled={loading} className="mt-1 h-11 w-full rounded-xl text-sm font-semibold shadow-sm">
                {loading ? 'Please wait...' : isSignUp ? 'Create my AgroShield account' : 'Sign in to AgroShield'}
              </Button>
            </form>
              </>
            )}

            <p className="mt-7 text-center text-sm text-muted-foreground">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Link href={isSignUp ? '/sign-in' : '/sign-up'} className="font-semibold text-primary underline-offset-4 hover:underline">{isSignUp ? 'Sign in' : 'Sign up'}</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
