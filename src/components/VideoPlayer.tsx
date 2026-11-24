'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LessonItem } from '@/types';
import { getMediaUrl } from '@/lib/r2';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  FastForward,
  Film,
  CheckCircle2,
  Download,
  AlertCircle,
  Cloud,
  ChevronRight,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { Youtube } from './YoutubeIcon';

interface VideoPlayerProps {
  lesson: LessonItem;
  courseTitle: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onNextLesson?: () => void;
  accentColor?: string;
}

export function VideoPlayer({
  lesson,
  courseTitle,
  isCompleted,
  onToggleComplete,
  onNextLesson,
  accentColor = '#10B981',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  const isYouTube = lesson.source === 'youtube' && Boolean(lesson.youtubeId);
  const isR2 = lesson.source === 'r2' && Boolean(lesson.r2Key);
  const isPending = lesson.isPendingUpload || (!lesson.youtubeId && !lesson.r2Key);

  const storageKey = `cyber_lms_video_pos_${lesson.id}`;

  // Restore saved playback position for native R2 video
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);

    if (isR2) {
      try {
        const savedPos = localStorage.getItem(storageKey);
        if (savedPos && videoRef.current) {
          const pos = parseFloat(savedPos);
          if (!isNaN(pos) && pos > 5) {
            videoRef.current.currentTime = pos;
            setCurrentTime(pos);
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, [lesson.id, isR2, storageKey]);

  // Handle keyboard shortcuts for R2 native video
  useEffect(() => {
    if (!isR2) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skip(5);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        skip(-5);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isR2, isPlaying, duration]);

  // YouTube IFrame API integration for auto-completion & auto-advance
  useEffect(() => {
    if (!isYouTube || !lesson.youtubeId) return;

    let player: any = null;

    const setupPlayer = () => {
      if (!(window as any).YT || !(window as any).YT.Player) {
        // Load YouTube IFrame API script once if not already present
        if (!document.getElementById('yt-iframe-api')) {
          const tag = document.createElement('script');
          tag.id = 'yt-iframe-api';
          tag.src = 'https://www.youtube.com/iframe_api';
          document.body.appendChild(tag);
        }

        (window as any).onYouTubeIframeAPIReady = () => {
          createYTPlayer();
        };
      } else {
        createYTPlayer();
      }
    };

    const createYTPlayer = () => {
      if (!iframeRef.current) return;
      try {
        player = new (window as any).YT.Player(iframeRef.current, {
          events: {
            onStateChange: (event: any) => {
              // YT.PlayerState.ENDED = 0
              if (event.data === 0) {
                if (!isCompleted) onToggleComplete();
                if (autoAdvance && onNextLesson) {
                  setTimeout(() => onNextLesson(), 1500);
                }
              }
            },
          },
        });
      } catch (e) {
        // fallback iframe without API
      }
    };

    setupPlayer();

    return () => {
      if (player && player.destroy) player.destroy();
    };
  }, [isYouTube, lesson.youtubeId, isCompleted, autoAdvance, onToggleComplete, onNextLesson]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);
    if (curr > 5 && Math.floor(curr) % 5 === 0) {
      localStorage.setItem(storageKey, String(curr));
    }
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(Math.max(videoRef.current.currentTime + seconds, 0), duration);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const copyConfigSnippet = () => {
    const snippet = `"youtubeId": "PASTE_ID_HERE"`;
    navigator.clipboard.writeText(snippet);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#090D16] text-white">
      {/* Lesson Navigation Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#1F2937] bg-[#0E1524]/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 shrink-0">
            <Film className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">Video Lesson</span>
              {isYouTube && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40">
                  <Youtube className="w-3 h-3 text-red-400" />
                  YouTube (Unlisted)
                </span>
              )}
              {isR2 && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">
                  <Cloud className="w-3 h-3 text-blue-400" />
                  Cloudflare R2
                </span>
              )}
              {lesson.duration && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  {lesson.duration}
                </span>
              )}
            </div>
            <h1 className="text-sm md:text-base font-semibold text-gray-100 truncate mt-0.5">
              {lesson.title || lesson.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Auto advance toggle */}
          <button
            onClick={() => setAutoAdvance(!autoAdvance)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors ${
              autoAdvance
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-gray-900 border-gray-800 text-gray-500'
            }`}
            title="Automatically advance to next lesson when video ends"
          >
            <span>Auto-Advance</span>
            <span className={`w-1.5 h-1.5 rounded-full ${autoAdvance ? 'bg-emerald-400' : 'bg-gray-600'}`} />
          </button>

          {/* Mark Complete */}
          <button
            onClick={onToggleComplete}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:border-gray-600'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-400' : 'text-gray-400'}`} />
            <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
          </button>
        </div>
      </div>

      {/* Main Video Frame */}
      <div className="flex-1 min-h-0 bg-black flex items-center justify-center p-2 md:p-6 relative">
        <div
          ref={containerRef}
          className="relative w-full max-w-5xl aspect-video bg-[#05080E] rounded-2xl overflow-hidden shadow-2xl border border-[#1F2937] flex items-center justify-center"
        >
          {isYouTube ? (
            /* Dual-Engine Engine A: Privacy-Enhanced YouTube IFrame */
            <iframe
              key={lesson.youtubeId}
              ref={iframeRef}
              src={`https://www.youtube-nocookie.com/embed/${lesson.youtubeId}?rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
              title={lesson.title}
            />
          ) : isR2 ? (
            /* Dual-Engine Engine B: Native HTML5 Video Player from Cloudflare R2 */
            <>
              <video
                ref={videoRef}
                src={getMediaUrl(lesson.r2Key!)}
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                onEnded={() => {
                  setIsPlaying(false);
                  if (!isCompleted) onToggleComplete();
                  if (autoAdvance && onNextLesson) onNextLesson();
                }}
                className="w-full h-full object-contain cursor-pointer"
              />

              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer"
                >
                  <div
                    style={{ backgroundColor: accentColor }}
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg text-white transform hover:scale-110 transition-transform"
                  >
                    <Play className="w-8 h-8 ml-1 fill-white" />
                  </div>
                </div>
              )}

              {/* Tactical Controls */}
              <div
                className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 flex flex-col gap-2 transition-opacity ${
                  showControls ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => {
                    const time = parseFloat(e.target.value);
                    if (videoRef.current) videoRef.current.currentTime = time;
                    setCurrentTime(time);
                  }}
                  className="w-full h-1.5 bg-gray-700/80 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:h-2.5 transition-all"
                />

                <div className="flex items-center justify-between text-xs text-gray-300 pt-1">
                  <div className="flex items-center gap-3">
                    <button onClick={togglePlay} className="p-1 hover:text-white">
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>
                    <button onClick={() => skip(-5)} className="p-1 text-gray-400 hover:text-white">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button onClick={() => skip(5)} className="p-1 text-gray-400 hover:text-white">
                      <FastForward className="w-4 h-4" />
                    </button>
                    <button onClick={toggleMute} className="p-1 text-gray-400 hover:text-white">
                      {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <span className="font-mono text-[11px] text-gray-400">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                      {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSpeedChange(s)}
                          className={`px-1 text-[11px] font-mono ${
                            playbackRate === s ? 'text-emerald-400 font-bold' : 'text-gray-500'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                    <button onClick={toggleFullscreen} className="p-1 hover:text-white">
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Pending Video Drawer: Upload instructions */
            <div className="p-8 max-w-lg text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
                <Youtube className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest">
                Pending Unlisted Video Link
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                {lesson.title}
              </h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                This video lecture was skipped during R2 migration to keep your Cloudflare storage free. You can host it as an Unlisted YouTube video or migrate it directly to R2.
              </p>

              <div className="mt-4 p-3 rounded-xl bg-[#090D16] border border-gray-800 text-xs font-mono text-gray-300 w-full text-left">
                <div className="flex items-center justify-between text-gray-500 mb-1 text-[10px]">
                  <span>MAPPING CONFIG ENTRY</span>
                  <button
                    onClick={copyConfigSnippet}
                    className="flex items-center gap-1 text-emerald-400 hover:underline"
                  >
                    {copiedId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-gray-400 truncate">File: {lesson.name}</p>
                <p className="text-amber-400 mt-0.5">Location: src/config/youtube-videos.json</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Status */}
      <div className="px-6 py-3 border-t border-[#1F2937] bg-[#0A0F1D] flex items-center justify-between text-xs text-gray-400 shrink-0">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{isYouTube ? 'Serving via Privacy-Enhanced YouTube CDN' : 'Serving from Owned Cloudflare R2'}</span>
          <span className="text-gray-600">•</span>
          <span>Zero Runtime Google Drive Links</span>
        </div>

        {lesson.r2Key && (
          <a
            href={`/api/media/${encodeURI(lesson.r2Key)}?download=true`}
            download
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Offline Copy</span>
          </a>
        )}
      </div>
    </div>
  );
}
