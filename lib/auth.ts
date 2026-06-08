import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { dash } from "@better-auth/infra";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set!");
}
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is not set!");
}


const database = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: database,
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    dash(),
  ],
});
