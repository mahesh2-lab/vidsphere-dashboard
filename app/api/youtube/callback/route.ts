import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { oauth2Client } from "@/lib/google";
import { google } from "googleapis";
import { db } from "@/lib/db";
import { youtubeAccount } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const storedState = request.cookies.get("youtube_oauth_state")?.value;

    if (!code || !state) {
      return new NextResponse("Missing code or state", { status: 400 });
    }

    if (state !== storedState) {
      return new NextResponse("Invalid state parameter", { status: 400 });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    
    // Fetch channel info
    const channelRes = await youtube.channels.list({
      part: ["snippet", "statistics"],
      mine: true,
    });

    const channel = channelRes.data.items?.[0];

    if (!channel) {
      return new NextResponse("No YouTube channel found", { status: 404 });
    }

    const channelId = channel.id!;
    const snippet = channel.snippet!;
    const statistics = channel.statistics!;

    // Check if channel already exists for this user
    const existingAccount = await db.query.youtubeAccount.findFirst({
      where: eq(youtubeAccount.userId, session.user.id),
    });

    if (existingAccount) {
      // Update
      await db
        .update(youtubeAccount)
        .set({
          channelId: channelId,
          channelName: snippet.title ?? "Unknown",
          thumbnailUrl: snippet.thumbnails?.default?.url ?? "",
          accessToken: tokens.access_token ?? existingAccount.accessToken,
          refreshToken: tokens.refresh_token ?? existingAccount.refreshToken,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : existingAccount.expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(youtubeAccount.id, existingAccount.id));
    } else {
      // Insert
      await db.insert(youtubeAccount).values({
        id: randomUUID(),
        userId: session.user.id,
        channelId: channelId,
        channelName: snippet.title ?? "Unknown",
        thumbnailUrl: snippet.thumbnails?.default?.url ?? "",
        accessToken: tokens.access_token ?? null,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      });
    }

    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.delete("youtube_oauth_state");
    return response;
  } catch (error) {
    console.error("YouTube callback error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
