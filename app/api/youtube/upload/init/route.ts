import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { youtubeAccount, uploads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { oauth2Client } from '@/features/youtube/services/google';
import axios from "axios";
import { logApiCall } from '@/features/developers/services/api-logger';
import { decrypt } from '@/lib/utils/encryption';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { filename, bucket, fileSize, mimeType, privacyStatus, customMetadata } = body;

    if (!filename || !fileSize) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Strip extension from filename to create default title
    const videoTitle = filename.replace(/\.[^/.]+$/, "");

    const customTags = Array.isArray(customMetadata) 
      ? customMetadata.map((m: any) => `${m.key}:${m.value}`)
      : [];

    const channel = await db.query.youtubeAccount.findFirst({
      where: eq(youtubeAccount.userId, session.user.id),
    });

    if (!channel || !channel.refreshToken) {
      return new NextResponse("YouTube channel not connected", { status: 400 });
    }

    // Force refresh token to ensure valid access token
    const decryptedRefreshToken = channel.refreshToken ? decrypt(channel.refreshToken) : null;
    oauth2Client.setCredentials({ refresh_token: decryptedRefreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();

    // Prepare the video metadata
    const metadata = {
      snippet: {
        title: videoTitle,
        description: "",
        categoryId: "22", // People & Blogs default
        tags: [bucket || "default", ...customTags],
      },
      status: {
        privacyStatus: privacyStatus || "unlisted",
        selfDeclaredMadeForKids: false,
      },
    };

    const reqHeaders = await headers();
    const origin = reqHeaders.get("origin") || "";

    // Request the Resumable Upload URL from Google
    const response = await axios.post(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      metadata,
      {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Length": fileSize.toString(),
          "X-Upload-Content-Type": mimeType || "video/*",
          ...(origin ? { Origin: origin } : {}),
        },
        maxRedirects: 0, // We want to catch the Location header, not follow it (though Axios usually handles 200 OK for resumable init)
      }
    );

    const uploadUrl = response.headers.location;

    if (!uploadUrl) {
      throw new Error("Did not receive a resumable upload URL from Google");
    }

    let metadataObj: Record<string, any> = { fileSize };
    if (Array.isArray(customMetadata)) {
      customMetadata.forEach((curr) => {
        if (curr.key) metadataObj[curr.key] = curr.value;
      });
    }

    const [newUpload] = await db.insert(uploads).values({
      userId: session.user.id,
      title: videoTitle,
      privacyStatus: privacyStatus || "unlisted",
      status: "pending",
      metadata: metadataObj,
    }).returning({ id: uploads.id });

    logApiCall(session.user.id, "/api/youtube/upload/init", "POST", 200);

    return NextResponse.json({ uploadUrl, uploadId: newUpload.id });
  } catch (error: any) {
    console.error("YouTube upload init error:", error?.response?.data || error);
    return new NextResponse(
      error?.response?.data?.error?.message || "Internal Server Error",
      { status: error?.response?.status || 500 }
    );
  }
}
