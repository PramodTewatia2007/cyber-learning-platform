'use client';

import React, { useState } from 'react';
import { Key, AlertCircle, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ApiKeyModal } from './ApiKeyModal';

interface ApiKeyBannerProps {
  isConfigured: boolean;
}

export function ApiKeyBanner({ isConfigured }: ApiKeyBannerProps) {
  const [modalOpen, setModalOpen] = useState(false);

  if (isConfigured) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-amber-950/40 border-b border-amber-800/40 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-200">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="font-semibold text-amber-300">Ready in Demo Mode:</span>
            <span className="text-amber-200/90 hidden md:inline">
              Sample video lectures, PDFs, and hands-on labs are loaded. Add your Google Drive API key to stream original live files.
            </span>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors font-medium shrink-0"
          >
            <Key className="w-3.5 h-3.5" />
            <span>2-Min Drive Setup</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ApiKeyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isConfigured={isConfigured}
      />
    </>
  );
}
