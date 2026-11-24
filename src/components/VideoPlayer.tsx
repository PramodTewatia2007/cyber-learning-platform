'use client';

import React, { useState } from 'react';
import { LessonItem } from '@/types';
import {
  Film,
  CheckCircle2,
  ExternalLink,
  Download,
  Subtitles,
  HardDrive,
  Clock,
  ChevronRight,
  Folder
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
  const [autoAdvance, setAutoAdvance] = useState(true);

  const isYouTube = lesson.source === 'youtube' && Boolean(lesson.youtubeId);
  const embedUrl = lesson.embed_url || (lesson.fileId ? `https://drive.google.com/file/d/${lesson.fileId}/preview` : (lesson.gdriveFileId ? `https://drive.google.com/file/d/${lesson.gdriveFileId}/preview` : ''));
  const viewUrl = lesson.view_url || (lesson.fileId ? `https://drive.google.com/file/d/${lesson.fileId}/view` : (lesson.gdriveFileId ? `https://drive.google.com/file/d/${lesson.gdriveFileId}/view` : ''));
  const downloadUrl = lesson.download_url || (lesson.fileId ? `https://drive.google.com/uc?export=download&id=${lesson.fileId}` : '');

  const displayTitle = lesson.displayTitle || lesson.title || lesson.name;

  return (
    <div className="flex flex-col h-full bg-[#090D16] text-white">
      {/* Lesson Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-[#1F2937] bg-[#0E1524]/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 shrink-0">
            <Film className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">Video Lesson</span>
              {lesson.moduleName && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 max-w-[200px] truncate">
                  <Folder className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                  <span className="truncate">{lesson.moduleName}</span>
                </span>
              )}
              {isYouTube && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40">
                  <Youtube className="w-3 h-3 text-red-400" />
                  YouTube
                </span>
              )}
              {lesson.size_mb != null && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">
                  <HardDrive className="w-2.5 h-2.5 text-blue-400" />
                  {lesson.size_mb} MB
                </span>
              )}
              {typeof lesson.duration_min === 'number' && lesson.duration_min > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  <Clock className="w-2.5 h-2.5 text-emerald-400" />
                  {lesson.duration_min} min
                </span>
              )}
              {lesson.subtitleUrl && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                  <Subtitles className="w-2.5 h-2.5 text-purple-400" />
                  CC Available
                </span>
              )}
            </div>
            <h1 className="text-sm md:text-base font-semibold text-gray-100 truncate mt-0.5">
              {displayTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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

          {onNextLesson && (
            <button
              onClick={onNextLesson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Main Video Frame */}
      <div className="flex-1 min-h-0 bg-black flex items-center justify-center p-3 md:p-6 relative overflow-auto">
        <div className="relative w-full max-w-5xl aspect-video bg-[#05080E] rounded-2xl overflow-hidden shadow-2xl border border-[#1F2937]">
          {isYouTube ? (
            <iframe
              key={`yt-${lesson.youtubeId}`}
              src={`https://www.youtube-nocookie.com/embed/${lesson.youtubeId}?rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0 rounded-xl"
              title={displayTitle}
            />
          ) : embedUrl ? (
            <iframe
              key={`gdrive-${lesson.id}`}
              src={embedUrl}
              allow="autoplay; fullscreen"
              allowFullScreen
              className="w-full h-full border-0 rounded-xl"
              title={displayTitle}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <Film className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-sm font-medium text-gray-300">Video source not found</p>
              <p className="text-xs text-gray-500 mt-1">This video does not have a valid Google Drive embed URL.</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons & Resource Bar */}
      <div className="px-6 py-3 border-t border-[#1F2937] bg-[#0A0F1D] flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400 shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          {viewUrl && (
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Open in Google Drive</span>
            </a>
          )}

          {lesson.subtitleUrl && (
            <a
              href={lesson.subtitleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 border border-purple-800/60 text-xs font-medium transition-colors"
            >
              <Subtitles className="w-3.5 h-3.5 text-purple-400" />
              <span>Download Subtitles (.srt)</span>
            </a>
          )}

          {downloadUrl && !lesson.subtitleUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-700 text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-gray-400" />
              <span>Download Video</span>
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-gray-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Native Google Drive Player</span>
          <span className="text-gray-700">•</span>
          <span>Zero External Storage Dependency</span>
        </div>
      </div>
    </div>
  );
}
