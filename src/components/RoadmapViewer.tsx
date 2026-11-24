'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TocItem, RoadmapData } from '@/lib/roadmap';
import {
  Compass,
  CheckCircle2,
  Circle,
  Search,
  BookOpen,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Flame,
  Award,
  ListOrdered,
  Crosshair
} from 'lucide-react';

interface RoadmapViewerProps {
  initialData?: RoadmapData;
}

export function RoadmapViewer({ initialData }: RoadmapViewerProps) {
  const [data, setData] = useState<RoadmapData | null>(initialData || null);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  const STORAGE_KEY = 'cyber_lms_roadmap_completed_items';

  useEffect(() => {
    // Load saved completion state
    setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setCompletedItems(new Set(JSON.parse(saved)));
        }
      } catch (e) {
        console.warn('Could not read saved roadmap progress:', e);
      }
    }, 0);

    if (!initialData) {
      fetch('/api/roadmap')
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) {
            setData(res.data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [initialData]);

  const toggleItem = (id: string) => {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const resetAllProgress = () => {
    if (confirm('Reset all roadmap checkmarks and progress?')) {
      setCompletedItems(new Set());
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const scrollToHeading = (id: string) => {
    setActiveHeadingId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const tocList = data?.toc;
  const filteredToc = useMemo(() => {
    if (!tocList) return [];
    if (!searchFilter.trim()) return tocList;
    const q = searchFilter.toLowerCase();
    return tocList.filter((item) => item.title.toLowerCase().includes(q));
  }, [tocList, searchFilter]);

  const totalItemsCount = data?.totalMilestones || 100;
  const progressPercent = Math.min(
    100,
    Math.round((completedItems.size / Math.max(totalItemsCount, 1)) * 100)
  );

  return (
    <div className="flex flex-col h-full bg-[#090D16] text-white">
      {/* Top Banner */}
      <div className="px-6 py-4 border-b border-[#1F2937] bg-[#0E1524] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-red-400 font-bold">
                Red Team Operator Track
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40">
                Interactive Curriculum
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white mt-0.5">
              Red Team Career & Operations Roadmap
            </h1>
          </div>
        </div>

        {/* Progress Metric & Reset */}
        <div className="flex items-center gap-4 bg-[#111827] px-4 py-2.5 rounded-xl border border-[#1F2937]">
          <div className="min-w-[140px]">
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="text-gray-400">Roadmap Mastery:</span>
              <span className="font-bold text-red-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="border-l border-gray-700 pl-4 flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">
              <strong className="text-white">{completedItems.size}</strong> completed
            </span>
            {completedItems.size > 0 && (
              <button
                onClick={resetAllProgress}
                className="p-1 hover:text-red-400 text-gray-500 transition-colors"
                title="Reset Progress"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Split Screen Layout: Sidebar TOC + Main Markdown Content */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Table of Contents Sidebar */}
        <aside className="w-72 md:w-80 border-r border-[#1F2937] bg-[#0A0F1D] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#1F2937]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Filter sections..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-[#111827] text-gray-200 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-gray-800 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 px-2 py-1 block">
              Table of Contents ({filteredToc.length})
            </span>
            {filteredToc.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToHeading(item.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between group ${
                  activeHeadingId === item.id
                    ? 'bg-red-500/20 text-red-300 font-medium'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
                }`}
                style={{ paddingLeft: `${item.level * 8 + 8}px` }}
              >
                <span className="truncate">{item.title}</span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </aside>

        {/* Main Markdown Body */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-10 bg-[#090D16]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-3 text-gray-400 font-mono">
              <Compass className="w-8 h-8 animate-spin text-red-500" />
              <span>Fetching live Red Team Roadmap from GitHub...</span>
            </div>
          ) : data ? (
            <div className="max-w-4xl mx-auto prose prose-invert prose-red">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, children, ...props }) => {
                    const id = String(children)
                      .toLowerCase()
                      .replace(/[^\w\s-]/g, '')
                      .trim()
                      .replace(/\s+/g, '-');
                    return (
                      <h1
                        id={id}
                        className="text-2xl md:text-3xl font-extrabold text-white border-b border-[#1F2937] pb-3 mb-6 mt-10 scroll-mt-6"
                        {...props}
                      >
                        {children}
                      </h1>
                    );
                  },
                  h2: ({ node, children, ...props }) => {
                    const id = String(children)
                      .toLowerCase()
                      .replace(/[^\w\s-]/g, '')
                      .trim()
                      .replace(/\s+/g, '-');
                    return (
                      <h2
                        id={id}
                        className="text-xl md:text-2xl font-bold text-gray-100 border-b border-[#1F2937]/60 pb-2 mb-4 mt-8 scroll-mt-6 flex items-center justify-between group"
                        {...props}
                      >
                        <span>{children}</span>
                      </h2>
                    );
                  },
                  h3: ({ node, children, ...props }) => {
                    const id = String(children)
                      .toLowerCase()
                      .replace(/[^\w\s-]/g, '')
                      .trim()
                      .replace(/\s+/g, '-');
                    return (
                      <h3
                        id={id}
                        className="text-lg md:text-xl font-semibold text-gray-200 mb-3 mt-6 scroll-mt-6"
                        {...props}
                      >
                        {children}
                      </h3>
                    );
                  },
                  p: ({ node, ...props }) => (
                    <p className="text-gray-300 leading-relaxed mb-4 text-sm md:text-base" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="space-y-2 mb-4 pl-0 list-none" {...props} />
                  ),
                  li: ({ node, children, ...props }) => {
                    // Check if list item has an interactive item or plain text
                    const rawText = String(children);
                    const cleanId = `item-${rawText.substring(0, 32).toLowerCase().replace(/[^\w]/g, '-')}`;
                    const isChecked = completedItems.has(cleanId);

                    return (
                      <li className="flex items-start gap-2.5 text-sm text-gray-300 group py-0.5" {...props}>
                        <button
                          type="button"
                          onClick={() => toggleItem(cleanId)}
                          className="mt-1 text-gray-500 hover:text-red-400 transition-colors shrink-0"
                          title="Toggle milestone completion"
                        >
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-red-500 fill-red-500/20" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-600 group-hover:text-red-400" />
                          )}
                        </button>
                        <span className={`leading-relaxed ${isChecked ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                          {children}
                        </span>
                      </li>
                    );
                  },
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-red-500 bg-[#160E14] px-4 py-3 rounded-r-lg my-4 text-gray-300 not-italic" {...props} />
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
                }}
              >
                {data.markdown}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">No roadmap data loaded.</div>
          )}
        </main>
      </div>
    </div>
  );
}
