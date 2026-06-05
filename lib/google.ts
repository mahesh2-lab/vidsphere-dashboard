import { google } from "googleapis";

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_AUTH_URL}/api/youtube/callback`
);

export const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
];
