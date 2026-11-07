import { NextRequest, NextResponse } from 'next/server'
import { pay } from '@/lib/pretium'
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { currency = 'KES', ...payload } = body
  const res = await pay(currency, payload)
  return NextResponse.json(res, { status: res.success ? 200 : 400 })
}
