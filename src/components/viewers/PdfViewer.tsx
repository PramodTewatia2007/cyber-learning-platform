'use client';

import React, { useState } from 'react';
import { DriveFile } from '@/types';
import {
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  CheckCircle2,
  Maximize2,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface PdfViewerProps {
  file: DriveFile;
  courseTitle: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  accentColor?: string;
}

export function PdfViewer({
  file,
  courseTitle,
  isCompleted,
  onToggleComplete,
  accentColor = '#10B981',
}: PdfViewerProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Direct content stream endpoint
  const pdfStreamUrl = `/api/content/${file.id}`;
  // Sandboxed preview for Google Drive PDF files
  const driveEmbedUrl = `https://drive.google.com/file/d/${file.id}/preview`;

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 50), 200));
  };

  const resetZoom = () => setZoomLevel(100);

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
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">PDF Reader</span>
              {file.formattedSize && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                  {file.formattedSize}
                </span>
              )}
            </div>
            <h1 className="text-sm md:text-base font-semibold text-gray-100 truncate mt-0.5">
              {file.name}
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
              onClick={resetZoom}
              className="px-1.5 py-0.5 text-[10px] text-gray-400 hover:text-white border-l border-gray-700 ml-1"
            >
              Reset
            </button>
          </div>

          {/* Download Button */}
          <a
            href={`/api/download/${file.id}`}
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
            data={pdfStreamUrl}
            type="application/pdf"
            className="w-full h-full border-0"
          >
            {/* Fallback to embedded sandboxed reader if native object plugin is disabled */}
            <iframe
              src={driveEmbedUrl}
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-full border-0"
              title={file.name}
            />
          </object>
        </div>
      </div>

      {/* PDF Footer Status Bar */}
      <div className="px-6 py-2.5 border-t border-[#1F2937] bg-[#0A0F1D] flex items-center justify-between text-xs text-gray-400 shrink-0">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Native In-App PDF Engine</span>
          <span className="text-gray-600">•</span>
          <span>Zero external redirects</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-[11px]">Tip: Use browser scroll or page up/down to navigate pages</span>
        </div>
      </div>
    </div>
  );
}
