import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { oauth2Client, YOUTUBE_SCOPES } from "@/lib/google";
import { headers } from "next/headers";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  // 1. Verify user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Generate a secure state token to prevent CSRF during OAuth
  const state = crypto.randomBytes(32).toString("hex");
  
  // We can store the state in a cookie for the callback to verify
  const response = NextResponse.redirect(
    oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent", // Force consent to get a refresh_token
      scope: YOUTUBE_SCOPES,
      state: state,
    })
  );

  response.cookies.set("youtube_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}
