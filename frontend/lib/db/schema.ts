import { pgTable, text, timestamp, boolean, serial, decimal, date, varchar } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Add your app tables below. Always include a plain `userId` column so queries
// can be scoped per user — the security model depends on this column existing,
// not on a foreign key. Do NOT add a foreign key constraint
// (`.references(() => user.id, ...)`) unless the user explicitly asks for
// foreign keys or referential integrity; FK constraints make iterating on the
// schema harder.
//
// App tables for AgroShield

export const partnerProfiles = pgTable('partner_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const farmerProfiles = pgTable('farmer_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  phoneNumber: varchar('phone_number', { length: 30 }).notNull(),
  nationalId: varchar('national_id', { length: 80 }).notNull(),
  county: varchar('county', { length: 120 }).notNull(),
  cropType: varchar('crop_type', { length: 50 }).notNull(),
  plotSizeAcres: decimal('plot_size_acres', { precision: 10, scale: 2 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('farmer'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  invoiceNumber: varchar('invoiceNumber', { length: 50 }).notNull().unique(),
  clientName: varchar('clientName', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('KES'),
  invoiceDate: date('invoiceDate').notNull(),
  dueDate: date('dueDate').notNull(),
  description: text('description'),
  pdfUrl: text('pdfUrl'),
  status: varchar('status', { length: 20 }).default('draft'),
  discountRate: decimal('discountRate', { precision: 5, scale: 2 }).default('0'),
  minimumFundingAmount: decimal('minimumFundingAmount', { precision: 15, scale: 2 }),
  fundingDeadline: date('fundingDeadline'),
  allowPartialFunding: boolean('allowPartialFunding').default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const marketplaceListings = pgTable('marketplace_listings', {
  id: serial('id').primaryKey(),
  invoiceId: serial('invoiceId').notNull(),
  businessName: varchar('businessName', { length: 255 }).notNull(),
  country: varchar('country', { length: 100 }),
  sector: varchar('sector', { length: 100 }),
  facingValue: decimal('facingValue', { precision: 15, scale: 2 }).notNull(),
  discountedPrice: decimal('discountedPrice', { precision: 15, scale: 2 }).notNull(),
  expectedReturn: decimal('expectedReturn', { precision: 5, scale: 2 }).notNull(),
  durationDays: serial('durationDays').notNull(),
  fundedPercentage: decimal('fundedPercentage', { precision: 5, scale: 2 }).default('0'),
  isOpen: boolean('isOpen').default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const investments = pgTable('investments', {
  id: serial('id').primaryKey(),
  investorId: text('investorId').notNull(),
  listingId: serial('listingId').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  xlmAmount: decimal('xlmAmount', { precision: 15, scale: 2 }),
  investmentDate: timestamp('investmentDate').notNull().defaultNow(),
  expectedReturnDate: date('expectedReturnDate'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }),
  description: text('description'),
  transactionDate: timestamp('transactionDate').notNull().defaultNow(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
