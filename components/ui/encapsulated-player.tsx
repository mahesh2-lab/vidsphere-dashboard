import { YouTubePlayer } from './youtube-player';
import { db } from '@/lib/db';
import { uploads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface EncapsulatedPlayerProps {
  uploadId: string;
  className?: string;
}

export async function EncapsulatedPlayer({ 
  uploadId, 
  className = "" 
}: EncapsulatedPlayerProps) {
  if (!uploadId) {
    return (
      <div className="w-full aspect-video bg-zinc-100 rounded-xl flex items-center justify-center text-sm text-zinc-500 border border-zinc-200">
        No Upload ID provided
      </div>
    );
  }

  // Fetch the video data securely on the server
  const uploadRecord = await db.query.uploads.findFirst({
    where: eq(uploads.id, uploadId),
  });

  if (!uploadRecord) {
    return (
      <div className="w-full aspect-video bg-zinc-100 rounded-xl flex items-center justify-center text-sm text-zinc-500 border border-zinc-200">
        Upload not found in database
      </div>
    );
  }

  const { videoId, title } = uploadRecord;

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-zinc-100 rounded-xl flex items-center justify-center text-sm text-zinc-500 border border-zinc-200">
        YouTube Video ID is not yet available for this upload (Status: {uploadRecord.status})
      </div>
    );
  }

  // Derive the max resolution thumbnail from YouTube
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div className={`w-full max-w-5xl mx-auto ${className}`}>
      {/* 16:9 Aspect Ratio Container */}
      <div className="relative w-full pt-[56.25%] rounded-xl shadow-xl border border-zinc-200/50 overflow-hidden bg-zinc-900">
        <div className="absolute inset-0">
          <YouTubePlayer 
            videoId={videoId} 
            title={title} 
            thumbnailUrl={thumbnailUrl} 
          />
        </div>
      </div>
    </div>
  );
}
