'use client';

import React, { useState } from 'react';
import {
  Cloud,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Terminal,
  HardDrive
} from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConfigured: boolean;
}

export function ApiKeyModal({ isOpen, onClose, isConfigured }: ApiKeyModalProps) {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0E1524] border border-[#1F2937] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Self-Owned Cloudflare R2 Storage</h2>
              {isConfigured ? (
                <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  R2 ACTIVE
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  STARTER SEED ACTIVE
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              100% self-owned hybrid architecture: R2 cloud storage (10 GB free, $0 egress) + Unlisted YouTube video player.
            </p>
          </div>
        </div>

        {/* 4-Step Quick Setup Guide */}
        <div className="space-y-4">
          <div className="bg-[#0A0F1D] p-4 rounded-xl border border-gray-800">
            <h3 className="text-xs font-mono font-semibold uppercase text-emerald-400 mb-3 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>4-Step Cloudflare R2 &amp; YouTube Setup</span>
            </h3>

            <div className="space-y-3.5 text-xs text-gray-300">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-900/60 border border-blue-600/40 text-blue-300 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-medium text-white">Create a Free Cloudflare R2 Bucket</p>
                  <p className="text-gray-400 mt-0.5">
                    Sign in to Cloudflare Dashboard &gt; <strong>R2 Object Storage</strong> &gt; Click <strong>&quot;Create bucket&quot;</strong> (e.g. <code className="text-blue-300">cyber-lms-library</code>).
                  </p>
                  <a
                    href="https://dash.cloudflare.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:underline mt-1 font-mono"
                  >
                    <span>dash.cloudflare.com/r2</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-900/60 border border-blue-600/40 text-blue-300 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="w-full">
                  <p className="font-medium text-white">Generate R2 S3 Credentials &amp; Put in `.env.local`</p>
                  <p className="text-gray-400 mt-0.5">
                    Click <strong>&quot;Manage R2 API Tokens&quot;</strong> &gt; <strong>&quot;Create API Token&quot;</strong> (Admin Read &amp; Write). Add to `.env.local`:
                  </p>
                  <div className="mt-1.5 flex items-center justify-between bg-black/60 px-3 py-2 rounded-lg border border-gray-800 font-mono text-[11px] text-gray-300">
                    <code>R2_ACCOUNT_ID=... &amp; R2_ACCESS_KEY_ID=...</code>
                    <button
                      onClick={() => copyText('R2_ACCOUNT_ID=\nR2_ACCESS_KEY_ID=\nR2_SECRET_ACCESS_KEY=\nR2_BUCKET_NAME=cyber-lms-library', 2)}
                      className="text-gray-400 hover:text-white"
                      title="Copy template"
                    >
                      {copiedStep === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-900/60 border border-blue-600/40 text-blue-300 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-medium text-white">Run Storage Audit &amp; Cloud Migration</p>
                  <p className="text-gray-400 mt-0.5">
                    Stream non-video assets to R2 and automatically route videos to your YouTube mapping file:
                  </p>
                  <div className="mt-1.5 bg-black/60 px-3 py-2 rounded-lg border border-gray-800 font-mono text-[11px] text-emerald-400">
                    <code>npm run check-size && npm run migrate -- --skip-videos</code>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-900/60 border border-blue-600/40 text-blue-300 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <p className="font-medium text-white">Import Unlisted YouTube Playlists (Optional)</p>
                  <p className="text-gray-400 mt-0.5">
                    Host heavy lecture videos as Unlisted YouTube playlists for 100% free streaming and auto-import in seconds:
                  </p>
                  <div className="mt-1.5 bg-black/60 px-3 py-2 rounded-lg border border-gray-800 font-mono text-[11px] text-cyan-400">
                    <code>npm run import-yt-playlist -- --playlist=ID --course=slug</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Zero Runtime Google Drive Guarantee */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-200">
            <div className="flex items-center gap-2 font-semibold text-emerald-300 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Self-Owned Library Guarantee</span>
            </div>
            <p className="text-emerald-200/80 leading-relaxed">
              At runtime, this platform makes <strong>zero calls to Google Drive</strong>. All assets are served directly from your own Cloudflare R2 bucket and Unlisted YouTube videos within the exact same native LMS course workspace.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
