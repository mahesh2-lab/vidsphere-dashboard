'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { youtubeAccount } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { oauth2Client } from '@/lib/google'
import axios from 'axios'

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

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

  // Set only the refresh token to force a refresh
  oauth2Client.setCredentials({
    refresh_token: channel.refreshToken,
  })

  // Force refresh the token with every request
  const { credentials } = await oauth2Client.refreshAccessToken()
  
  if (!credentials.access_token) {
    throw new Error('Failed to refresh access token')
  }
  
  // Save the newly refreshed token and its expiry to the database
  await db.update(youtubeAccount).set({ 
    accessToken: credentials.access_token,
    expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : channel.expiresAt
  }).where(eq(youtubeAccount.id, channel.id))

  return credentials.access_token
}

export async function getLiveChannelStats() {
  const userId = await getUserId()
  const accessToken = await getGoogleAccessToken(userId)

  try {
    const channelResponse = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
      params: {
        part: 'statistics',
        mine: true,
        access_token: accessToken,
      },
    })

    const stats = channelResponse.data.items?.[0]?.statistics
    if (!stats) return null

    return {
      subscriberCount: parseInt(stats.subscriberCount) || 0,
      videoCount: parseInt(stats.videoCount) || 0,
      totalViews: parseInt(stats.viewCount) || 0,
    }
  } catch (error) {
    console.error('Error fetching live channel stats:', error)
    return null
  }
}

export async function fetchYouTubeVideos() {
  const userId = await getUserId()
  const accessToken = await getGoogleAccessToken(userId)

  try {
    const videosResponse = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        part: 'snippet',
        forMine: true,
        type: 'video',
        maxResults: 50,
        order: 'date',
        access_token: accessToken,
      },
    })

    const videoIds = videosResponse.data.items?.map((item: any) => item.id.videoId).join(',')

    const statsResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'statistics,snippet',
        id: videoIds,
        access_token: accessToken,
      },  
    })

    console.log(statsResponse.data.items);
    

    const channel = await db
      .select()
      .from(youtubeAccount)
      .where(eq(youtubeAccount.userId, userId))
      .limit(1)

    if (!channel[0]) {
      throw new Error('Channel not found')
    }

    const videoRecords = statsResponse.data.items?.map((item: any) => ({
      id: `vid_${item.id}`,
      userId,
      channelId: channel[0].id,
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails?.default?.url,
      publishedAt: new Date(item.snippet.publishedAt),
      viewCount: parseInt(item.statistics.viewCount) || 0,
      likeCount: parseInt(item.statistics.likeCount) || 0,
      commentCount: parseInt(item.statistics.commentCount) || 0,
      status: 'published',
      visibility: item.status?.privacyStatus || 'public',
      category: item.snippet.categoryId,
      tags: item.snippet.tags?.join(',') || '',
    }))

    return videoRecords
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    throw error
  }
}



export async function getUserVideos() {
  return fetchYouTubeVideos()
}

export async function getUserChannel() {
  const userId = await getUserId()
  return db
    .select()
    .from(youtubeAccount)
    .where(eq(youtubeAccount.userId, userId))
    .limit(1)
    .then((results) => results[0])
}

export async function disconnectYouTubeChannel() {
  const userId = await getUserId()
  
  const channel = await db
    .select()
    .from(youtubeAccount)
    .where(eq(youtubeAccount.userId, userId))
    .limit(1)
    
  if (channel[0]) {
    await db.delete(youtubeAccount).where(eq(youtubeAccount.id, channel[0].id))
  }
  
  revalidatePath('/dashboard')
  revalidatePath('/settings')
  revalidatePath('/videos')
}
