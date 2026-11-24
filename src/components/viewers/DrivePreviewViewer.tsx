'use client';

import React, { useState } from 'react';
import {
  FileText,
  ExternalLink,
  Download,
  Loader2,
  CheckCircle2,
  Folder,
  Code2
} from 'lucide-react';
import { LessonItem } from '@/types';

interface DrivePreviewViewerProps {
  lesson: LessonItem;
  courseTitle?: string;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
  accentColor?: string;
}

export function DrivePreviewViewer({
  lesson,
  courseTitle,
  isCompleted,
  onToggleComplete,
  accentColor = '#10B981',
}: DrivePreviewViewerProps) {
  const [loading, setLoading] = useState(true);

  const fileId =
    lesson.fileId ||
    lesson.gdriveFileId ||
    (lesson.id.startsWith('gdrive-') ? lesson.id.replace('gdrive-', '') : lesson.id);

  const embedUrl = lesson.embed_url || `https://drive.google.com/file/d/${fileId}/preview`;
  const viewUrl = lesson.view_url || `https://drive.google.com/file/d/${fileId}/view`;
  const downloadUrl = lesson.download_url || `https://drive.google.com/uc?export=download&id=${fileId}`;

  const isPdf = lesson.fileType === 'pdf';
  const displayTitle = lesson.displayTitle || lesson.title || lesson.name;

  return (
    <div className="flex flex-col h-full bg-[#090D16] text-white">
      {/* Top Header / Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-[#1F2937] bg-[#0E1524]/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg border shrink-0 ${
              isPdf
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
            }`}
          >
            {isPdf ? <FileText className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                {isPdf ? 'PDF Document' : 'Notes & Script Asset'}
              </span>
              {lesson.moduleName && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 max-w-[200px] truncate">
                  <Folder className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                  <span className="truncate">{lesson.moduleName}</span>
                </span>
              )}
              {lesson.size_mb != null && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                  {lesson.size_mb} MB
                </span>
              )}
            </div>
            <h1 className="text-sm md:text-base font-semibold text-gray-100 truncate mt-0.5">
              {displayTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {viewUrl && (
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Open in New Tab</span>
            </a>
          )}

          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download File</span>
            </a>
          )}

          {onToggleComplete && (
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
          )}
        </div>
      </div>

      {/* Embedded Native Preview Canvas */}
      <div className="flex-1 min-h-0 bg-[#05080E] p-3 md:p-6 flex flex-col items-center justify-center relative">
        <div className="relative w-full h-[80vh] bg-[#090D16] rounded-2xl overflow-hidden border border-[#1F2937] shadow-2xl flex flex-col">
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#090D16]/90 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
              <p className="text-xs font-mono text-gray-400">Loading Document from Google Drive...</p>
            </div>
          )}

          <iframe
            key={fileId}
            src={embedUrl}
            title={displayTitle}
            className="w-full h-full border-0 rounded-2xl"
            allow="autoplay; fullscreen"
            allowFullScreen
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}
