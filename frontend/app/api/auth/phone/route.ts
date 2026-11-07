import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { farmerProfiles } from '@/lib/db/schema'
import { verifyPin } from '@/lib/pin'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { phone, pin } = await request.json()
    if (!phone || !pin) return NextResponse.json({ error: 'Missing phone or PIN' }, { status: 400 })

    const normalized = String(phone).replace(/\D/g, '')
    const syntheticEmail = `${normalized}@ussd.agroshield`

    const rows = await db.select().from(farmerProfiles).where(eq(farmerProfiles.phoneNumber, phone)).limit(1)
    // tolerant lookup by normalized
    const candidates = rows.length ? rows : (await db.select().from(farmerProfiles)).filter((r: any) => String(r.phoneNumber || '').replace(/\D/g, '').slice(-9) === normalized.slice(-9))
    if (candidates.length === 0 || !candidates[0].ussdPinHash) {
      return NextResponse.json({ error: 'No account for that phone' }, { status: 404 })
    }
    if (!verifyPin(String(pin), candidates[0].ussdPinHash)) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }

    const combinedPassword = `${String(pin)}::ussd-guarded-123`
    const signInReq = new Request(new URL('/api/auth/sign-in/email', request.url), {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ email: syntheticEmail, password: combinedPassword }),
    })
    const res = await auth.handler(signInReq)
    const response = NextResponse.json({ ok: res.ok }, { status: res.status })
    res.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') response.headers.append('set-cookie', value)
    })
    if (!res.ok) {
      const err = await res.text().catch(() => '')
      return NextResponse.json({ error: err || 'Sign-in failed' }, { status: res.status })
    }
    return response
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
