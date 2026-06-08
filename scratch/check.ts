import { db } from '../lib/db';
import { uploads } from '../lib/db/schema';

async function main() {
  const result = await db.query.uploads.findMany();
  console.log("Uploads table records:");
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch(console.error);
