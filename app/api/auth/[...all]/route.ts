import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Export all HTTP methods that Better Auth handles
export const { GET, POST } = toNextJsHandler(auth);
