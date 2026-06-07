'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function YouTubePlayer({ videoId, title, thumbnailUrl }: { videoId: string; title: string; thumbnailUrl?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  
  
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!containerRef.current) return;
      
      // We scale the player up by 1.5 and crop it with a wrapper 
      // so the YouTube UI (like the title and the logo) gets pushed completely off screen.
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          enablejsapi: 1,
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            setDuration(event.target.getDuration());
          },
          onError: (event: any) => {
            setIsReady(true); // Prevent infinite loading spinner
            if (event.data === 150 || event.data === 101) {
              setErrorMsg('Embedding is disabled by YouTube.');
            } else {
              setErrorMsg('Failed to load video.');
            }
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setHasStarted(true);
            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // If window.YT exists but Player doesn't, we still wait for the callback
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        initPlayer();
      };
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  // Update progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
          if (duration > 0) {
            setProgress((time / duration) * 100);
          }
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const togglePlay = () => {
    if (!playerRef.current || !isReady || errorMsg) return;
    if (typeof playerRef.current.playVideo !== 'function') return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
    setProgress(percentage * 100);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Hide controls after 2.5 seconds of no mouse movement
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isHovering && isPlaying) {
      setShowControls(true);
      timeout = setTimeout(() => setShowControls(false), 2500);
    } else if (!isPlaying) {
      setShowControls(true);
    }
    return () => clearTimeout(timeout);
  }, [isHovering, isPlaying]);

  return (
    <div 
      className="relative w-full h-full bg-black rounded-xl overflow-hidden group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={() => {
        setIsHovering(true);
        // Trigger the effect above
        const el = document.getElementById('control-trigger');
        if (el) el.click();
      }}
    >
      <div id="control-trigger" className="hidden" />

      {/* The actual YouTube Player iframe gets injected here. 
          We use scale to push the residual YouTube UI off the screen edges. */}
      <div className="absolute inset-0 w-[120%] h-[120%] -left-[10%] -top-[10%] pointer-events-none opacity-0 transition-opacity duration-500" style={{ opacity: hasStarted ? 1 : 0 }}>
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Custom Poster Image / Start Screen */}
      {!hasStarted && (
        <div 
          className="absolute inset-0 bg-zinc-900 z-10 flex flex-col items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          {thumbnailUrl && (
            <img 
              src={thumbnailUrl} 
              alt={title} 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          )}
          <div className="relative z-20 w-16 h-16 bg-white/20 backdrop-blur hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
            {errorMsg ? (
              <span className="text-white text-xs text-center px-2">{errorMsg}</span>
            ) : !isReady ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
            )}
          </div>
        </div>
      )}

      {/* Click Overlay to catch clicks and prevent YouTube iframe from taking them */}
      {!errorMsg && (
        <div 
          className="absolute inset-0 z-20 cursor-pointer" 
          onClick={togglePlay}
        />
      )}

      {/* Custom Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 z-30 px-4 py-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Scrubber */}
        <div 
          className="w-full h-1.5 bg-white/30 rounded-full mb-4 cursor-pointer relative group/scrubber"
          onClick={handleSeek}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-red-600 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute top-1/2 -mt-2 w-4 h-4 bg-red-600 rounded-full shadow opacity-0 group-hover/scrubber:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlay} 
              className="hover:text-red-500 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" fill="currentColor" />
              ) : (
                <Play className="w-5 h-5" fill="currentColor" />
              )}
            </button>

            <button onClick={toggleMute} className="hover:text-red-500 transition-colors">
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            <div className="text-xs font-medium font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
