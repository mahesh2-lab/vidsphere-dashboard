import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploads } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { logApiCall } from "@/lib/api-logger";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { uploadId } = body;

    if (!uploadId) {
      return new NextResponse("Missing uploadId", { status: 400 });
    }

    // Verify ownership and update status
    const existingUpload = await db.query.uploads.findFirst({
      where: and(
        eq(uploads.id, uploadId),
        eq(uploads.userId, session.user.id)
      )
    });

    if (!existingUpload) {
      return new NextResponse("Upload record not found", { status: 404 });
    }

    await db.update(uploads).set({
      status: "completed",
      completedAt: new Date()
    }).where(eq(uploads.id, uploadId));

    logApiCall(session.user.id, "/api/youtube/upload/complete", "POST", 200);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("YouTube upload complete error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
