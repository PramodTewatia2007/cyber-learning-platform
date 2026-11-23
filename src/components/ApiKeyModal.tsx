'use client';

import React, { useState } from 'react';
import {
  Key,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Terminal,
  FolderSync
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
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Google Drive API Integration</h2>
              {isConfigured ? (
                <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  API KEY ACTIVE
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  DEMO MODE (KEY OPTIONAL)
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Securely stream files from Google Drive folders without exposing credentials or external links.
            </p>
          </div>
        </div>

        {/* 2-Minute Quick Setup Guide */}
        <div className="space-y-4">
          <div className="bg-[#0A0F1D] p-4 rounded-xl border border-gray-800">
            <h3 className="text-xs font-mono font-semibold uppercase text-emerald-400 mb-3 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>2-Minute Setup: Generate Free Google Drive API Key</span>
            </h3>

            <div className="space-y-3 text-xs text-gray-300">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-600/40 text-emerald-300 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-medium text-white">Open Google Cloud Console</p>
                  <p className="text-gray-400 mt-0.5">
                    Navigate to Google Cloud Console and create or select an existing project.
                  </p>
                  <a
                    href="https://console.cloud.google.com/apis/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline mt-1 font-mono"
                  >
                    <span>console.cloud.google.com/apis</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-600/40 text-emerald-300 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-medium text-white">Enable Google Drive API v3</p>
                  <p className="text-gray-400 mt-0.5">
                    Click <strong>&quot;Enable APIs and Services&quot;</strong>, search for <strong>&quot;Google Drive API&quot;</strong>, and click <strong>&quot;Enable&quot;</strong>.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-600/40 text-emerald-300 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-medium text-white">Create Credentials (API Key)</p>
                  <p className="text-gray-400 mt-0.5">
                    Go to <strong>Credentials</strong> &gt; <strong>Create Credentials</strong> &gt; <strong>API Key</strong>.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-600/40 text-emerald-300 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div className="w-full">
                  <p className="font-medium text-white">Store in `.env.local`</p>
                  <p className="text-gray-400 mt-0.5">
                    Add the API key to your project&apos;s environment file:
                  </p>
                  <div className="mt-1.5 flex items-center justify-between bg-black/60 px-3 py-2 rounded-lg border border-gray-800 font-mono text-[11px] text-gray-300">
                    <code>GOOGLE_DRIVE_API_KEY=AIzaSy...</code>
                    <button
                      onClick={() => copyText('GOOGLE_DRIVE_API_KEY=your_key_here', 4)}
                      className="text-gray-400 hover:text-white"
                      title="Copy syntax"
                    >
                      {copiedStep === 4 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Zero Drive Links Guarantee */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 text-xs text-blue-200">
            <div className="flex items-center gap-2 font-semibold text-blue-300 mb-1">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Zero External Links Guarantee</span>
            </div>
            <p className="text-blue-200/80 leading-relaxed">
              Your API key and folder URLs remain strictly on the Next.js server. The client browser only communicates with internal proxy routes (<code className="bg-blue-950 px-1 py-0.5 rounded">/api/content/*</code> and <code className="bg-blue-950 px-1 py-0.5 rounded">/api/download/*</code>) ensuring complete isolation.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
