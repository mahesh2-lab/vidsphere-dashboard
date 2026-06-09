import { db } from "@/lib/db";
import { apiLogs } from "@/lib/db/schema";

export async function logApiCall(userId: string, endpoint: string, method: string, status: number) {
  try {
    // We execute this asynchronously so we don't block the API response
    // We catch the error internally so it never brings down the main request
    await db.insert(apiLogs).values({
      userId,
      endpoint,
      method,
      status,
    });
  } catch (error) {
    console.error("Failed to log API call:", error);
  }
}
