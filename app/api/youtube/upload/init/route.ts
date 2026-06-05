import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { youtubeAccount } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { oauth2Client } from "@/lib/google";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, description, visibility, fileSize, mimeType } = body;

    if (!title || !fileSize) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const channel = await db.query.youtubeAccount.findFirst({
      where: eq(youtubeAccount.userId, session.user.id),
    });

    if (!channel || !channel.refreshToken) {
      return new NextResponse("YouTube channel not connected", { status: 400 });
    }

    // Force refresh token to ensure valid access token
    oauth2Client.setCredentials({ refresh_token: channel.refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();

    // Prepare the video metadata
    const metadata = {
      snippet: {
        title,
        description,
        categoryId: "22", // People & Blogs default
      },
      status: {
        privacyStatus: visibility || "private",
        selfDeclaredMadeForKids: false,
      },
    };

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
        },
        maxRedirects: 0, // We want to catch the Location header, not follow it (though Axios usually handles 200 OK for resumable init)
      }
    );

    const uploadUrl = response.headers.location;

    if (!uploadUrl) {
      throw new Error("Did not receive a resumable upload URL from Google");
    }

    return NextResponse.json({ uploadUrl });
  } catch (error: any) {
    console.error("YouTube upload init error:", error?.response?.data || error);
    return new NextResponse(
      error?.response?.data?.error?.message || "Internal Server Error",
      { status: error?.response?.status || 500 }
    );
  }
}
