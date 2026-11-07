// Pretium (xwift.africa) — Off-ramp: convert on-chain stablecoins to local fiat (KES mobile money).
// Docs flow: validate destination -> (optional) quote -> send stablecoins to settlement address ->
//            POST /v1/pay/{currency} with transaction_hash + payout fields -> poll /v1/status/{currency}.
// Auth: x-api-key header (consumer key).

const BASE = process.env.PRETIUM_BASE_URL || 'https://api.xwift.africa'
const KEY = process.env.PRETIUM_API_KEY

function headers() {
  return { 'x-api-key': KEY || '', 'Content-Type': 'application/json' }
}

export interface PretiumResult { success: boolean; data?: any; error?: string; status?: number }

async function call(method: string, path: string, body?: any): Promise<PretiumResult> {
  if (!KEY) return { success: false, error: 'PRETIUM_API_KEY not set' }
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: headers(),
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { success: false, error: data?.message || data?.error || `HTTP ${res.status}`, status: res.status, data }
    return { success: true, data, status: res.status }
  } catch (e: any) {
    return { success: false, error: e?.message || 'network error' }
  }
}

// 1. Validate destination (account name / validity)
export async function validateDestination(currency: string, fields: Record<string, any>) {
  return call('POST', `/v1/validation/${encodeURIComponent(currency)}`, fields)
}

// 2. (Optional) Quote / ramp lock
export async function exchangeRate(payload: Record<string, any>) {
  return call('POST', '/v1/exchange-rate', payload)
}

// 0. Onramp: collect local fiat (M-Pesa) and settle stablecoins to a wallet address
export async function onramp(currency: string, payload: {
  shortcode: string
  amount: number
  mobile_network: string
  address: string
  chain: 'BASE' | 'CELO'
  asset: 'USDC' | 'USDT'
  callback_url?: string
}) {
  // Pretium expects a 10-digit shortcode with leading 0 (e.g. 0742109476), not a 12-digit MSISDN.
  const digits = (payload.shortcode || '').replace(/\D/g, '')
  const shortcode = digits.length === 12 && digits.startsWith('254')
    ? '0' + digits.slice(3)
    : digits
  const body = { ...payload, shortcode, amount: Math.max(100, Math.round(payload.amount)) }
  return call('POST', `/v1/onramp/${encodeURIComponent(currency)}`, body)
}

// 3. Disburse fiat (off-ramp) — requires transaction_hash proof of stablecoin deposit
export async function pay(currency: string, payload: {
  transaction_hash: string
  chain: string
  type: 'MOBILE' | 'BANK'
  shortcode?: string
  account_number?: string
  bank_code?: string
  amount: number
  mobile_network?: string
  callback_url?: string
}) {
  return call('POST', `/v1/pay/${encodeURIComponent(currency)}`, payload)
}

// 4. Poll status
export async function status(currency: string, payload: { transaction_hash?: string; reference?: string }) {
  return call('POST', `/v1/status/${encodeURIComponent(currency)}`, payload)
}
