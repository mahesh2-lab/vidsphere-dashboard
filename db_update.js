const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    console.log("Dropping youtube_channel...");
    await pool.query('DROP TABLE IF EXISTS "youtube_channel" CASCADE');
    console.log("Dropped youtube_channel");

    console.log("Dropping drizzle schema...");
    await pool.query('DROP SCHEMA IF EXISTS "drizzle" CASCADE');
    console.log("Dropped drizzle schema");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

main();
