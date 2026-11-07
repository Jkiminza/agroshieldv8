import { NextRequest, NextResponse } from 'next/server'

// ThriveVas delivery report (DLR) callback.
// ThriveVas POSTs JSON: { msisdn, status, country, network, status_description, transaction_id }
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  console.log('ThriveVas DLR received:', JSON.stringify(body))
  // TODO: persist to sms_log table if added; for now just acknowledge.
  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'DLR endpoint' })
}
