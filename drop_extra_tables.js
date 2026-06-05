const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const tables = ['account', 'verification', 'video', 'comment', 'channel_settings'];
    for (const table of tables) {
      console.log(`Dropping ${table}...`);
      await pool.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    }
    console.log("Dropping drizzle schema...");
    await pool.query('DROP SCHEMA IF EXISTS "drizzle" CASCADE');
    console.log("Done");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

main();
