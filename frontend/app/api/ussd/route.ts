import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { hashPin, verifyPin, isValidPin } from '@/lib/pin'

const AT_USERNAME = process.env.AT_USERNAME || process.env.AFRICASTALKING_USERNAME || 'sandbox'
const AT_API_KEY = process.env.AT_API_KEY || process.env.AFRICASTALKING_API_KEY

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 8000,
})

function txt(s: string, end = false): NextResponse {
  const body = (end ? 'END ' : 'CON ') + s
  return new NextResponse(body, { headers: { 'Content-Type': 'text/plain' } })
}
const clip = (s: string, max = 150) => ((s || '').length > max ? (s || '').slice(0, max - 3) + '...' : (s || ''))
function short(s: string, max = 20): string { const v = s || ''; return v.length > max ? v.slice(0, max - 1) + '.' : v }
function normPhone(p: string): string { const d = (p || '').replace(/\D/g, ''); return d.length >= 9 ? d.slice(-9) : d }
function phonesMatch(a: string, b: string): boolean {
  const x = (a || '').replace(/\D/g, ''); const y = (b || '').replace(/\D/g, '')
  if (x.length < 7 || y.length < 7) return x === y && x.length > 0
  return x.includes(y) || y.includes(x)
}

async function q(sql: string, params: any[] = []) { return (await db.query(sql, params)).rows }
async function findFarmer(phone: string) {
  const rows = await q("SELECT * FROM farmer_profiles");
  const cands = rows.filter((r: any) => phonesMatch(r.phone_number, phone))
  if (cands.length === 0) return null
  const withPin = cands.find((r: any) => !!r.ussd_pin_hash)
  return withPin || cands[0]
}
async function countiesList(): Promise<string[]> {
  // Prefer the counties master table; fall back to distinct free-text counties only if empty.
  const r = await q("SELECT name FROM counties ORDER BY name");
  if (r.length > 0) return r.map((x: any) => x.name);
  const r2 = await q("SELECT DISTINCT trim(county) AS name FROM farmer_profiles WHERE county IS NOT NULL AND trim(county) <> '' ORDER BY 1");
  return r2.map((x: any) => x.name).filter(Boolean);
}

async function countiesWithRulesList(): Promise<string[]> {
  const r = await q(`SELECT c.name FROM counties c JOIN county_rules cr ON cr.county_id = c.id WHERE cr.active = TRUE GROUP BY c.name ORDER BY c.name`);
  if (r.length > 0) return r.map((x: any) => x.name);
  return countiesList();
}
async function policiesOf(userId: string) { return q('SELECT * FROM policies WHERE user_id = $1 ORDER BY purchased_at DESC', [userId]); }

let fetchWeatherByLocation: any = null
async function weatherFor(loc: string | null) {
  try {
    if (!fetchWeatherByLocation) { const mod: any = await import('@/lib/weather-oracle'); fetchWeatherByLocation = mod.fetchWeatherByLocation }
    if (!loc) return null
    return await fetchWeatherByLocation(loc)
  } catch { return null }
}

async function isOnTopic(q: string): Promise<boolean> {
  const low = q.toLowerCase()
  const topics = ['agroshield','agriculture','agricultural','insurance','policy','payout','premium','trigger','weather','rain','rainfall','county','threshold','ussd','sms','oracle','coverage','cover','buy','crop','farm','drought','soil','harvest','season','plot','claim','account','profile']
  return topics.some(t => low.includes(t))
}

async function tryWeatherReply(q: string): Promise<string | null> {
  const low = q.toLowerCase()
  const counties = await countiesList()
  const found = counties.find(c => low.includes(c.toLowerCase()))
  const asksWeather = low.includes('weather')
  const asksRain = low.includes('rain') || low.includes('rainfall')
  // County named + weather/rain asked -> live weather.
  if (found && (asksWeather || asksRain)) {
    const w = await weatherFor(found + ', Kenya')
    if (!w) return `Weather unavailable for ${short(found)}.`
    return `${short(found, 18)}: Rain ${w.rainfallMm}mm, ${w.temperatureC}C, ${w.humidity}% RH, ${w.description}.`
  }
  // Explicit weather request without a county -> prompt.
  if (asksWeather && !found) return 'Ask with a county name, e.g. "weather in Kitui".'
  return null
}

export async function GET() { void AT_USERNAME; void AT_API_KEY; return new NextResponse('ussd ok', { headers: { 'Content-Type': 'text/plain' } }) }

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const phoneNumber = String(formData.get('phoneNumber') || '')
    const text = String(formData.get('text') || '')
    const inputs = text.split('*').filter((s: string) => s !== '')

    // stateless identity from phone param
    const farmer = await findFarmer(phoneNumber)

    // ---- No farmer registered OR farmer has no PIN ----
    if (!farmer || !farmer.ussd_pin_hash) {
      // Not registered: registration flow OR help
      if (inputs.length === 0) {
        return txt(clip('AgroShield: New number.\n1. Register\n2. Help\n3. Ask assistant'))
      }
      const head = inputs[0]
      if (head === '2') {
        return txt(clip('AgroShield parametric crop cover on Base.\nRegister on web or USSD (1). Dial again.'), true)
      }
      if (head === '3') {
        const q = inputs.slice(1).join(' ').trim()
        if (!q) return txt(clip('Type: 3*your question'))
        const wreply = await tryWeatherReply(q)
        if (wreply) return txt(clip(wreply, 155), true)
        if (!(await isOnTopic(q))) return txt(clip('I can only help with AgroShield and agricultural insurance topics.'), true)
        const key = process.env.OPENAI_API_KEY
        if (!key) return txt(clip('Assistant unavailable. Visit website.'), true)
        try {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'gpt-4o-mini', temperature: 0.2, max_tokens: 120,
              messages: [
                { role: 'system', content: `You are AgroShield Assistant on USSD. ALLOWED: AgroShield, agriculture, crop insurance, weather and rainfall in any county, payouts, USSD and SMS steps, county rules, premiums, triggers, policies. Examples allowed: weather in Kitui, rainfall in Nakuru, how to buy cover, my policy status, what is threshold. REFUSE (reply exactly: I can only help with AgroShield and agricultural insurance topics.) politics, people, sports, coding, math, capitals, jokes. Keep replies under 150 chars, plain text, no markdown, no newlines.` },
                { role: 'user', content: q },
              ],
            }),
          })
          if (!res.ok) return txt(clip('Assistant unavailable. Try website.'), true)
          const data = await res.json()
          const reply = (data?.choices?.[0]?.message?.content || 'No response.').replace(/\s+/g, ' ').trim()
          return txt(clip(reply, 155), true)
        } catch (e) {
          console.error('USSD chat error:', e)
          return txt('Service error, try again.', true)
        }
      }
      if (head !== '1') return txt(clip('Invalid option. 0. Back'), true)

      // Registration steps (inputs = ['1', ...])
      const rt = inputs.slice(1) // registration tokens
      if (rt.length === 0) return txt(clip('Register: set a 4-6 digit PIN.'))
      // rt[0] = PIN
      if (!isValidPin(rt[0])) return txt(clip('PIN must be 4-6 digits. Start over: dial again.'), true)
      if (rt.length === 1) return txt(clip('Repeat the PIN to confirm.'))
      if (rt[1] !== rt[0]) return txt(clip('PINs do not match. Start over.'), true)
      // rt[2] = county selection (maybe with 98 pagination captured inline)
      const counties = await countiesList()
      if (counties.length === 0) return txt(clip('No regions configured. Register on web.'), true)

      // resolve county selection index, allowing 98 pagination inside registration
      let regPage = 0
      let regIndex: number | null = null
      let consumed = 2 // rt indices 0,1 used for PINs
      // find next non-98 token after index 2
      const countyTokens = rt.slice(2)
      let i = 0
      while (i < countyTokens.length && regIndex === null) {
        if (countyTokens[i] === '98') { regPage++; i++; continue }
        if (!isNaN(Number(countyTokens[i]))) { regIndex = regPage * 5 + (Number(countyTokens[i]) - 1); i++; consumed = 2 + i; break }
        i++
      }
      if (regIndex === null) {
        // show county page
        const start = regPage * 5
        const slice = counties.slice(start, start + 5)
        const lines = slice.map((c, i) => `${i + 1}. ${short(c)}`)
        let msg = clip(`Select county:\n${lines.join('\n')}` + (start + 5 < counties.length ? '\n98. Next' : '') + '\n0. Back')
        return txt(msg)
      }
      const county = counties[regIndex]
      if (!county) return txt(clip('Invalid county. 0. Back'), true)

      // next field: plot size (token after consumed county)
      const afterCounty = rt.slice(consumed)
      if (afterCounty.length === 0) return txt(clip(`County: ${short(county)}.\nEnter plot size in acres (e.g. 2.5).`))
      const plotSize = parseFloat(afterCounty[0])
      if (!isFinite(plotSize) || plotSize <= 0) return txt(clip('Invalid plot size. Start over.'), true)

      // crop selection
      if (afterCounty.length === 1) return txt(clip('Crop:\n1. Maize\n2. Beans\n3. Sorghum\n4. Wheat\n0. Back'))
      const cropMap: Record<string,string> = { '1':'maize','2':'beans','3':'sorghum','4':'wheat' }
      const crop = cropMap[afterCounty[1]]
      if (!crop) return txt(clip('Invalid crop. Start over.'), true)

      // national ID
      if (afterCounty.length === 2) return txt(clip('Enter National ID (or 0 to skip).'))
      const nidRaw = afterCounty[2]
      const nationalId = (nidRaw === '0' || nidRaw === '') ? 'N/A' : nidRaw

      const pin = rt[0]
      const normalizedPhone = phoneNumber.replace(/\D/g, '')
      // Create (or reuse) a better-auth user so the same identity works on the web.
      const syntheticEmail = `${normalizedPhone}@ussd.agroshield`
      let uid = `ussd_${normalizedPhone}`
      try {
        const syntheticPassword = `${pin}::ussd-guarded-123`
        const created: any = await auth.api.signUpEmail({
          body: { name: 'USSD User', email: syntheticEmail, password: syntheticPassword },
          headers: await headers(),
        })
        if (created && created.user && created.user.id) uid = created.user.id
      } catch (e: any) {
        try {
          const r = await q('SELECT id FROM "user" WHERE lower(email) = lower($1)', [syntheticEmail])
          if (r.length > 0) uid = r[0].id
        } catch { /* fall back to synthetic uid */ }
      }
      // upsert: if row exists by user_id or phone, update; else insert
      const cidRows = await q('SELECT id FROM counties WHERE lower(name)=lower($1) LIMIT 1', [county])
      const countyId = cidRows.length > 0 ? cidRows[0].id : null
      const existing = await q("SELECT id FROM farmer_profiles WHERE user_id=$1 OR REPLACE(phone_number,' ','')=$2", [uid, phoneNumber.replace(/\D/g,'')])
      if (existing.length > 0) {
        await db.query(`UPDATE farmer_profiles SET user_id=$1, phone_number=$2, national_id=$3, county=$4, county_id=$5, crop_type=$6, plot_size_acres=$7, role='farmer', ussd_pin_hash=$8, updated_at=NOW() WHERE id=$9`,
          [uid, phoneNumber, nationalId, county, countyId, crop, plotSize, hashPin(pin), existing[0].id])
      } else {
        await db.query(`INSERT INTO farmer_profiles (user_id, phone_number, national_id, county, county_id, crop_type, plot_size_acres, role, ussd_pin_hash)
          VALUES ($1,$2,$3,$4,$5,$6,$7,'farmer',$8)`,
          [uid, phoneNumber, nationalId, county, countyId, crop, plotSize, hashPin(pin)])
      }
      return txt(clip('Registration complete. Dial again and enter your PIN to access your account.'), true)
    }

    // ---- Registered farmer path ----
    // auth: input[0] should be the PIN
    const pinCandidate = inputs[0]
    if (inputs.length === 0) {
      // handled earlier
    }
    if (inputs.length >= 1 && !verifyPin(pinCandidate, farmer.ussd_pin_hash)) {
      // Only reject if a PIN was actually entered; empty is handled above
      if (pinCandidate !== '' && pinCandidate.length > 0) {
        return txt(clip('Invalid PIN. Try again or register: dial * fresh.'), true)
      }
    }

    if (inputs.length === 0) {
      return txt(clip('Enter your 4-6 digit PIN.'))
    }
    // Authenticated main menu selection is inputs[1]
    if (inputs.length === 1) {
      // Already validated pinCandidate above only if valid; reaching here with a single valid PIN.
      return txt(clip('PIN ok.\n1. Profile\n2. Policies\n3. Payouts\n4. Weather\n5. Help\n6. Ask assistant\n(PIN*choice)'))
    }

    const action = inputs[1]

    if (action === '5') {
      return txt(clip('AgroShield parametric crop cover on Base.\nUse *384*87051# anytime. View records online.'), true)
    }

    if (action === '1') {
      const msg = clip(`Profile:\nPhone: ${farmer.phone_number}\nCounty: ${farmer.county}\nCrop: ${farmer.crop_type}\nPlot: ${farmer.plot_size_acres} acres\nRole: ${farmer.role}`)
      return txt(msg, true)
    }

    if (action === '2') {
      const list = await policiesOf(farmer.user_id)
      if (inputs.length >= 3 && inputs[2] !== '98' && !isNaN(Number(inputs[2])) && Number(inputs[2]) > 0) {
        const idx = Number(inputs[2]) - 1
        const pol = list[idx]
        if (!pol) return txt(clip('Invalid policy. 0. Back'), true)
        const w = await weatherFor(pol.location || (farmer.county + ', Kenya'))
        const rain = w ? w.rainfallMm : '?'
        const dt = new Date(pol.purchased_at).toLocaleDateString()
        const msg = clip(`Policy #${pol.on_chain_policy_id}: ${pol.status}\nLoc: ${short(pol.location || farmer.county)}\nThreshold: ${pol.threshold_mm}mm\nRain now: ${rain}mm\nCoverage: ${pol.coverage_eth}ETH\nDate: ${dt}`)
        return txt(msg, true)
      }
      if (list.length === 0) return txt(clip('No policies. Buy cover online.'), true)
      const shown = list.slice(0, 5)
      const lines = shown.map((p: any, i: number) => `${i + 1}. #${p.on_chain_policy_id} ${p.status}`)
      let msg = clip(`Policies:\n${lines.join('\n')}` + (list.length > 5 ? '\n98. Next\n0. Back' : '\n0. Back'))
      return txt(msg)
    }

    if (action === '3') {
      const list = (await policiesOf(farmer.user_id)).filter((p: any) => p.status === 'paid')
      if (list.length === 0) return txt(clip('No payouts yet.'), true)
      const shown = list.slice(0, 5)
      const lines = shown.map((p: any, i: number) => `${i + 1}. #${p.on_chain_policy_id} ${p.coverage_eth}ETH`)
      const msg = clip(`Payouts:\n${lines.join('\n')}` + (list.length > 5 ? '\n98. Next\n0. Back' : '\n0. Back'))
      return txt(msg, true)
    }

    if (action === '4') {
      const counties = await countiesList()
      if (counties.length === 0) return txt(clip('No regions configured. Register on web.'), true)
      let page = 0
      const tail = inputs.slice(2)
      for (const t of tail) if (t === '98') page++
      const last = tail[tail.length - 1]
      if (last && last !== '98' && !isNaN(Number(last))) {
        const perPage = 5
        const idx = page * perPage + (Number(last) - 1)
        const county = counties[idx]
        if (!county) return txt(clip('Invalid selection. 0. Back'), true)
        const w = await weatherFor(county + ', Kenya')
        if (!w) return txt(clip(`Weather unavailable for ${short(county)}.`), true)
        const msg = clip(`${short(county, 20)}: Rain ${w.rainfallMm}mm, ${w.temperatureC}C, ${w.humidity}% RH, ${w.description}.`)
        return txt(msg, true)
      }
      const perPage = 5
      const start = page * perPage
      const slice = counties.slice(start, start + perPage)
      if (slice.length === 0) return txt(clip('No more regions. 0. Back'), true)
      const lines = slice.map((c, i) => `${i + 1}. ${short(c)}`)
      let msg = clip(`Select county:\n${lines.join('\n')}` + (start + perPage < counties.length ? '\n98. Next' : '') + '\n0. Back')
      return txt(msg)
    }

    // ---- Ask AgroShield assistant ----
    if (action === '6') {
      if (inputs.length < 3) {
        return txt(clip('Type: PIN*6*your question\ne.g. 2004*6*how do I buy cover?'))
      }
      const question = inputs.slice(1).join(' ').trim()
      if (!question) return txt(clip('Please type a question. 0. Back'), true)
      const wreply = await tryWeatherReply(question)
      if (wreply) return txt(clip(wreply, 155), true)
      if (!(await isOnTopic(question))) return txt(clip('I can only help with AgroShield and agricultural insurance topics.'), true)
      const key = process.env.OPENAI_API_KEY
      if (!key) return txt(clip('Chatbot not configured. Visit website.'), true)
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            temperature: 0.2,
            max_tokens: 120,
            messages: [
              { role: 'system', content: `You are AgroShield Assistant on USSD. ALLOWED: AgroShield, agriculture, crop insurance, weather and rainfall in any county, payouts, USSD and SMS steps, county rules, premiums, triggers, policies. Examples allowed: weather in Kitui, rainfall in Nakuru, how to buy cover, my policy status, what is threshold. REFUSE (reply exactly: I can only help with AgroShield and agricultural insurance topics.) politics, people, sports, coding, math, capitals, jokes. Keep replies under 150 chars, plain text, no markdown, no newlines.` },
              { role: 'user', content: question },
            ],
          }),
        })
        if (!res.ok) return txt(clip('Assistant unavailable. Try website.'), true)
        const data = await res.json()
        const reply = (data?.choices?.[0]?.message?.content || 'No response.').replace(/\s+/g, ' ').trim()
        return txt(clip(reply, 155), true)
      } catch (e) {
        console.error('USSD chat error:', e)
        return txt('Service error, try again.', true)
      }
    }

    return txt(clip('Invalid option. 0. Back'), true)
  } catch (err) {
    console.error('USSD error:', err)
    return txt('Service error, try again.', true)
  }
}
