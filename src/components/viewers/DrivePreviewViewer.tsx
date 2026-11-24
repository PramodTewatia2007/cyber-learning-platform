'use client';

import React, { useState } from 'react';
import { Loader2, ExternalLink, Maximize2, Shield } from 'lucide-react';
import { LessonItem } from '@/types';

interface DrivePreviewViewerProps {
  lesson: LessonItem;
}

export function DrivePreviewViewer({ lesson }: DrivePreviewViewerProps) {
  const [loading, setLoading] = useState(true);
  const fileId = lesson.gdriveFileId || (lesson.id.startsWith('gdrive-') ? lesson.id.replace('gdrive-', '') : lesson.id);
  const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col bg-[#05080E] rounded-2xl overflow-hidden border border-[#1F2937]">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#090D16]/90 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
          <p className="text-xs font-mono text-gray-400">Loading Document from Google Drive...</p>
        </div>
      )}

      {/* Embedded Native Preview */}
      <iframe
        src={embedUrl}
        title={lesson.title}
        className="w-full flex-1 border-0 rounded-2xl"
        allow="autoplay"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}
