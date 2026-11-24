'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  UnifiedLesson,
  LessonVideoItem,
  LessonPdfItem,
  LessonNoteItem,
  LessonLabItem
} from '@/types';
import { LessonNotes } from './LessonNotes';
import { Youtube } from './YoutubeIcon';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  Film,
  FileText,
  FileCode,
  FileArchive,
  Globe,
  HardDrive,
  Clock,
  Subtitles,
  Copy,
  Check,
  Folder,
  ArrowUpRight,
  Sparkles,
  Layers,
  Terminal,
  Info
} from 'lucide-react';

interface UnifiedLessonViewerProps {
  lesson: UnifiedLesson;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
}

export function UnifiedLessonViewer({
  lesson,
  isCompleted,
  onToggleComplete,
  onNextLesson,
  onPrevLesson,
}: UnifiedLessonViewerProps) {
  const [activePdfIndex, setActivePdfIndex] = useState<number>(0);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number>(0);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'pdf' | 'notes' | 'labs'>('all');

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const hasVideos = lesson.videos.length > 0;
  const hasPdfs = lesson.pdfs.length > 0;
  const hasNotes = lesson.notes.length > 0;
  const hasLabs = lesson.labs.length > 0;

  const currentPdf: LessonPdfItem | undefined = lesson.pdfs[activePdfIndex] || lesson.pdfs[0];
  const currentNote: LessonNoteItem | undefined = lesson.notes[activeNoteIndex] || lesson.notes[0];

  return (
    <div className="flex flex-col h-full bg-[#090D16] text-white overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-[#1F2937] bg-[#0A0F1D]/90 backdrop-blur shrink-0 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              style={{
                backgroundColor: `${lesson.trackAccent}20`,
                color: lesson.trackAccent,
                borderColor: `${lesson.trackAccent}40`
              }}
              className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-semibold tracking-wider"
            >
              {lesson.track}
            </span>
            {lesson.course && lesson.course !== lesson.track && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 truncate max-w-[240px]">
                {lesson.course}
              </span>
            )}
            {/* Quick Material Counts */}
            <div className="flex items-center gap-1.5 ml-1">
              {hasVideos && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40">
                  <Film className="w-2.5 h-2.5 text-red-400" />
                  {lesson.videos.length} {lesson.videos.length === 1 ? 'Video' : 'Videos'}
                </span>
              )}
              {hasPdfs && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">
                  <FileText className="w-2.5 h-2.5 text-blue-400" />
                  {lesson.pdfs.length} PDF
                </span>
              )}
              {hasNotes && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                  <FileCode className="w-2.5 h-2.5 text-emerald-400" />
                  {lesson.notes.length} {lesson.notes.length === 1 ? 'Note' : 'Notes'}
                </span>
              )}
              {hasLabs && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                  <FileArchive className="w-2.5 h-2.5 text-amber-400" />
                  {lesson.labs.length} Lab
                </span>
              )}
            </div>
          </div>

          <h1 className="text-lg md:text-2xl font-extrabold text-white tracking-tight truncate">
            {lesson.title}
          </h1>
        </div>

        {/* Right Navigation & Completion Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleComplete}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shadow-sm ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-gray-800/90 text-gray-300 border-gray-700 hover:border-gray-600'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-400' : 'text-gray-400'}`} />
            <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
          </button>

          {onPrevLesson && (
            <button
              onClick={onPrevLesson}
              className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
              title="Previous Lesson"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {onNextLesson && (
            <button
              onClick={onNextLesson}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition-colors"
              title="Next Lesson"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Sub-Tabs (if lesson has multiple resource types) */}
      {(Number(hasVideos) + Number(hasPdfs) + Number(hasNotes) + Number(hasLabs) > 1) && (
        <div className="px-6 py-2 border-b border-[#1F2937] bg-[#070B14] flex items-center gap-2 shrink-0 overflow-x-auto text-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mr-1">View:</span>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg font-mono transition-colors ${
              activeTab === 'all'
                ? 'bg-gray-800 text-white font-semibold border border-gray-700'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Materials
          </button>
          {hasVideos && (
            <button
              onClick={() => setActiveTab('video')}
              className={`px-3 py-1 rounded-lg font-mono transition-colors flex items-center gap-1.5 ${
                activeTab === 'video'
                  ? 'bg-red-950/60 text-red-300 border border-red-800 font-semibold'
                  : 'text-gray-400 hover:text-red-300'
              }`}
            >
              <Film className="w-3 h-3 text-red-400" />
              <span>Video ({lesson.videos.length})</span>
            </button>
          )}
          {hasPdfs && (
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-3 py-1 rounded-lg font-mono transition-colors flex items-center gap-1.5 ${
                activeTab === 'pdf'
                  ? 'bg-blue-950/60 text-blue-300 border border-blue-800 font-semibold'
                  : 'text-gray-400 hover:text-blue-300'
              }`}
            >
              <FileText className="w-3 h-3 text-blue-400" />
              <span>PDFs ({lesson.pdfs.length})</span>
            </button>
          )}
          {hasNotes && (
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1 rounded-lg font-mono transition-colors flex items-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800 font-semibold'
                  : 'text-gray-400 hover:text-emerald-300'
              }`}
            >
              <FileCode className="w-3 h-3 text-emerald-400" />
              <span>Notes ({lesson.notes.length})</span>
            </button>
          )}
          {hasLabs && (
            <button
              onClick={() => setActiveTab('labs')}
              className={`px-3 py-1 rounded-lg font-mono transition-colors flex items-center gap-1.5 ${
                activeTab === 'labs'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800 font-semibold'
                  : 'text-gray-400 hover:text-amber-300'
              }`}
            >
              <FileArchive className="w-3 h-3 text-amber-400" />
              <span>Labs ({lesson.labs.length})</span>
            </button>
          )}
        </div>
      )}

      {/* Main Content Scroll Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 md:px-8 md:py-8 space-y-8 bg-[#090D16]">
        {/* ================================================================= */}
        {/* 1. VIDEO SECTION (Redirects to YouTube) */}
        {/* ================================================================= */}
        {hasVideos && (activeTab === 'all' || activeTab === 'video') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-red-950/50">
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-red-400">
                <div className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <Youtube className="w-3.5 h-3.5 text-red-400" />
                </div>
                <span>Video Lectures &amp; YouTube Direct</span>
              </div>
              <span className="text-[11px] font-mono text-gray-500">
                Click to watch on YouTube
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {lesson.videos.map((vid) => (
                <div
                  key={vid.file_id}
                  className="rounded-2xl bg-gradient-to-r from-[#0E1526] to-[#0A101D] border border-[#1F2937] hover:border-red-500/50 p-4 md:p-5 transition-all shadow-lg hover:shadow-red-950/20 group relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <a
                      href={vid.youtubeRedirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start sm:items-center gap-4 min-w-0 flex-1 group"
                    >
                      {/* Play Preview Badge */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:border-red-500 transition-all duration-300 shadow-md">
                        <Youtube className="w-7 h-7 text-red-500 group-hover:text-white transition-colors" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/70 text-red-300 border border-red-800/50 font-bold uppercase">
                            YouTube Video
                          </span>
                          {typeof vid.duration_min === 'number' && vid.duration_min > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                              <Clock className="w-2.5 h-2.5 text-emerald-400" />
                              {vid.duration_min} min
                            </span>
                          )}
                          {vid.size_mb != null && (
                            <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                              <HardDrive className="w-2.5 h-2.5 text-blue-400" />
                              {vid.size_mb} MB
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm md:text-base font-bold text-gray-100 group-hover:text-red-400 transition-colors leading-snug">
                          {vid.clean_title || vid.title}
                        </h3>

                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                          Target topic for {lesson.track}. Launches lecture directly on YouTube.
                        </p>
                      </div>
                    </a>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-800">
                      {vid.subtitleUrl && (
                        <a
                          href={vid.subtitleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-800/50 text-xs font-mono transition-colors"
                          title="Download Subtitles (.srt)"
                        >
                          <Subtitles className="w-3.5 h-3.5 text-purple-400" />
                          <span className="hidden md:inline">Subtitles</span>
                        </a>
                      )}

                      <a
                        href={vid.youtubeRedirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-lg shadow-red-950/50 group-hover:scale-105"
                      >
                        <span>Watch on YouTube</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* 2. PDFS SECTION (Inline Drive Preview Iframe) */}
        {/* ================================================================= */}
        {hasPdfs && currentPdf && (activeTab === 'all' || activeTab === 'pdf') && (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-blue-950/50">
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-blue-400">
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span>PDF Documents &amp; Manuals ({lesson.pdfs.length})</span>
              </div>

              {/* PDF Switcher Tabs if multiple */}
              {lesson.pdfs.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  {lesson.pdfs.map((p, idx) => (
                    <button
                      key={p.file_id}
                      onClick={() => setActivePdfIndex(idx)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors truncate max-w-[180px] ${
                        activePdfIndex === idx
                          ? 'bg-blue-950 text-blue-300 border border-blue-700 font-bold'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {p.clean_title || `Doc ${idx + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active PDF Viewer Container */}
            <div className="rounded-2xl border border-[#1F2937] bg-[#070B14] overflow-hidden shadow-2xl flex flex-col">
              {/* PDF Action Bar */}
              <div className="px-4 py-2.5 bg-[#0C1220] border-b border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="font-semibold text-gray-200 truncate">{currentPdf.clean_title}</span>
                  {currentPdf.size_mb != null && (
                    <span className="text-[10px] font-mono text-gray-500">
                      ({currentPdf.size_mb} MB)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {currentPdf.view_url && (
                    <a
                      href={currentPdf.view_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-700 text-xs font-mono transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-blue-400" />
                      <span>Open in New Tab</span>
                    </a>
                  )}

                  {currentPdf.download_url && (
                    <a
                      href={currentPdf.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-mono transition-colors"
                    >
                      <Download className="w-3 h-3 text-emerald-400" />
                      <span>Download PDF</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Embedded Google Drive PDF Iframe */}
              <div className="relative w-full h-[75vh] bg-[#05080E]">
                {currentPdf.embed_url ? (
                  <iframe
                    key={currentPdf.file_id}
                    src={currentPdf.embed_url}
                    title={currentPdf.clean_title}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-700 mb-2" />
                    <p className="text-sm">Preview link not available for this document.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* 3. NOTES & RESOURCES SECTION */}
        {/* ================================================================= */}
        {hasNotes && currentNote && (activeTab === 'all' || activeTab === 'notes') && (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-emerald-950/50">
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>Notes &amp; Curated Resources ({lesson.notes.length})</span>
              </div>

              {/* Note Switcher Tabs if multiple */}
              {lesson.notes.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  {lesson.notes.map((n, idx) => (
                    <button
                      key={n.file_id}
                      onClick={() => setActiveNoteIndex(idx)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors truncate max-w-[180px] ${
                        activeNoteIndex === idx
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {n.clean_title || `Note ${idx + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Note Display Card */}
            <div className="rounded-2xl border border-[#1F2937] bg-[#0D1424] overflow-hidden shadow-2xl p-6 md:p-8">
              {currentNote.is_url ? (
                /* Single URL Link Card */
                <div className="max-w-xl mx-auto my-4 text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3">
                    <Globe className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                    External Resource / Tool Link
                  </span>
                  <h3 className="text-base md:text-lg font-bold text-white mt-1 mb-2">
                    {currentNote.clean_title}
                  </h3>
                  <div className="w-full p-3 rounded-xl bg-[#05080E] border border-gray-800 text-xs font-mono text-emerald-400 break-all mb-4 select-all">
                    {(currentNote.content || '').trim()}
                  </div>
                  <a
                    href={(currentNote.content || '').trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-950/50"
                  >
                    <span>Open External Resource</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              ) : currentNote.content ? (
                /* Inline Markdown / Text */
                <div>
                  <div className="flex items-center justify-between pb-3 mb-6 border-b border-gray-800 text-xs text-gray-400 font-mono">
                    <span className="text-emerald-400 font-semibold">{currentNote.clean_title}</span>
                    {currentNote.view_url && (
                      <a
                        href={currentNote.view_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-white"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Source</span>
                      </a>
                    )}
                  </div>

                  <div className="prose prose-invert prose-emerald max-w-none text-gray-300">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        h1: ({ node, ...props }) => (
                          <h1 className="text-xl md:text-2xl font-bold text-white border-b border-[#1F2937] pb-3 mb-5 mt-6" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="text-lg md:text-xl font-semibold text-gray-100 border-b border-[#1F2937]/60 pb-2 mb-4 mt-6" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-base md:text-lg font-medium text-gray-200 mb-2 mt-4" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="text-gray-300 leading-relaxed mb-4 text-xs md:text-sm" {...props} />
                        ),
                        details: ({ node, ...props }) => (
                          <details className="my-3 p-3.5 rounded-xl bg-[#080D1A] border border-[#1F2937] text-gray-300 open:border-emerald-500/40 transition-colors" {...props} />
                        ),
                        summary: ({ node, ...props }) => (
                          <summary className="font-semibold text-white cursor-pointer select-none hover:text-emerald-400 py-1 transition-colors text-xs md:text-sm" {...props} />
                        ),
                        code: ({ node, className, children, ...props }: any) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const isInline = !match && !String(children).includes('\n');
                          const codeString = String(children).replace(/\n$/, '');
                          const codeId = `c-${Math.random().toString(36).substring(2, 7)}`;

                          if (isInline) {
                            return (
                              <code className="bg-gray-800 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                {children}
                              </code>
                            );
                          }

                          return (
                            <div className="relative my-3 rounded-xl overflow-hidden border border-[#1F2937] bg-[#05080E]">
                              <div className="flex items-center justify-between px-3 py-1.5 bg-[#0A0F1D] border-b border-[#1F2937] text-[11px] text-gray-400 font-mono">
                                <span>{match ? match[1] : 'code'}</span>
                                <button
                                  onClick={() => copyCode(codeString, codeId)}
                                  className="flex items-center gap-1 hover:text-white"
                                >
                                  {copiedCodeId === codeId ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="p-3.5 overflow-x-auto text-xs font-mono text-gray-200 leading-relaxed">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            </div>
                          );
                        },
                      }}
                    >
                      {currentNote.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                /* Fallback HTML or Code Drive Preview */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-gray-400 pb-2 border-b border-gray-800">
                    <span>{currentNote.clean_title}</span>
                    {currentNote.view_url && (
                      <a
                        href={currentNote.view_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-emerald-400 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in New Tab</span>
                      </a>
                    )}
                  </div>
                  {currentNote.embed_url && (
                    <div className="relative w-full h-[60vh] rounded-xl overflow-hidden border border-gray-800">
                      <iframe
                        src={currentNote.embed_url}
                        title={currentNote.clean_title}
                        className="w-full h-full border-0"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* 4. LAB DOWNLOADS SECTION */}
        {/* ================================================================= */}
        {hasLabs && (activeTab === 'all' || activeTab === 'labs') && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-amber-950/50 text-xs font-mono font-bold tracking-wider uppercase text-amber-400">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <FileArchive className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span>Hands-On Lab Environments &amp; Archives ({lesson.labs.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.labs.map((lab) => (
                <div
                  key={lab.file_id}
                  className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#121829] to-[#0A0F1D] p-5 flex flex-col justify-between shadow-xl"
                >
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/40 font-bold">
                        Target Lab Asset
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                        {lab.clean_title}
                      </h4>
                      <p className="text-[11px] font-mono text-gray-400 mt-1">
                        Format: .ZIP / VM Appliance • High-speed download
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-800/80">
                    <a
                      href={lab.download_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs transition-transform transform active:scale-95 shadow-md shadow-amber-500/20"
                    >
                      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Download Lab Archive</span>
                    </a>

                    {lab.view_url && (
                      <a
                        href={lab.view_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 text-xs font-mono transition-colors"
                        title="View in Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Personal Notes Section */}
        <div className="pt-4">
          <LessonNotes fileId={lesson.id} lessonName={lesson.title} />
        </div>
      </div>
    </div>
  );
}
