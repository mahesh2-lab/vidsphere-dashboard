const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await pool.query('TRUNCATE TABLE "user" CASCADE;');
  console.log("Truncated user table.");
  await pool.end();
}

main().catch(console.error);
