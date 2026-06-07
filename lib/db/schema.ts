import { pgTable, text, timestamp, boolean, integer, uniqueIndex, index, uuid, jsonb } from 'drizzle-orm/pg-core'

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

export const apiKeys = pgTable('api_keys', {
  id:          uuid('id').defaultRandom().primaryKey(),
  userId:      text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name:        text('name').notNull(),
  keyHash:     text('key_hash').notNull(),
  prefix:      text('prefix').notNull(),           // first 10 chars, used for fast lookup
  revokedAt:   timestamp('revoked_at'),
  lastUsedAt:  timestamp('last_used_at'),
  createdAt:   timestamp('created_at').defaultNow(),
});
 
// ─── NEW: Uploads table ────────────────────────────────────────────────────────
export const uploads = pgTable('uploads', {
  id:            uuid('id').defaultRandom().primaryKey(),
  userId:        text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title:         text('title').notNull(),
  videoId:       text('video_id'),                  // YouTube video ID, set after completion
  privacyStatus: text('privacy_status').notNull().default('unlisted'),
  status:        text('status').notNull().default('pending'), // pending | uploading | completed | failed
  errorMessage:  text('error_message'),
  metadata:      jsonb('metadata'), // Custom key-value pairs
  createdAt:     timestamp('created_at').defaultNow(),
  completedAt:   timestamp('completed_at'),
}, (table) => ({
  userIdIdx: index('idx_uploads_user_id').on(table.userId),
}));

export const apiLogs = pgTable('api_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull(),
  method: text('method').notNull(),
  status: integer('status').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('api_logs_user_id_idx').on(table.userId),
    createdAtIdx: index('api_logs_created_at_idx').on(table.createdAt)
  };
});

// ─── NEW: YouTube Cache table ────────────────────────────────────────────────
export const youtubeCache = pgTable('youtube_cache', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  type:      text('type').notNull(),
  data:      jsonb('data').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_youtube_cache_user_id').on(table.userId),
}));