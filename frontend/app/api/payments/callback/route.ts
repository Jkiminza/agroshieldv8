import { NextRequest, NextResponse } from 'next/server'
import { fulfillPayment } from '@/lib/payments'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  console.log('Pretium callback received:', JSON.stringify(body))
  // Guard: verify a shared secret if configured
  const secret = process.env.PRETIUM_CALLBACK_SECRET
  if (secret) {
    const got = request.headers.get('x-callback-secret') || body?.secret
    if (got !== secret) return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }
  // Best-effort fulfillment if callback carries enough info
  try {
    const phone = body?.shortcode || body?.phone || body?.mobile
    const county = body?.county
    const amount = body?.amount
    const ref = body?.transaction_hash || body?.reference || body?.transaction_code
    if (phone && county && ref) {
      const res = await fulfillPayment({ phone, county, amountKes: Number(amount) || 100, providerRef: String(ref) })
      return NextResponse.json({ ok: true, fulfilled: res })
    }
  } catch (e: any) {
    console.error('callback fulfill failed:', e?.message)
  }
  return NextResponse.json({ ok: true })
}
export async function GET() { return NextResponse.json({ ok: true, message: 'callback endpoint' }) }
