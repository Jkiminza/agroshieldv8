import { NextRequest, NextResponse } from 'next/server'
import { validateDestination } from '@/lib/pretium'
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { currency = 'KES', ...fields } = body
  const res = await validateDestination(currency, fields)
  return NextResponse.json(res, { status: res.success ? 200 : 400 })
}
