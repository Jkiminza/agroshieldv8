'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { farmerProfiles, partnerProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export type ProfileInput = {
  phoneNumber: string
  nationalId: string
  county: string
  cropType: string
  plotSizeAcres: string
  role: 'farmer' | 'partner'
}

export async function saveFarmerProfile(input: ProfileInput) {
  const userId = await getUserId()
  const values = {
    userId,
    phoneNumber: input.phoneNumber.trim(),
    nationalId: input.nationalId.trim(),
    county: input.county.trim(),
    cropType: input.cropType,
    plotSizeAcres: input.plotSizeAcres,
    role: input.role,
    updatedAt: new Date(),
  }

  const parsedPlotSize = Number(values.plotSizeAcres)
  if (!values.phoneNumber || !values.nationalId || !values.county || !values.plotSizeAcres) {
    throw new Error('Complete all farm profile fields before continuing.')
  }
  if (!Number.isFinite(parsedPlotSize) || parsedPlotSize <= 0) {
    throw new Error('Enter a valid farm size greater than zero.')
  }

  const existing = await db.select({ id: farmerProfiles.id }).from(farmerProfiles).where(eq(farmerProfiles.userId, userId)).limit(1)

  if (existing.length > 0) {
    await db.update(farmerProfiles).set(values).where(eq(farmerProfiles.userId, userId))
  } else {
    await db.insert(farmerProfiles).values(values)
  }
}

export async function savePartnerProfile() {
  const userId = await getUserId()
  const existing = await db.select({ id: partnerProfiles.id }).from(partnerProfiles).where(eq(partnerProfiles.userId, userId)).limit(1)

  if (existing.length > 0) {
    await db.update(partnerProfiles).set({ updatedAt: new Date() }).where(eq(partnerProfiles.userId, userId))
  } else {
    await db.insert(partnerProfiles).values({ userId })
  }
}

export async function getFarmerProfile() {
  const userId = await getUserId()
  const rows = await db.select().from(farmerProfiles).where(eq(farmerProfiles.userId, userId)).limit(1)
  return rows[0] ?? null
}
