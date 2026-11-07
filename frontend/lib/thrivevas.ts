// ThriveVas SMS provider (https://sms.thrivevas.com). Auth via x-api-key.
// Supports static API key (THRIVEVAS_API_KEY) or token generation from MSISDN+password.

const BASE = process.env.THRIVEVAS_BASE_URL || 'https://sms.thrivevas.com'
const IDENTITY = process.env.THRIVEVAS_IDENTITY_URL || 'https://identity.thrivevas.com'
let cachedToken: { token: string; expiresAt: number } | null = null

export async function generateThriveVasToken(): Promise<string | null> {
  const msisdn = process.env.THRIVEVAS_MSISDN
  const password = process.env.THRIVEVAS_PASSWORD
  if (!msisdn || !password) return null
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token
  try {
    const auth = Buffer.from(`${msisdn}:${password}`).toString('base64')
    const res = await fetch(`${IDENTITY}/v1/auth/api-key/generate`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'agroshield', lifetime_seconds: 86400 }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data?.token) return null
    cachedToken = { token: data.token, expiresAt: Date.now() + 86400 * 1000 }
    return data.token
  } catch {
    return null
  }
}

export async function thriveVasSendSMS(params: { to: string; message: string; from?: string; callbackUrl?: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.THRIVEVAS_API_KEY || (await generateThriveVasToken())
  if (!apiKey) return { success: false, error: 'ThriveVas API key not configured' }
  try {
    const res = await fetch(`${BASE}/v1/message/send`, {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: params.message,
        msisdn: params.to,
        sender_id: params.from || process.env.THRIVEVAS_SENDER_ID || 'ThriveVas',
        callback_url: params.callbackUrl,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && (data.status === 200 || /success/i.test(data.message || ''))) {
      return { success: true, messageId: String(data.transaction_id || data.message_id || '') }
    }
    return { success: false, error: data.message || `HTTP ${res.status}` }
  } catch (e: any) {
    return { success: false, error: String(e?.message || e) }
  }
}
