'use client';

import React from 'react';
import { DriveFile } from '@/types';
import {
  FileText,
  Presentation,
  Table,
  Download,
  CheckCircle2,
  ExternalLink,
  Shield
} from 'lucide-react';

interface DocViewerProps {
  file: DriveFile;
  courseTitle: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  accentColor?: string;
}

export function DocViewer({
  file,
  courseTitle,
  isCompleted,
  onToggleComplete,
  accentColor = '#10B981',
}: DocViewerProps) {
  const isPresentation = file.fileType === 'presentation';
  const isSpreadsheet = file.fileType === 'spreadsheet';

  const embedUrl = `https://drive.google.com/file/d/${file.id}/preview`;
  const streamUrl = `/api/content/${file.id}`;

  return (
    <div className="flex flex-col h-full bg-[#090D16] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#1F2937] bg-[#0E1524]/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
            {isPresentation ? (
              <Presentation className="w-4 h-4" />
            ) : isSpreadsheet ? (
              <Table className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                {isPresentation ? 'Slide Deck' : isSpreadsheet ? 'Spreadsheet' : 'Document'}
              </span>
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

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`/api/download/${file.id}`}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-gray-800/80 text-gray-300 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Download</span>
          </a>

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

      {/* Main Document Canvas */}
      <div className="flex-1 min-h-0 bg-[#060911] relative overflow-hidden flex items-center justify-center p-2">
        <iframe
          src={embedUrl}
          sandbox="allow-scripts allow-same-origin"
          className="w-full h-full border-0 rounded-lg"
          title={file.name}
        />
      </div>

      {/* Footer */}
      <div className="px-6 py-2.5 border-t border-[#1F2937] bg-[#0A0F1D] flex items-center justify-between text-xs text-gray-400 shrink-0">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>Sandboxed In-App Viewer</span>
        </div>
      </div>
    </div>
  );
}
