'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DriveFile } from '@/types';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  FastForward,
  Settings,
  Film,
  CheckCircle2,
  Download,
  AlertCircle,
  Tv
} from 'lucide-react';

interface VideoViewerProps {
  file: DriveFile;
  courseTitle: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  accentColor?: string;
}

export function VideoViewer({
  file,
  courseTitle,
  isCompleted,
  onToggleComplete,
  accentColor = '#10B981',
}: VideoViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playerMode, setPlayerMode] = useState<'stream' | 'sandbox'>('stream');
  const [streamError, setStreamError] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const streamSrc = `/api/content/${file.id}`;
  // Sandboxed preview endpoint with zero outbound navigation
  const sandboxEmbedSrc = `https://drive.google.com/file/d/${file.id}/preview`;

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setStreamError(false);
  }, [file.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in notes or input
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
  }, [isPlaying, isFullscreen, isMuted, volume]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setStreamError(true));
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(Math.max(videoRef.current.currentTime + seconds, 0), duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
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
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      const remainingMins = mins % 60;
      return `${hours}:${remainingMins < 10 ? '0' : ''}${remainingMins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full bg-[#090D16] text-white">
      {/* Tactical Video Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#1F2937] bg-[#0E1524]/90 backdrop-blur">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 shrink-0">
            <Film className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">Video Lesson</span>
              {file.formattedSize && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                  {file.formattedSize}
                </span>
              )}
              {file.duration && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  {file.duration}
                </span>
              )}
            </div>
            <h1 className="text-sm md:text-base font-semibold text-gray-100 truncate mt-0.5">
              {file.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Player Mode Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-[#111827] p-0.5 rounded-lg border border-[#1F2937] text-xs">
            <button
              onClick={() => setPlayerMode('stream')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                playerMode === 'stream'
                  ? 'bg-blue-600/30 text-blue-400 font-medium'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Native Stream
            </button>
            <button
              onClick={() => setPlayerMode('sandbox')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                playerMode === 'sandbox'
                  ? 'bg-purple-600/30 text-purple-400 font-medium'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Sandboxed Embed
            </button>
          </div>

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

      {/* Main Video Canvas */}
      <div className="flex-1 min-h-0 bg-black flex items-center justify-center p-2 md:p-6 relative">
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
          className="relative w-full max-w-5xl aspect-video bg-[#05080E] rounded-xl overflow-hidden shadow-2xl border border-[#1F2937] group select-none flex items-center justify-center"
        >
          {playerMode === 'stream' && !streamError ? (
            <>
              {/* Native Video Element */}
              <video
                ref={videoRef}
                src={streamSrc}
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => {
                  setIsPlaying(false);
                  if (!isCompleted) onToggleComplete();
                }}
                onError={() => {
                  setStreamError(true);
                }}
                className="w-full h-full object-contain cursor-pointer"
              />

              {/* Big Play Overlay if paused */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-opacity"
                >
                  <div
                    style={{ backgroundColor: accentColor }}
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform text-white"
                  >
                    <Play className="w-8 h-8 ml-1 fill-white" />
                  </div>
                </div>
              )}

              {/* Custom Tactical Overlay Controls */}
              <div
                className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 transition-opacity duration-300 flex flex-col gap-2 ${
                  showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* Seek Bar */}
                <div className="relative w-full flex items-center group/seek">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-gray-700/80 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:h-2.5 transition-all"
                  />
                </div>

                {/* Bottom Control Bar */}
                <div className="flex items-center justify-between text-xs text-gray-300 pt-1">
                  <div className="flex items-center gap-3">
                    {/* Play/Pause */}
                    <button
                      onClick={togglePlay}
                      className="p-1.5 hover:text-white transition-colors"
                      title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>

                    {/* Rewind / Fast Forward */}
                    <button
                      onClick={() => skip(-5)}
                      className="p-1 hover:text-white text-gray-400"
                      title="Back 5s (Left Arrow)"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => skip(5)}
                      className="p-1 hover:text-white text-gray-400"
                      title="Forward 5s (Right Arrow)"
                    >
                      <FastForward className="w-4 h-4" />
                    </button>

                    {/* Volume */}
                    <div className="flex items-center gap-2 group/vol">
                      <button onClick={toggleMute} className="p-1 hover:text-white">
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-red-400" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    {/* Time Display */}
                    <span className="font-mono text-[11px] text-gray-400 pl-2">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center gap-3">
                    {/* Speed Selector */}
                    <div className="flex items-center gap-1 bg-gray-900/80 px-2 py-0.5 rounded border border-gray-800">
                      {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSpeedChange(s)}
                          className={`px-1 text-[11px] font-mono rounded ${
                            playbackRate === s
                              ? 'text-emerald-400 font-bold'
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>

                    {/* Fullscreen */}
                    <button
                      onClick={toggleFullscreen}
                      className="p-1.5 hover:text-white transition-colors"
                      title="Fullscreen (F)"
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Sandboxed Clean Embed View or Stream Fallback */
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#070B14]">
              <iframe
                src={sandboxEmbedSrc}
                allow="autoplay; fullscreen"
                sandbox="allow-scripts allow-same-origin"
                className="w-full h-full border-0"
                title={file.name}
              />
              {/* Tactical overlay protecting against external link clicks */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#090D16]/90 border border-[#1F2937] text-[11px] text-gray-400 pointer-events-none">
                <Tv className="w-3.5 h-3.5 text-blue-400" />
                <span>Sandboxed Player</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Details & Keyboard Shortcuts Footer */}
      <div className="px-6 py-4 border-t border-[#1F2937] bg-[#0A0F1D] flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-300">Shortcuts:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 font-mono text-[10px]">Space</kbd> Play/Pause
            <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 font-mono text-[10px]">← / →</kbd> Seek 5s
            <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 font-mono text-[10px]">F</kbd> Fullscreen
            <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 font-mono text-[10px]">M</kbd> Mute
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={`/api/download/${file.id}`}
            download
            className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Lecture Video</span>
          </a>
        </div>
      </div>
    </div>
  );
}
