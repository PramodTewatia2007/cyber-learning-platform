'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LessonItem } from '@/types';
import { getMediaUrl } from '@/lib/r2';
import {
  FileCode,
  Copy,
  Check,
  CheckCircle2,
  Download,
  Clock,
  RefreshCw
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
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const mediaUrl = lesson.r2Key ? getMediaUrl(lesson.r2Key) : `/api/media/${encodeURI(lesson.name)}`;

    fetch(mediaUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load markdown content');
        return res.text();
      })
      .then((text) => {
        if (isMounted) {
          setContent(text);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setContent(`# ${lesson.title || lesson.name}\n\n*Lesson notes retrieved from self-owned storage.*\n\n\`\`\`bash\n# Diagnostic file info\nLesson: ${lesson.title}\nSource: ${lesson.source}\nStorage Key: ${lesson.r2Key || 'Local'}\n\`\`\``);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [lesson.id, lesson.r2Key, lesson.name, lesson.title, lesson.source]);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex flex-col h-full bg-[#090D16] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#1F2937] bg-[#0E1524]/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0">
            <FileCode className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">Documentation & Notes</span>
              <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                <Clock className="w-3 h-3" />
                {readingTime} min read
              </span>
            </div>
            <h1 className="text-sm md:text-base font-semibold text-gray-100 truncate mt-0.5">
              {lesson.title || lesson.name}
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

      {/* Main Markdown Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8 md:px-12 md:py-10 bg-[#090D16]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
            <span className="text-sm font-mono">Loading notes from cloud storage...</span>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto prose prose-invert prose-emerald max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-2xl md:text-3xl font-bold text-white border-b border-[#1F2937] pb-3 mb-6 mt-8" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-100 border-b border-[#1F2937]/60 pb-2 mb-4 mt-8" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-lg md:text-xl font-medium text-gray-200 mb-3 mt-6" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-gray-300 leading-relaxed mb-4 text-sm md:text-base" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside space-y-1.5 text-gray-300 mb-4 pl-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-300 mb-4 pl-2" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-emerald-500 bg-[#0E1726] px-4 py-3 rounded-r-lg my-4 text-gray-300 not-italic" {...props} />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-6 border border-[#1F2937] rounded-lg">
                    <table className="w-full text-left text-sm text-gray-300 border-collapse" {...props} />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th className="bg-[#111827] px-4 py-2.5 font-semibold text-gray-200 border-b border-[#1F2937]" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="px-4 py-2.5 border-b border-[#1F2937]/50" {...props} />
                ),
                code: ({ node, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  const isInline = !match && !codeString.includes('\n');
                  const codeId = `code-${Math.random().toString(36).substring(7)}`;

                  if (isInline) {
                    return (
                      <code className="bg-[#111827] text-emerald-400 px-1.5 py-0.5 rounded font-mono text-xs border border-gray-800" {...props}>
                        {children}
                      </code>
                    );
                  }

                  return (
                    <div className="relative my-4 rounded-xl overflow-hidden border border-[#1F2937] bg-[#070B14] group">
                      <div className="flex items-center justify-between px-4 py-1.5 bg-[#0E1524] border-b border-[#1F2937] text-xs font-mono text-gray-400">
                        <span>{match ? match[1].toUpperCase() : 'BASH'}</span>
                        <button
                          onClick={() => copyCode(codeString, codeId)}
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
                        >
                          {copiedCodeId === codeId ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 overflow-x-auto text-xs md:text-sm font-mono text-gray-200 bg-[#070B14] leading-relaxed">
                        <code>{children}</code>
                      </pre>
                    </div>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-2.5 border-t border-[#1F2937] bg-[#0A0F1D] flex items-center justify-between text-xs text-gray-400 shrink-0">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>Rendered Natively</span>
        </div>
        <span className="text-gray-500 font-mono text-[11px]">{wordCount} words</span>
      </div>
    </div>
  );
}
