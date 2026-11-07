import { NextRequest, NextResponse } from 'next/server'
import { status } from '@/lib/pretium'
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { currency = 'KES', ...payload } = body
  const res = await status(currency, payload)
  return NextResponse.json(res, { status: res.success ? 200 : 400 })
}
