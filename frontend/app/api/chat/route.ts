import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are AgroShield Assistant, a strictly scoped chatbot. SCOPE: only AgroShield platform, parametric crop insurance, agriculture, weather, rainfall, county rules, payouts, USSD, SMS, wallets, and related topics. OUT OF SCOPE: general knowledge, politics, people, history, sports, entertainment, coding help unrelated to the platform, and anything not about AgroShield/agriculture/insurance. If a question is out of scope, reply exactly: "I can only help with AgroShield and agricultural insurance topics." Do not answer general-knowledge questions, even if you know the answer. Refuse politely and briefly.

You are AgroShield Assistant, a helpful chatbot for AgroShield — a parametric drought-insurance platform for smallholder farmers in Kenya, built on Base Sepolia (EVM) and available over USSD and SMS.

Key facts you know:
- Coverage: farmers choose a county + crop; a rainfall threshold (trigger) and exit value are locked from county_rules at purchase (not buyer-chosen). Premium = sum insured × premium_rate (e.g. 3–5%).
- Payout: if observed seasonal rainfall is below the trigger (and > 0 mm), the policy pays out the full coverage amount automatically on-chain. If rainfall is at/above the trigger, no payout.
- Weather: live rainfall from OpenWeatherMap; historical CHIRPS 1991–2025 used to calibrate triggers (percentiles p5/p10/p20/p50).
- Channels: website (email or phone+PIN), USSD (*384*87051# sandbox) with menus: profile, policies, payouts, weather by county, help, and PIN-gated registration; SMS notifications (welcome, policy confirmation, payout, weather alert).
- Identity: phone number + USSD PIN (4–6 digits) shared between USSD and web.
- Contracts: PolicyContract on Base Sepolia at 0x9C478BC167cE2673fd3c5631601D31D2D50E49fF; buy(threshold, coverage) payable; report(id, value, hash) oracle-only; settle(id) anyone.
- Counties: 47 Kenya counties; only counties with an active county_rule are purchasable (demo rules: Mandera, Nakuru, Kisumu, Kitui).
- Auto-payout: server oracle reads live rainfall per policy location, reports, and settles if below threshold.
- Tech stack: Next.js 16, Tailwind, Drizzle ORM, Neon Postgres, wagmi/RainbowKit, viem, better-auth, Africa's Talking.

Answer concisely and helpfully. If asked about buying, explain the website flow (connect wallet → Buy Coverage on /dashboard/coverage, only if an active rule exists for their county/crop). If asked about USSD, give the menu steps. If asked about a feature not implemented (Pretium mobile-money purchase, county-rule master data, multi-hazard), say it's planned/needs their input. Never invent policy numbers, balances, or tx hashes. Never ask for or repeat private keys. Keep replies under ~120 words.`

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Chatbot not configured' }, { status: 500 })
  }
  try {
    const { messages } = await request.json()
    const safe = Array.isArray(messages) ? messages.slice(-10) : []
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 350,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...safe.map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '') }))],
      }),
    })
    if (!res.ok) {
      const t = await res.text()
      return NextResponse.json({ error: `OpenAI ${res.status}: ${t.slice(0, 200)}` }, { status: 502 })
    }
    const data = await res.json()
    const reply = data?.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.'
    return NextResponse.json({ reply })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
