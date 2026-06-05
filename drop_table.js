const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    await pool.query('DROP TABLE IF EXISTS youtube_channel CASCADE');
    console.log('Dropped youtube_channel table');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
