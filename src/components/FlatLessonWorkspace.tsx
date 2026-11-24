'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { UnifiedLesson, TrackMeta } from '@/types';
import { UnifiedLessonViewer } from './UnifiedLessonViewer';
import { ReportBrokenModal } from './ReportBrokenModal';
import { useAuth } from '@/lib/supabase/authContext';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  Circle,
  Menu,
  X,
  Film,
  FileText,
  FileCode,
  FileArchive,
  ChevronDown,
  Layers,
  AlertTriangle,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface FlatLessonWorkspaceProps {
  initialLessons: UnifiedLesson[];
  tracks: TrackMeta[];
  initialTrackId?: string;
  initialLessonId?: string;
}

export function FlatLessonWorkspace({
  initialLessons,
  tracks,
  initialTrackId = 'all',
  initialLessonId,
}: FlatLessonWorkspaceProps) {
  const { user } = useAuth();
  const configured = isSupabaseConfigured();

  const [selectedTrackId, setSelectedTrackId] = useState<string>(initialTrackId);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Filter lessons by track
  const trackLessons = useMemo(() => {
    if (!selectedTrackId || selectedTrackId === 'all') {
      return initialLessons;
    }
    return initialLessons.filter((l) => l.trackId === selectedTrackId);
  }, [initialLessons, selectedTrackId]);

  // Filter lessons by search query
  const filteredLessons = useMemo(() => {
    if (!searchFilter.trim()) return trackLessons;
    const q = searchFilter.toLowerCase();
    return trackLessons.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.track.toLowerCase().includes(q) ||
        (l.course && l.course.toLowerCase().includes(q))
    );
  }, [trackLessons, searchFilter]);

  // Active lesson state
  const [activeLesson, setActiveLesson] = useState<UnifiedLesson>(() => {
    if (initialLessonId) {
      const match = initialLessons.find((l) => l.id === initialLessonId);
      if (match) return match;
    }
    return filteredLessons[0] || initialLessons[0];
  });

  // Keep active lesson valid when changing track
  useEffect(() => {
    if (filteredLessons.length > 0) {
      const exists = filteredLessons.some((l) => l.id === activeLesson?.id);
      if (!exists) {
        setActiveLesson(filteredLessons[0]);
      }
    }
  }, [filteredLessons, activeLesson]);

  // Load progress from localStorage and Supabase
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cyber_lms_completed_unified_lessons');
      if (saved) {
        setCompletedLessons(new Set(JSON.parse(saved)));
      }
    } catch {
      // ignore
    }

    if (user && configured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        supabase
          .from('user_progress')
          .select('item_key')
          .eq('user_id', user.id)
          .eq('completed', true)
          .then(({ data }) => {
            if (data && data.length > 0) {
              setCompletedLessons((prev) => {
                const merged = new Set(prev);
                data.forEach((r) => merged.add(r.item_key));
                return merged;
              });
            }
          });
      }
    }
  }, [user, configured]);

  const toggleComplete = async (lessonId: string) => {
    const nextSet = new Set(completedLessons);
    const isNowCompleted = !nextSet.has(lessonId);

    if (isNowCompleted) {
      nextSet.add(lessonId);
    } else {
      nextSet.delete(lessonId);
    }

    setCompletedLessons(nextSet);
    localStorage.setItem(
      'cyber_lms_completed_unified_lessons',
      JSON.stringify(Array.from(nextSet))
    );

    if (user && configured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          await supabase.from('user_progress').upsert(
            {
              user_id: user.id,
              course_slug: activeLesson.trackId,
              item_key: lessonId,
              completed: isNowCompleted,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'user_id,item_key' }
          );
        } catch (err) {
          console.warn('Could not sync progress to Supabase:', err);
        }
      }
    }
  };

  // Prev / Next lesson navigation
  const currentIndex = filteredLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? filteredLessons[currentIndex - 1] : undefined;
  const nextLesson =
    currentIndex >= 0 && currentIndex < filteredLessons.length - 1
      ? filteredLessons[currentIndex + 1]
      : undefined;

  const currentTrackMeta = tracks.find((t) => t.id === selectedTrackId);
  const completionPercentage =
    filteredLessons.length > 0
      ? Math.round(
          (filteredLessons.filter((l) => completedLessons.has(l.id)).length /
            filteredLessons.length) *
            100
        )
      : 0;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[#090D16]">
      {/* =================================================================== */}
      {/* COLLAPSIBLE FLAT SIDEBAR (Zero Folder Trees) */}
      {/* =================================================================== */}
      <aside
        className={`border-r border-[#1F2937] bg-[#0B101E] flex flex-col shrink-0 transition-all duration-300 z-20 ${
          sidebarOpen ? 'w-80 md:w-96' : 'w-0'
        } overflow-hidden`}
      >
        {/* Top Control Bar */}
        <div className="p-4 border-b border-gray-800 bg-[#0E1524]">
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Catalog Home</span>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Track Dropdown Filter */}
          <div className="relative mb-3">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
              Select Curriculum Track
            </label>
            <div className="relative">
              <select
                value={selectedTrackId}
                onChange={(e) => setSelectedTrackId(e.target.value)}
                className="w-full bg-[#111827] text-white text-xs font-medium pl-3 pr-8 py-2 rounded-xl border border-gray-700 focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="all">⚡ All Tracks ({initialLessons.length} Lessons)</option>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.lessonCount})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Progress Tracker */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-1">
              <span>Completed</span>
              <span className="text-emerald-400 font-bold">{completionPercentage}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 mt-1">
              <span>
                {filteredLessons.filter((l) => completedLessons.has(l.id)).length} /{' '}
                {filteredLessons.length} Lessons
              </span>
              <span>{currentTrackMeta?.title || 'All Tracks'}</span>
            </div>
          </div>
        </div>

        {/* Real-Time Filter Search Input */}
        <div className="p-3 border-b border-gray-800/80 bg-[#090D16]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search lesson titles..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-[#111827] text-gray-200 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-gray-800 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-gray-600 font-mono"
            />
          </div>
        </div>

        {/* FLAT LIST OF LESSON TITLES (No folders or accordion containers) */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredLessons.length === 0 ? (
            <div className="text-center py-12 px-4 text-gray-500 text-xs">
              <Search className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <p>No lesson titles match &quot;{searchFilter}&quot;.</p>
            </div>
          ) : (
            filteredLessons.map((lesson) => {
              const isActive = activeLesson?.id === lesson.id;
              const isDone = completedLessons.has(lesson.id);

              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-emerald-500/15 border border-emerald-500/40 text-white font-semibold shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-[#111827] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {/* Material Type Indicators */}
                    <div className="flex items-center gap-1 shrink-0">
                      {lesson.videos.length > 0 && (
                        <span title="Video available">
                          <Film className="w-3 h-3 text-red-400" />
                        </span>
                      )}
                      {lesson.pdfs.length > 0 && (
                        <span title="PDF document available">
                          <FileText className="w-3 h-3 text-blue-400" />
                        </span>
                      )}
                      {lesson.notes.length > 0 && (
                        <span title="Notes available">
                          <FileCode className="w-3 h-3 text-emerald-400" />
                        </span>
                      )}
                      {lesson.labs.length > 0 && (
                        <span title="Lab archive available">
                          <FileArchive className="w-3 h-3 text-amber-400" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate leading-tight">{lesson.title}</p>
                      {selectedTrackId === 'all' && (
                        <span className="text-[9px] font-mono text-gray-500 truncate block">
                          {lesson.track}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Completion Status Checkbox */}
                  <div className="shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* =================================================================== */}
      {/* MAIN LESSON DETAIL CANVAS */}
      {/* =================================================================== */}
      <div className="flex-1 min-w-0 flex flex-col h-full bg-[#090D16]">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-[#1F2937] bg-[#0A0F1D] flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-gray-400 truncate">
              <span className="text-gray-500">CYBER ACADEMY</span>
              <span>/</span>
              <span className="text-emerald-400 truncate">{activeLesson?.track}</span>
              {activeLesson && (
                <>
                  <span>/</span>
                  <span className="text-gray-200 truncate">{activeLesson.title}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Report Broken Link Button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-400 bg-amber-950/20 border border-amber-800/40 hover:bg-amber-950/40 transition-colors"
              title="Report broken or inaccessible link"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Report Resource</span>
            </button>
          </div>
        </header>

        {/* Unified Lesson Viewer Canvas */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {activeLesson ? (
            <UnifiedLessonViewer
              lesson={activeLesson}
              isCompleted={completedLessons.has(activeLesson.id)}
              onToggleComplete={() => toggleComplete(activeLesson.id)}
              onPrevLesson={prevLesson ? () => setActiveLesson(prevLesson) : undefined}
              onNextLesson={nextLesson ? () => setActiveLesson(nextLesson) : undefined}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mb-3 text-gray-600" />
              <h3 className="text-base font-semibold text-gray-400">Select a lesson title to begin</h3>
            </div>
          )}
        </div>
      </div>

      {/* Report Broken Modal */}
      <ReportBrokenModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        courseSlug={activeLesson?.trackId || 'general'}
        itemTitle={activeLesson?.title || 'Resource'}
      />
    </div>
  );
}
