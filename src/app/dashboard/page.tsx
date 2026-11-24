'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/lib/supabase/authContext';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { CANONICAL_COURSES } from '@/config/seedData';
import {
  CheckCircle2,
  BookOpen,
  Bookmark,
  Edit3,
  Flame,
  ArrowRight,
  Shield,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';

interface SavedNoteItem {
  itemKey: string;
  courseSlug?: string;
  content: string;
  isBookmarked: boolean;
  updatedAt?: string;
}

export default function DashboardPage() {
  const { user, profile, isConfigured } = useAuth();
  const [completedCount, setCompletedCount] = useState(0);
  const [completedMap, setCompletedMap] = useState<Record<string, number>>({});
  const [savedNotes, setSavedNotes] = useState<SavedNoteItem[]>([]);
  const [savedBookmarks, setSavedBookmarks] = useState<string[]>([]);
  const [recentCourses, setRecentCourses] = useState<typeof CANONICAL_COURSES>([]);

  useEffect(() => {
    // 1. Load progress from localStorage and Supabase
    let totalDone = 0;
    const perCourse: Record<string, number> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cyber_lms_completed_')) {
        const slug = key.replace('cyber_lms_completed_', '');
        try {
          const list: string[] = JSON.parse(localStorage.getItem(key) || '[]');
          perCourse[slug] = list.length;
          totalDone += list.length;
        } catch {
          // ignore
        }
      }
    }

    setCompletedCount(totalDone);
    setCompletedMap(perCourse);
    setRecentCourses(CANONICAL_COURSES.slice(0, 4));

    // 2. Load bookmarks & notes from localStorage
    const localNotesList: SavedNoteItem[] = [];
    const localBookmarksList: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cyber_lms_notes_')) {
        const itemKey = key.replace('cyber_lms_notes_', '');
        const content = localStorage.getItem(key) || '';
        const isB = localStorage.getItem(`cyber_lms_bookmark_${itemKey}`) === 'true';
        if (content.trim() || isB) {
          localNotesList.push({
            itemKey,
            content,
            isBookmarked: isB,
          });
        }
      } else if (key && key.startsWith('cyber_lms_bookmark_')) {
        const itemKey = key.replace('cyber_lms_bookmark_', '');
        if (localStorage.getItem(key) === 'true') {
          localBookmarksList.push(itemKey);
        }
      }
    }

    setSavedNotes(localNotesList);
    setSavedBookmarks(localBookmarksList);

    // 3. If signed into Supabase, query cloud data
    if (user && isConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        // user_progress
        supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('completed', true)
          .then(({ data }) => {
            if (data && data.length > 0) {
              setCompletedCount(data.length);
            }
          });

        // lesson_notes
        supabase
          .from('lesson_notes')
          .select('*')
          .eq('user_id', user.id)
          .then(({ data }) => {
            if (data && data.length > 0) {
              const cloudNotes: SavedNoteItem[] = data.map((n) => ({
                itemKey: n.item_key,
                content: n.content,
                isBookmarked: n.is_bookmarked,
                updatedAt: n.updated_at,
              }));
              setSavedNotes(cloudNotes);
              setSavedBookmarks(data.filter((n) => n.is_bookmarked).map((n) => n.item_key));
            }
          });
      }
    }
  }, [user, isConfigured]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-[#E5E7EB]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Profile Banner */}
        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-[#0E1524] to-[#121B2F] border border-[#1F2937] relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-black font-black text-2xl shadow-xl shadow-emerald-500/20">
                {profile?.full_name ? profile.full_name[0].toUpperCase() : 'O'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl md:text-2xl font-extrabold text-white">
                    {profile?.full_name || user?.email?.split('@')[0] || 'Operative Workspace'}
                  </h1>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">
                    {profile?.role || 'Guest Student'}
                  </span>
                </div>
                <p className="text-xs font-mono text-gray-400">
                  {user?.email || 'Guest Mode • Progress saved in local storage'}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 font-mono">
              <div className="p-3 bg-black/40 rounded-xl border border-gray-800 text-center">
                <span className="text-[10px] uppercase text-gray-500 block">Lessons Done</span>
                <span className="text-lg font-bold text-emerald-400">{completedCount}</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-gray-800 text-center">
                <span className="text-[10px] uppercase text-gray-500 block">Bookmarks</span>
                <span className="text-lg font-bold text-amber-400">{savedBookmarks.length}</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-gray-800 text-center">
                <span className="text-[10px] uppercase text-gray-500 block">Notes Saved</span>
                <span className="text-lg font-bold text-cyan-400">{savedNotes.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest">
              <BookOpen className="w-4 h-4" />
              <span>Continue Learning</span>
            </div>
            <Link
              href="/#tracks"
              className="text-xs font-mono text-gray-400 hover:text-emerald-400 transition-colors"
            >
              Browse All Courses →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentCourses.map((course) => {
              const done = completedMap[course.slug] || 0;
              return (
                <div
                  key={course.id}
                  className="p-5 rounded-xl bg-[#0E1524] border border-[#1F2937] hover:border-emerald-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                      <span className="text-emerald-400">Step {course.recommended_step || 'Core'}</span>
                      <span className="text-gray-500">{course.source_type.toUpperCase()}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-gray-500">
                      {done} finished
                    </span>
                    <Link
                      href={`/course/${course.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <span>Resume</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Study Notes & Bookmarks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Saved Bookmarks */}
          <section className="p-6 rounded-2xl bg-[#0E1524] border border-[#1F2937] space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Bookmark className="w-4 h-4" />
              <span>Saved Bookmarks ({savedBookmarks.length})</span>
            </div>

            {savedBookmarks.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-gray-500">
                No bookmarked lessons yet. Click "Bookmark" inside any lesson to pin it here.
              </div>
            ) : (
              <div className="space-y-2">
                {savedBookmarks.map((key) => (
                  <div
                    key={key}
                    className="p-3 bg-black/40 rounded-xl border border-gray-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-gray-200 truncate">{key}</span>
                    </div>
                    <span className="text-[10px] text-amber-400 shrink-0">Bookmarked</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Personal Study Notes */}
          <section className="p-6 rounded-2xl bg-[#0E1524] border border-[#1F2937] space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <Edit3 className="w-4 h-4" />
              <span>Personal Study Notes ({savedNotes.filter((n) => n.content.trim()).length})</span>
            </div>

            {savedNotes.filter((n) => n.content.trim()).length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-gray-500">
                No study notes recorded yet. Write command syntax or takeaways in the lesson notes drawer.
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {savedNotes
                  .filter((n) => n.content.trim())
                  .map((note) => (
                    <div
                      key={note.itemKey}
                      className="p-3.5 bg-black/40 rounded-xl border border-gray-800 space-y-2 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between text-gray-400 text-[10px]">
                        <span className="text-emerald-400 font-bold truncate max-w-[200px]">
                          {note.itemKey}
                        </span>
                        {note.updatedAt && (
                          <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                      <p className="text-gray-200 whitespace-pre-wrap line-clamp-3 font-sans leading-relaxed text-xs">
                        {note.content}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
