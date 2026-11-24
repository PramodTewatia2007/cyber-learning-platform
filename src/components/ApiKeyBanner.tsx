'use client';

import React, { useState } from 'react';
import { Database, ChevronRight, Shield, Sparkles } from 'lucide-react';
import { ApiKeyModal } from './ApiKeyModal';
import { useAuth } from '@/lib/supabase/authContext';

export function ApiKeyBanner() {
  const [modalOpen, setModalOpen] = useState(false);
  const { isConfigured } = useAuth();

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 border-b border-emerald-800/40 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-emerald-200">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold text-emerald-300">Core 3-Layer Architecture:</span>
            <span className="text-emerald-200/90 hidden md:inline">
              Google Drive (Native Documents &amp; Viewers) • YouTube (Cinema-Mode Videos) • Supabase (Database &amp; Auth)
            </span>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-colors font-medium shrink-0 text-[11px]"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isConfigured ? 'Architecture Configured' : 'Connect Supabase &amp; APIs'}</span>
            <ChevronRight className="w-3 h-3" />
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
