import { pgTable, text, timestamp, boolean, integer, uniqueIndex, index } from 'drizzle-orm/pg-core'

// Better Auth Tables
export const user = pgTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').unique().notNull(),
    emailVerified: boolean('emailVerified').notNull().default(false),
    image: text('image'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex('idx_user_email').on(table.email),
  })
)

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expiresAt').notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_session_userId').on(table.userId),
  })
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    idToken: text('idToken'),
    password: text('password'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_account_userId').on(table.userId),
  })
)

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})


// Creator Platform Tables
export const youtubeAccount = pgTable(
  'youtube_account',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    channelId: text('channelId').unique().notNull(),
    channelName: text('channelName').notNull(),
    thumbnailUrl: text('thumbnailUrl'),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    expiresAt: timestamp('expiresAt'),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_youtube_account_userId').on(table.userId),
  })
)

