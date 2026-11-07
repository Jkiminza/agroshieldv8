import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { counties, countyRules } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const countyName = searchParams.get('county')
    const crop = searchParams.get('crop') || 'maize'
    if (!countyName) {
      return NextResponse.json({ error: 'Missing county' }, { status: 400 })
    }
    const countyRows = await db.select().from(counties).where(eq(counties.name, countyName))
    let county = countyRows[0]
    if (!county) {
      // tolerant fuzzy
      const all = await db.select().from(counties)
      const norm = (s: string) => s.toLowerCase().trim()
      county = all.find(c => norm(c.name) === norm(countyName)) as any
    }
    if (!county) {
      return NextResponse.json({ rule: null, reason: 'county-not-in-db' })
    }
    const rules = await db.select().from(countyRules).where(and(eq(countyRules.countyId, county.id), eq(countyRules.crop, crop), eq(countyRules.active, true)))
    if (rules.length === 0) {
      return NextResponse.json({ rule: null, county: county.name, reason: 'no-active-rule' })
    }
    const r = rules[0]
    return NextResponse.json({
      rule: {
        id: r.id,
        countyId: r.countyId,
        county: county.name,
        crop: r.crop,
        triggerMm: r.triggerMm,
        exitMm: r.exitMm,
        seasonStart: r.seasonStart,
        seasonEnd: r.seasonEnd,
        coverageDays: r.coverageDays,
        premiumRate: r.premiumRate,
        active: r.active,
        notes: r.notes,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
