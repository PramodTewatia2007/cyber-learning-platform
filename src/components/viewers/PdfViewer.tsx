'use client';

import React, { useState } from 'react';
import { LessonItem } from '@/types';
import { getMediaUrl } from '@/lib/r2';
import {
  BookOpen,
  ZoomIn,
  ZoomOut,
  Download,
  CheckCircle2,
  Maximize2,
  FileText
} from 'lucide-react';

interface PdfViewerProps {
  lesson: LessonItem;
  courseTitle: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  accentColor?: string;
}

export function PdfViewer({
  lesson,
  courseTitle,
  isCompleted,
  onToggleComplete,
  accentColor = '#10B981',
}: PdfViewerProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mediaUrl = lesson.r2Key ? getMediaUrl(lesson.r2Key) : `/api/media/${encodeURI(lesson.name)}`;
  const downloadUrl = lesson.r2Key
    ? `/api/media/${encodeURI(lesson.r2Key)}?download=true`
    : mediaUrl;

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 50), 200));
  };

  return (
    <div className={`flex flex-col h-full bg-[#090D16] text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Tactical PDF Reader Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#1F2937] bg-[#0E1524]/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">PDF Document</span>
              {lesson.formattedSize && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                  {lesson.formattedSize}
                </span>
              )}
            </div>
            <h1 className="text-sm md:text-base font-semibold text-gray-100 truncate mt-0.5">
              {lesson.title || lesson.name}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-[#111827] px-2 py-1 rounded-lg border border-[#1F2937] text-xs">
            <button
              onClick={() => handleZoom(-10)}
              className="p-1 hover:text-white text-gray-400"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] text-gray-300 px-1 min-w-[40px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => handleZoom(10)}
              className="p-1 hover:text-white text-gray-400"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="px-1.5 py-0.5 text-[10px] text-gray-400 hover:text-white border-l border-gray-700 ml-1"
            >
              Reset
            </button>
          </div>

          {/* Download Button */}
          <a
            href={downloadUrl}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-gray-800/80 text-gray-300 border border-gray-700 hover:border-gray-600 transition-colors"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Download</span>
          </a>

          {/* Mark Lesson Complete */}
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

      {/* Main Full-Height In-App PDF Reader */}
      <div className="flex-1 min-h-0 bg-[#060911] relative overflow-hidden flex items-center justify-center">
        <div
          className="w-full h-full transition-transform duration-150 origin-top flex flex-col"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          <object
            data={mediaUrl}
            type="application/pdf"
            className="w-full h-full border-0"
          >
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <FileText className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-sm font-semibold text-gray-300">Native PDF Viewer Active</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                If your browser does not render inline PDFs, you can download or view it directly:
              </p>
              <a
                href={downloadUrl}
                download
                className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
              >
                Download PDF ({lesson.formattedSize || 'Document'})
              </a>
            </div>
          </object>
        </div>
      </div>

      {/* PDF Footer Status Bar */}
      <div className="px-6 py-2.5 border-t border-[#1F2937] bg-[#0A0F1D] flex items-center justify-between text-xs text-gray-400 shrink-0">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Served from Owned Cloud Storage</span>
          <span className="text-gray-600">•</span>
          <span>Zero external redirects</span>
        </div>
        <span className="text-gray-500 text-[11px]">Use browser scroll or page up/down to navigate</span>
      </div>
    </div>
  );
}
