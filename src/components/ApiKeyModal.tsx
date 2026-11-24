'use client';

import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Terminal,
  Database,
  Key
} from 'lucide-react';
import { Youtube } from './YoutubeIcon';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConfigured: boolean;
}

export function ApiKeyModal({ isOpen, onClose, isConfigured }: ApiKeyModalProps) {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, step: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0E1524] border border-[#1F2937] rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">3-Layer Platform Architecture Setup</h3>
            <p className="text-xs text-gray-400">
              Supabase (Database &amp; Auth) + Google Drive (Native Viewers) + YouTube (Video Lectures)
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div
          className={`p-4 rounded-xl border mb-6 flex items-start gap-3 ${
            isConfigured
              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
              : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
          }`}
        >
          {isConfigured ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <Key className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed">
            <div className="font-semibold text-white mb-0.5">
              {isConfigured
                ? 'Supabase Connected & Operational'
                : 'Running in Standalone Demo Mode (Zero-Config Active)'}
            </div>
            {isConfigured ? (
              <p className="text-emerald-300/80">
                All course catalogs, student authentication, study notes, and link ingestion are synchronized with your Supabase PostgreSQL cluster.
              </p>
            ) : (
              <p className="text-amber-300/80">
                You can browse all courses, stream YouTube videos, view embedded Drive folders, and take notes right now using built-in local state and demo logins! To enable cloud persistence, configure your free Supabase project below.
              </p>
            )}
          </div>
        </div>

        {/* 4-Step Setup Guide */}
        <div className="space-y-4 text-xs">
          <div className="font-mono text-gray-300 text-[11px] uppercase tracking-wider">
            Quick 4-Step Setup Guide
          </div>

          <div className="space-y-3">
            {/* Step 1 */}
            <div className="p-3 bg-black/40 rounded-xl border border-gray-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">1. Create Free Supabase Project</span>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
                >
                  <span>supabase.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-gray-400">
                Create a new project on the free tier and copy your Project URL and anon public API key.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3 bg-black/40 rounded-xl border border-gray-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">2. Paste SQL Schema &amp; Seed</span>
              </div>
              <p className="text-gray-400">
                In Supabase Dashboard &gt; <strong>SQL Editor</strong>, run the contents of <code className="text-emerald-400">supabase/schema.sql</code> and then <code className="text-emerald-400">supabase/seed.sql</code>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3 bg-black/40 rounded-xl border border-gray-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">3. Elevate Yourself to Admin</span>
                <button
                  onClick={() => handleCopy("UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';", 3)}
                  className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300"
                >
                  {copiedStep === 3 ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedStep === 3 ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>
              <div className="p-2 bg-black/60 rounded border border-gray-900 font-mono text-[11px] text-cyan-300">
                <code>UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';</code>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3 bg-black/40 rounded-xl border border-gray-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">4. Add Environment Variables to .env.local</span>
                <button
                  onClick={() =>
                    handleCopy(
                      "NEXT_PUBLIC_SUPABASE_URL=https://your-id.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...\nGOOGLE_DRIVE_API_KEY=\nYOUTUBE_API_KEY=",
                      4
                    )
                  }
                  className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 hover:text-emerald-300"
                >
                  {copiedStep === 4 ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedStep === 4 ? 'Copied' : 'Copy Template'}</span>
                </button>
              </div>
              <p className="text-gray-400">
                Add your keys into <code className="text-emerald-400">.env.local</code> in the root folder.
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
