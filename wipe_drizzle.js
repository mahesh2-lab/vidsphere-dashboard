const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    await pool.query('DROP SCHEMA IF EXISTS drizzle CASCADE');
    console.log('Dropped drizzle schema');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
