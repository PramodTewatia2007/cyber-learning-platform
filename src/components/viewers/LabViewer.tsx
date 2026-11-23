'use client';

import React from 'react';
import { DriveFile } from '@/types';
import {
  Download,
  Terminal,
  Shield,
  FileArchive,
  CheckCircle2,
  HardDrive,
  Cpu,
  KeyRound,
  ExternalLink,
  Copy,
  Info
} from 'lucide-react';

interface LabViewerProps {
  file: DriveFile;
  courseTitle: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  accentColor?: string;
}

export function LabViewer({
  file,
  courseTitle,
  isCompleted,
  onToggleComplete,
  accentColor = '#10B981',
}: LabViewerProps) {
  const downloadUrl = `/api/download/${file.id}`;
  const fileExt = file.name.split('.').pop()?.toUpperCase() || 'ZIP';

  return (
    <div className="flex flex-col h-full bg-[#090D16] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#1F2937] bg-[#0E1524]/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
            <FileArchive className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                Lab Environment Asset
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                .{fileExt}
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

      {/* Main Lab Terminal Card */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 md:p-12 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-[#0E1524] rounded-2xl border border-[#1F2937] p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle tactical glow background */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ backgroundColor: accentColor }}
          />

          {/* Asset Meta Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#1F2937]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center text-amber-400 shadow-inner">
                <FileArchive className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-mono text-gray-400">PRACTICAL CHALLENGE FILE</span>
                <h2 className="text-lg font-bold text-white mt-0.5">{file.name}</h2>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 font-mono">
                  <span>Size: {file.formattedSize || 'Unknown'}</span>
                  <span>•</span>
                  <span>Direct Site Download</span>
                </div>
              </div>
            </div>

            {/* Direct Proxy Download Button */}
            <a
              href={downloadUrl}
              download
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Lab Asset</span>
            </a>
          </div>

          {/* Lab Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
            <div className="bg-[#111827] p-4 rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-mono">
                <HardDrive className="w-4 h-4 text-blue-400" />
                <span>ENVIRONMENT</span>
              </div>
              <p className="text-sm font-semibold text-gray-200 mt-2">
                {fileExt === 'OVA' ? 'VirtualBox / VMware' : fileExt === 'PCAP' ? 'Wireshark / Zeek' : 'Docker / Linux VM'}
              </p>
            </div>

            <div className="bg-[#111827] p-4 rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-mono">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>RECOMMENDED SPECS</span>
              </div>
              <p className="text-sm font-semibold text-gray-200 mt-2">2 Cores • 4GB RAM • Host-Only</p>
            </div>

            <div className="bg-[#111827] p-4 rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-mono">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>DEFAULT CREDS</span>
              </div>
              <p className="text-sm font-mono text-emerald-400 mt-2">root:toor / msfadmin</p>
            </div>
          </div>

          {/* Quick Terminal Setup Instructions */}
          <div className="bg-[#080C14] rounded-xl border border-[#1F2937] p-4 font-mono text-xs text-gray-300">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-800 text-gray-400">
              <span className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Terminal Quickstart</span>
              </span>
              <span className="text-[10px] text-gray-500">BASH / POWERSHELL</span>
            </div>
            {fileExt === 'OVA' ? (
              <div className="space-y-1.5 text-gray-400">
                <p className="text-gray-500"># 1. Import Virtual Machine into VirtualBox</p>
                <p className="text-emerald-400">VBoxManage import &quot;{file.name}&quot; --vsys 0 --vmname &quot;CyberLab-Target&quot;</p>
                <p className="text-gray-500 mt-2"># 2. Configure Host-Only Network Adapter</p>
                <p className="text-emerald-400">VBoxManage modifyvm &quot;CyberLab-Target&quot; --nic1 hostonly --hostonlyadapter1 vboxnet0</p>
              </div>
            ) : fileExt === 'PCAP' || fileExt === 'PCAPNG' ? (
              <div className="space-y-1.5 text-gray-400">
                <p className="text-gray-500"># 1. Read packet capture summary with tshark</p>
                <p className="text-emerald-400">tshark -r &quot;{file.name}&quot; -q -z io,phs</p>
                <p className="text-gray-500 mt-2"># 2. Filter for HTTP credentials or POST requests</p>
                <p className="text-emerald-400">tshark -r &quot;{file.name}&quot; -Y &quot;http.request.method == POST&quot;</p>
              </div>
            ) : (
              <div className="space-y-1.5 text-gray-400">
                <p className="text-gray-500"># 1. Verify sha256 checksum after download</p>
                <p className="text-emerald-400">sha256sum &quot;{file.name}&quot;</p>
                <p className="text-gray-500 mt-2"># 2. Extract contents and run local compose</p>
                <p className="text-emerald-400">unzip &quot;{file.name}&quot; &amp;&amp; cd lab &amp;&amp; docker compose up -d</p>
              </div>
            )}
          </div>

          {/* Legal / Sandbox Disclaimer */}
          <div className="flex items-start gap-3 mt-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90">
            <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Isolated Sandbox Requirement:</span>
              <p className="mt-0.5 text-amber-200/80">
                Always run lab target machines within an isolated Host-Only virtualization adapter. Never expose vulnerable challenge targets to public networks or corporate Wi-Fi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
