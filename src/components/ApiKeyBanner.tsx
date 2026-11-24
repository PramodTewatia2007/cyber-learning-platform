'use client';

import React, { useState } from 'react';
import { Cloud, ChevronRight, HardDrive } from 'lucide-react';
import { ApiKeyModal } from './ApiKeyModal';

interface ApiKeyBannerProps {
  isConfigured: boolean;
}

export function ApiKeyBanner({ isConfigured }: ApiKeyBannerProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-blue-950/40 via-blue-900/20 to-blue-950/40 border-b border-blue-800/40 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-blue-200">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <span className="font-semibold text-blue-300">Self-Owned Hybrid Storage:</span>
            <span className="text-blue-200/90 hidden md:inline">
              100% free architecture. Serving PDFs &amp; Labs from Cloudflare R2 + Videos via YouTube Player. Zero Google Drive runtime links.
            </span>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 transition-colors font-medium shrink-0"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Storage &amp; Migration Setup</span>
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
