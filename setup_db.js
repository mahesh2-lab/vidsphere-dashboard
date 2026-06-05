const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    await pool.query('DROP TABLE IF EXISTS youtube_channel CASCADE');
    console.log('Dropped youtube_channel table');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "youtube_account" (
        "id" text PRIMARY KEY NOT NULL,
        "userId" text NOT NULL,
        "channelId" text NOT NULL,
        "channelName" text NOT NULL,
        "thumbnailUrl" text,
        "accessToken" text,
        "refreshToken" text,
        "expiresAt" timestamp,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now(),
        CONSTRAINT "youtube_account_channelId_unique" UNIQUE("channelId")
      );
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "idx_youtube_account_userId" ON "youtube_account" ("userId");
    `);
    console.log('Created youtube_account table');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
