'use client';

import React, { useState } from 'react';
import { Folder, Loader2, Sparkles, Key } from 'lucide-react';
import { getDriveFolderEmbedUrl } from '@/lib/drive';

interface DriveFolderEmbedViewerProps {
  folderId: string;
  courseTitle: string;
  accentColor?: string;
}

export function DriveFolderEmbedViewer({
  folderId,
  courseTitle,
  accentColor = '#10B981',
}: DriveFolderEmbedViewerProps) {
  const [loading, setLoading] = useState(true);
  const embedUrl = getDriveFolderEmbedUrl(folderId);

  return (
    <div className="flex flex-col h-full bg-[#090D16] text-white">
      {/* Zero-Config Explainer Banner */}
      <div className="px-6 py-3 border-b border-[#1F2937] bg-[#0E1524]/90 backdrop-blur flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
          <Folder className="w-4 h-4 text-amber-400" />
          <span>Interactive Folder View</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            Zero-Config Ready
          </span>
        </div>
        <p className="hidden md:block text-[11px] font-mono text-gray-400">
          Native in-app Google Drive catalog tree
        </p>
      </div>

      {/* Embedded Folder View Canvas */}
      <div className="flex-1 min-h-[550px] p-2 md:p-4 bg-black relative flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#090D16]/90 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
            <p className="text-xs font-mono text-gray-400">Connecting Google Drive Folder Stream...</p>
          </div>
        )}

        <iframe
          src={embedUrl}
          title={courseTitle}
          className="w-full h-full min-h-[550px] rounded-xl border border-[#1F2937] bg-white shadow-2xl"
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}
