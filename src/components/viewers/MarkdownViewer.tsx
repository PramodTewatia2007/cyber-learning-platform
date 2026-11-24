'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { LessonItem } from '@/types';
import {
  FileCode,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Download,
  Clock,
  Globe,
  Folder,
  ArrowUpRight
} from 'lucide-react';

interface MarkdownViewerProps {
  lesson: LessonItem;
  courseTitle: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  accentColor?: string;
}

export function MarkdownViewer({
  lesson,
  courseTitle,
  isCompleted,
  onToggleComplete,
  accentColor = '#10B981',
}: MarkdownViewerProps) {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const rawContent = (lesson.content || '').trim();
  const isSingleUrl = /^https?:\/\/[^\s\r\n]+$/.test(rawContent);
  const displayTitle = lesson.displayTitle || lesson.title || lesson.name;

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const wordCount = rawContent ? rawContent.split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex flex-col h-full bg-[#090D16] text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-[#1F2937] bg-[#0E1524]/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            {isSingleUrl ? <Globe className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                {isSingleUrl ? 'External Resource / Tool' : 'Documentation & Roadmap'}
              </span>
              {lesson.moduleName && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 max-w-[200px] truncate">
                  <Folder className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                  <span className="truncate">{lesson.moduleName}</span>
                </span>
              )}
              {!isSingleUrl && wordCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                  <Clock className="w-3 h-3" />
                  {readingTime} min read
                </span>
              )}
            </div>
            <h1 className="text-sm md:text-base font-semibold text-gray-100 truncate mt-0.5">
              {displayTitle}
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

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 md:px-10 md:py-8 bg-[#090D16]">
        {isSingleUrl ? (
          /* Single URL Resource Card */
          <div className="max-w-2xl mx-auto my-8 p-6 md:p-8 rounded-2xl bg-[#0D1321] border border-[#1F2937] shadow-xl text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
              <Globe className="w-7 h-7" />
            </div>

            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest">
              Direct Tool / External Resource
            </span>
            <h2 className="text-lg md:text-xl font-bold text-white mt-1 mb-2">
              {displayTitle}
            </h2>
            <p className="text-xs text-gray-400 max-w-md mb-6 leading-relaxed">
              This reference contains a curated external tool link, official documentation, or repository. Click below to open it in a new window.
            </p>

            <div className="w-full p-3.5 rounded-xl bg-[#05080E] border border-gray-800 text-xs font-mono text-emerald-400 break-all mb-6 select-all">
              {rawContent}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={rawContent}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-lg shadow-emerald-950/50"
              >
                <span>Open Resource Link</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              {lesson.view_url && (
                <a
                  href={lesson.view_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-xs transition-colors border border-gray-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View in Drive</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          /* Rich Markdown & HTML Document */
          <div className="max-w-4xl mx-auto">
            {/* Top Action Bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-800 text-xs text-gray-400">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lesson.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {lesson.view_url && (
                  <a
                    href={lesson.view_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View in Drive</span>
                  </a>
                )}
                {lesson.download_url && (
                  <a
                    href={lesson.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                )}
              </div>
            </div>

            <div className="prose prose-invert prose-emerald max-w-none text-gray-300">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({ node: _node, ...props }) => (
                    <h1 className="text-2xl md:text-3xl font-bold text-white border-b border-[#1F2937] pb-3 mb-6 mt-8" {...props} />
                  ),
                  h2: ({ node: _node, ...props }) => (
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-100 border-b border-[#1F2937]/60 pb-2 mb-4 mt-8" {...props} />
                  ),
                  h3: ({ node: _node, ...props }) => (
                    <h3 className="text-lg md:text-xl font-medium text-gray-200 mb-3 mt-6" {...props} />
                  ),
                  p: ({ node: _node, ...props }) => (
                    <p className="text-gray-300 leading-relaxed mb-4 text-sm md:text-base" {...props} />
                  ),
                  ul: ({ node: _node, ...props }) => (
                    <ul className="list-disc list-inside space-y-1.5 text-gray-300 mb-4 pl-2" {...props} />
                  ),
                  ol: ({ node: _node, ...props }) => (
                    <ol className="list-decimal list-inside space-y-1.5 text-gray-300 mb-4 pl-2" {...props} />
                  ),
                  details: ({ node: _node, ...props }) => (
                    <details className="my-4 p-4 rounded-xl bg-[#0D1424] border border-[#1F2937] text-gray-300 open:border-emerald-500/40 transition-colors" {...props} />
                  ),
                  summary: ({ node: _node, ...props }) => (
                    <summary className="font-semibold text-white cursor-pointer select-none hover:text-emerald-400 py-1 transition-colors" {...props} />
                  ),
                  blockquote: ({ node: _node, ...props }) => (
                    <blockquote className="border-l-4 border-emerald-500 bg-[#0E1726] px-4 py-3 rounded-r-lg my-4 text-gray-300 not-italic" {...props} />
                  ),
                  table: ({ node: _node, ...props }) => (
                    <div className="overflow-x-auto my-6 border border-[#1F2937] rounded-lg">
                      <table className="w-full text-left text-sm text-gray-300 border-collapse" {...props} />
                    </div>
                  ),
                  th: ({ node: _node, ...props }) => (
                    <th className="bg-[#111827] px-4 py-2.5 font-semibold text-gray-200 border-b border-[#1F2937]" {...props} />
                  ),
                  td: ({ node: _node, ...props }) => (
                    <td className="px-4 py-2.5 border-b border-[#1F2937]/50 text-gray-300" {...props} />
                  ),
                  a: ({ node: _node, ...props }) => (
                    <a className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2" target="_blank" rel="noreferrer" {...props} />
                  ),
                  code: ({ node: _node, className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { node?: unknown }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !String(children).includes('\n');
                    const codeString = String(children).replace(/\n$/, '');
                    const codeId = `code-${Math.random().toString(36).substring(2, 9)}`;

                    if (isInline) {
                      return (
                        <code className="bg-gray-800 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                          {children}
                        </code>
                      );
                    }

                    return (
                      <div className="relative my-4 rounded-xl overflow-hidden border border-[#1F2937] bg-[#05080E]">
                        <div className="flex items-center justify-between px-4 py-2 bg-[#0B0F19] border-b border-[#1F2937] text-xs text-gray-400 font-mono">
                          <span>{match ? match[1] : 'code'}</span>
                          <button
                            onClick={() => copyCode(codeString, codeId)}
                            className="flex items-center gap-1 hover:text-white transition-colors"
                          >
                            {copiedCodeId === codeId ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-xs md:text-sm font-mono text-gray-200 leading-relaxed">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    );
                  },
                }}
              >
                {rawContent || `*No document content available for this lesson.*`}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
