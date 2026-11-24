'use client';

import React from 'react';
import { LessonItem } from '@/types';
import {
  Download,
  Terminal,
  FileArchive,
  CheckCircle2,
  HardDrive,
  ExternalLink,
  Folder,
  Info
} from 'lucide-react';

interface LabViewerProps {
  lesson: LessonItem;
  courseTitle: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  accentColor?: string;
}

export function LabViewer({
  lesson,
  courseTitle,
  isCompleted,
  onToggleComplete,
  accentColor = '#10B981',
}: LabViewerProps) {
  const fileId =
    lesson.fileId ||
    lesson.gdriveFileId ||
    (lesson.id.startsWith('gdrive-') ? lesson.id.replace('gdrive-', '') : lesson.id);

  const downloadUrl =
    lesson.download_url ||
    (fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : '#');

  const viewUrl =
    lesson.view_url ||
    (fileId ? `https://drive.google.com/file/d/${fileId}/view` : undefined);

  const fileExt = (lesson.name.split('.').pop() || 'ZIP').toUpperCase();
  const displayTitle = lesson.displayTitle || lesson.title || lesson.name;

  return (
    <div className="flex flex-col h-full bg-[#090D16] text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-[#1F2937] bg-[#0E1524]/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
            <FileArchive className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                Lab Environment Asset
              </span>
              {lesson.moduleName && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 max-w-[200px] truncate">
                  <Folder className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                  <span className="truncate">{lesson.moduleName}</span>
                </span>
              )}
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                .{fileExt}
              </span>
              {lesson.size_mb != null && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                  {lesson.size_mb} MB
                </span>
              )}
            </div>
            <h1 className="text-sm md:text-base font-semibold text-gray-100 truncate mt-0.5">
              {displayTitle}
            </h1>
          </div>
        </div>

        <button
          onClick={onToggleComplete}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            isCompleted
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:border-gray-600'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-400' : 'text-gray-400'}`} />
          <span>{isCompleted ? 'Lab Complete' : 'Mark Complete'}</span>
        </button>
      </div>

      {/* Main Terminal Lab Stage */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 flex items-center justify-center bg-[#05080E]">
        <div className="max-w-2xl w-full bg-[#0E1524] border border-[#1F2937] rounded-2xl overflow-hidden shadow-2xl">
          {/* Cyber Terminal Header */}
          <div className="px-5 py-3 bg-[#0B101E] border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-gray-400">lab_environment_package.sh</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-500">
              <Terminal className="w-3.5 h-3.5" />
              <span>Target Asset</span>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <HardDrive className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-white mb-1 truncate">
                  {displayTitle}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Offensive security lab virtual appliance, packet capture, or challenge archive. Import into VMware Workstation, VirtualBox, or Wireshark to practice active hands-on exploitation.
                </p>
                {lesson.name && lesson.name !== displayTitle && (
                  <p className="text-[11px] font-mono text-gray-500 mt-2 truncate">
                    File: {lesson.name}
                  </p>
                )}
              </div>
            </div>

            {/* Spec Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-black/40 rounded-xl border border-gray-800 font-mono text-xs">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase">Format</span>
                <span className="text-amber-400 font-bold">.{fileExt} Archive</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase">File Size</span>
                <span className="text-gray-200">
                  {lesson.size_mb != null ? `${lesson.size_mb} MB` : 'Direct Download'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase">Hypervisor</span>
                <span className="text-gray-200">VirtualBox / VMware</span>
              </div>
            </div>

            {/* Download CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download Lab Archive</span>
              </a>

              {viewUrl && (
                <a
                  href={viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  <span>View in Drive</span>
                </a>
              )}
            </div>

            {/* Verification Notice */}
            <div className="p-3 bg-[#0B101E] rounded-lg border border-gray-800 flex items-start gap-2 text-xs text-gray-400">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="text-cyan-400 font-medium">Isolated Sandbox Notice:</span> Always verify MD5/SHA256 checksums and run lab virtual machines in Host-Only or NAT network adapters.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
