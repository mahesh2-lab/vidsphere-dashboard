'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { youtubeAccount, youtubeCache, uploads } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath, revalidateTag } from 'next/cache'
import { oauth2Client } from '@/lib/google'
import { encrypt, decrypt } from '@/lib/encryption'

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

export interface YouTubeChannelStats {
  subscriberCount: number;
  videoCount: number;
  totalViews: number;
}

export interface YouTubeVideo {
  id: string;
  userId: string;
  channelId: string;
  videoId: string;
  title: string;
  thumbnailUrl?: string;
  duration: string;
  publishedAt: Date;
  status: string;
  bucket: string;
}

export interface YouTubeCacheEntry<T> {
  data: T;
  expiresAt: Date;
}

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

async function getGoogleAccessToken(userId: string) {
  const channel = await db.query.youtubeAccount.findFirst({
    where: (channel, { eq }) => eq(channel.userId, userId),
  })

  if (!channel || !channel.refreshToken) {
    throw new Error('YouTube channel not connected')
  }

  const decryptedRefreshToken = decrypt(channel.refreshToken);
  let accessToken = channel.accessToken ? decrypt(channel.accessToken) : null;
  
  // Check if token is expired or will expire in 5 minutes
  const isExpired = !channel.expiresAt || new Date(channel.expiresAt).getTime() - Date.now() < 5 * 60 * 1000;

  if (accessToken && !isExpired) {
    return accessToken;
  }

  // Refresh token
  oauth2Client.setCredentials({
    refresh_token: decryptedRefreshToken,
  })

  const { credentials } = await oauth2Client.refreshAccessToken()
  
  if (!credentials.access_token) {
    throw new Error('Failed to refresh access token')
  }
  
  const newAccessToken = encrypt(credentials.access_token);
  // We keep the old refresh token if Google doesn't send a new one
  const newRefreshToken = credentials.refresh_token ? encrypt(credentials.refresh_token) : channel.refreshToken;
  
  await db.update(youtubeAccount).set({ 
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : channel.expiresAt
  }).where(eq(youtubeAccount.id, channel.id))

  return credentials.access_token
}

async function getCachedData<T>(
  userId: string, 
  cacheKeySuffix: string, 
  ttlMinutes: number, 
  fetcher: () => Promise<T | null>
): Promise<T | null> {
  // Performance optimization: We bypass the Postgres database cache 
  // and rely entirely on Next.js native fetch Data Cache (Edge Cache).
  // The underlying fetch() calls already implement `next: { tags, revalidate }`.
  return await fetcher();
}

export async function getLiveChannelStats(): Promise<YouTubeChannelStats | null> {
  const userId = await getUserId()
  
  return getCachedData<YouTubeChannelStats>(userId, 'stats', 5, async () => {
    const accessToken = await getGoogleAccessToken(userId)
    
    const channelResponse = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=statistics&mine=true`,
      { 
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { tags: [`youtube_stats_${userId}`], revalidate: 300 }
      }
    ).then(res => res.json())

    if (channelResponse.error) {
      console.error('YouTube API Error:', channelResponse.error.message)
      return null
    }

    const stats = channelResponse.items?.[0]?.statistics
    if (!stats) return null

    return {
      subscriberCount: parseInt(stats.subscriberCount) || 0,
      videoCount: parseInt(stats.videoCount) || 0,
      totalViews: parseInt(stats.viewCount) || 0,
    }
  });
}

export async function fetchYouTubeVideos(): Promise<YouTubeVideo[]> {
  const userId = await getUserId()
  
  return getCachedData<YouTubeVideo[]>(userId, 'videos', 1, async () => {
    const accessToken = await getGoogleAccessToken(userId)
    
    // Get the channel details first
    const channel = await db.query.youtubeAccount.findFirst({
        where: eq(youtubeAccount.userId, userId)
    });
    
    if (!channel) throw new Error('Channel not found');

    const videosResponse = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&forMine=true&type=video&maxResults=50&order=date`,
      { 
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { tags: [`youtube_videos_${userId}`], revalidate: 60 } 
      }
    ).then(res => res.json())

    if (videosResponse.error) {
      if (videosResponse.error.code === 429 || videosResponse.error.code === 403) {
        console.warn('YouTube API Quota Exceeded. Returning empty videos to prevent crash.')
        return []
      }
      throw new Error(videosResponse.error.message)
    }

    interface SearchResult { id: { videoId: string } }
    const videoIds = videosResponse.items?.map((item: SearchResult) => item.id.videoId).join(',')
    if (!videoIds) return []

    const statsResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,status,contentDetails&id=${videoIds}`,
      { 
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { tags: [`youtube_videos_${userId}`], revalidate: 60 } 
      }
    ).then(res => res.json())
    
    if (statsResponse.error) {
      console.warn('YouTube API Error on stats:', statsResponse.error.message)
      return []
    }
    
    // Fetch mapping from uploads table
    const dbUploads = await db.query.uploads.findMany({
      where: eq(uploads.userId, userId)
    });
    
    const uploadMap = new Map();
    dbUploads.forEach(u => {
      if (u.videoId) uploadMap.set(u.videoId, u.id);
    });
    
    interface VideoSnippet { title: string, thumbnails?: { maxres?: { url: string }, high?: { url: string }, medium?: { url: string }, default?: { url: string } }, tags?: string[], publishedAt: string }
    interface VideoItem { id: string, snippet: VideoSnippet, status?: { uploadStatus: string }, contentDetails?: { duration: string } }

    const videoRecords = statsResponse.items?.map((item: VideoItem) => ({
      id: uploadMap.get(item.id) || `vid_${item.id}`,
      userId,
      channelId: channel.id,
      videoId: item.id,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      duration: item.contentDetails?.duration || '',
      publishedAt: new Date(item.snippet.publishedAt),
      status: item.status?.uploadStatus || 'processed',
      bucket: item.snippet.tags?.[0] || 'default',
    })) || [];

    return videoRecords;
  }) || [];
}

export async function fetchYouTubeVideo(videoId: string): Promise<YouTubeVideo | null> {
  const userId = await getUserId()
  
  let actualVideoId = videoId.startsWith('vid_') ? videoId.replace('vid_', '') : videoId;
  let dbId = videoId;
  
  // If it's not a 'vid_' prefixed ID, it might be a DB UUID. Look it up.
  if (!videoId.startsWith('vid_')) {
    const upload = await db.query.uploads.findFirst({
      where: eq(uploads.id, videoId)
    });
    if (upload && upload.videoId) {
      actualVideoId = upload.videoId;
    }
  }
  
  return getCachedData<YouTubeVideo | null>(userId, `video_${actualVideoId}`, 5, async () => {
    const accessToken = await getGoogleAccessToken(userId)
    
    const channel = await db.query.youtubeAccount.findFirst({
        where: eq(youtubeAccount.userId, userId)
    });
    
    if (!channel) throw new Error('Channel not found');

    const statsResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,status,contentDetails&id=${actualVideoId}`,
      { 
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { tags: [`youtube_video_${actualVideoId}_${userId}`], revalidate: 300 } 
      }
    ).then(res => res.json())
    
    if (statsResponse.error) {
      console.warn('YouTube API Error on stats:', statsResponse.error.message)
      return null
    }

    if (!statsResponse.items || statsResponse.items.length === 0) return null;
    
    const item = statsResponse.items[0];

    // If we didn't look up the DB ID previously, try to find it now to populate the `id` field properly
    if (videoId.startsWith('vid_')) {
      const upload = await db.query.uploads.findFirst({
        where: eq(uploads.videoId, actualVideoId)
      });
      if (upload) {
        dbId = upload.id;
      }
    }

    return {
      id: dbId.startsWith('vid_') && dbId === videoId ? `vid_${item.id}` : dbId,
      userId,
      channelId: channel.id,
      videoId: item.id,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      duration: item.contentDetails?.duration || '',
      publishedAt: new Date(item.snippet.publishedAt),
      status: item.status?.uploadStatus || 'processed',
      bucket: item.snippet.tags?.[0] || 'default',
    };
  });
}

export async function getUserVideos() {
  return fetchYouTubeVideos()
}

export async function getUserChannel() {
  const userId = await getUserId()
  return db.query.youtubeAccount.findFirst({
    where: eq(youtubeAccount.userId, userId)
  });
}

export async function disconnectYouTubeChannel() {
  const userId = await getUserId()
  
  const channel = await getUserChannel();
    
  if (channel) {
    await db.delete(youtubeAccount).where(eq(youtubeAccount.id, channel.id))
  }
  
  await clearYouTubeCache()
  
  revalidatePath('/dashboard')
  revalidatePath('/settings')
  revalidatePath('/videos')
}

export async function clearYouTubeCache() {
  const userId = await getUserId()
  try {
    await db.delete(youtubeCache).where(eq(youtubeCache.userId, userId))
    revalidateTag(`youtube_stats_${userId}`)
    revalidateTag(`youtube_videos_${userId}`)
  } catch (e) {
    console.error('Failed to clear YouTube cache:', e)
  }
}
