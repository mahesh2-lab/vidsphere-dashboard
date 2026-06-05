import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { dash } from "@better-auth/infra";

const database = new Pool({
  connectionString: process.env.DATABASE_URL,
});



export const auth = betterAuth({
  database: database,
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    dash(),
  ],
});
