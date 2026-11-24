'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/lib/supabase/authContext';
import { parseResourceLink, ParsedLinkResult, YouTubePlaylistItem } from '@/lib/youtube';
import { CANONICAL_TRACKS, CANONICAL_COURSES, INITIAL_ATTACHED_LESSONS } from '@/config/seedData';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DbCourse, DbLesson, DbBrokenLinkReport } from '@/types';
import {
  Settings,
  PlusCircle,
  Link as LinkIcon,
  ListPlus,
  Table,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Search,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { Youtube } from '@/components/YoutubeIcon';

export default function AdminDashboardPage() {
  const { user, profile, isAdmin, setDemoRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'parser' | 'playlist' | 'courses' | 'reports'>('parser');

  // Smart Parser Form State
  const [pastedUrl, setPastedUrl] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedLinkResult | null>(null);
  const [targetCourseId, setTargetCourseId] = useState(CANONICAL_COURSES[0].id);
  const [moduleName, setModuleName] = useState('Core Modules');
  const [lessonTitle, setLessonTitle] = useState('');
  const [parserSuccess, setParserSuccess] = useState<string | null>(null);
  const [parserLoading, setParserLoading] = useState(false);

  // Bulk Playlist Importer State
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistCourseId, setPlaylistCourseId] = useState(CANONICAL_COURSES[1].id);
  const [playlistModule, setPlaylistModule] = useState('Video Lectures');
  const [previewVideos, setPreviewVideos] = useState<YouTubePlaylistItem[]>([]);
  const [isFetchingPlaylist, setIsFetchingPlaylist] = useState(false);
  const [isImportingPlaylist, setIsImportingPlaylist] = useState(false);
  const [playlistSuccess, setPlaylistSuccess] = useState<string | null>(null);

  // Courses & Lessons Management State
  const [coursesList, setCoursesList] = useState<DbCourse[]>(CANONICAL_COURSES);
  const [lessonsList, setLessonsList] = useState<DbLesson[]>(INITIAL_ATTACHED_LESSONS as unknown as DbLesson[]);

  // Broken Reports State
  const [reportsList, setReportsList] = useState<DbBrokenLinkReport[]>([]);

  const configured = isSupabaseConfigured();

  // Load live data from Supabase if configured
  useEffect(() => {
    if (configured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        supabase.from('courses').select('*, track:tracks(*)').order('sort_order').then(({ data }) => {
          if (data && data.length > 0) setCoursesList(data as DbCourse[]);
        });

        supabase.from('lessons').select('*').order('sort_order').then(({ data }) => {
          if (data && data.length > 0) setLessonsList(data as DbLesson[]);
        });

        supabase.from('broken_link_reports').select('*').order('created_at', { ascending: false }).then(({ data }) => {
          if (data && data.length > 0) setReportsList(data as DbBrokenLinkReport[]);
        });
      }
    } else {
      // Local demo reports
      try {
        const local = JSON.parse(localStorage.getItem('cyber_lms_broken_reports') || '[]');
        setTimeout(() => setReportsList(local), 0);
      } catch {
        // ignore
      }
    }
  }, [configured]);

  // Handle URL change in Smart Parser
  useEffect(() => {
    if (!pastedUrl.trim()) {
      setParsedResult(null);
      return;
    }
    const res = parseResourceLink(pastedUrl);
    setParsedResult(res);
  }, [pastedUrl]);

  // Handle Smart Parser Submit
  const handleParserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedResult || parsedResult.type === 'unknown') return;

    setParserLoading(true);
    setParserSuccess(null);

    const newLesson: Partial<DbLesson> = {
      course_id: targetCourseId,
      module_name: moduleName,
      title: lessonTitle.trim() || `Resource (${parsedResult.id})`,
      lesson_type: parsedResult.type.startsWith('youtube') ? 'youtube_video' : 'gdrive_file',
      youtube_video_id: parsedResult.type.startsWith('youtube') ? parsedResult.id : null,
      gdrive_file_id: parsedResult.type.startsWith('gdrive') ? parsedResult.id : null,
      sort_order: lessonsList.length + 1,
    };

    if (configured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error } = await supabase.from('lessons').insert(newLesson);
        if (error) {
          alert('Error inserting lesson: ' + error.message);
          setParserLoading(false);
          return;
        }
      }
    }

    setLessonsList((prev) => [
      ...prev,
      {
        id: 'lesson-' + Date.now(),
        created_at: new Date().toISOString(),
        ...newLesson,
      } as DbLesson,
    ]);

    setParserLoading(false);
    setParserSuccess(`Added "${newLesson.title}" to ${moduleName}!`);
    setPastedUrl('');
    setLessonTitle('');
    setTimeout(() => setParserSuccess(null), 3000);
  };

  // Handle Fetch Playlist
  const handleFetchPlaylist = async () => {
    if (!playlistUrl.trim()) return;
    setIsFetchingPlaylist(true);

    try {
      const res = await fetch('/api/youtube/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: playlistUrl }),
      });
      const data = await res.json();
      if (data.videos) {
        setPreviewVideos(data.videos);
      } else {
        alert(data.error || 'Failed to fetch playlist');
      }
    } catch (err: unknown) {
      alert('Network error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsFetchingPlaylist(false);
    }
  };

  // Handle Import Playlist
  const handleImportPlaylist = async () => {
    if (previewVideos.length === 0) return;
    setIsImportingPlaylist(true);

    try {
      const res = await fetch('/api/youtube/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: playlistUrl,
          courseId: playlistCourseId,
          moduleName: playlistModule,
          autoInsert: true,
        }),
      });
      const data = await res.json();
      setPlaylistSuccess(`Successfully imported ${data.totalVideos || previewVideos.length} videos!`);
      setPreviewVideos([]);
      setPlaylistUrl('');
      setTimeout(() => setPlaylistSuccess(null), 3000);
    } catch (err: unknown) {
      alert('Error importing playlist: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsImportingPlaylist(false);
    }
  };

  // Toggle course published
  const togglePublish = async (courseId: string, current: boolean) => {
    const updated = !current;
    setCoursesList((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, is_published: updated } : c))
    );

    if (configured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.from('courses').update({ is_published: updated }).eq('id', courseId);
      }
    }
  };

  // Resolve broken report
  const resolveReport = async (reportId: string) => {
    setReportsList((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r))
    );

    if (configured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.from('broken_link_reports').update({ status: 'resolved' }).eq('id', reportId);
      }
    } else {
      const local = reportsList.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r));
      localStorage.setItem('cyber_lms_broken_reports', JSON.stringify(local));
    }
  };

  // If user is not admin, show friendly permission guard with demo toggle
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-[#090D16] text-[#E5E7EB]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-2xl bg-[#0E1524] border border-[#1F2937] text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <Settings className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Privileges Required</h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              This dashboard is restricted to users with <code className="text-emerald-400 font-mono">role = &apos;admin&apos;</code> in Supabase.
            </p>
            <div className="p-3 bg-black/40 rounded-xl border border-gray-800 text-xs font-mono text-gray-300 text-left">
              <span className="text-gray-500 block text-[10px] uppercase">SQL Role Elevation</span>
              <code>UPDATE profiles SET role = &apos;admin&apos; WHERE email = &apos;your@email.com&apos;;</code>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setDemoRole('admin')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulate Admin Access (Demo Mode)</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-[#E5E7EB]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0E1524] border border-[#1F2937]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white">Tactical Admin Command Center</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 uppercase font-bold">
                  Admin
                </span>
              </div>
              <p className="text-xs font-mono text-gray-400">
                Direct Content CMS • Smart Link Ingestion • Playlist Importer
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-gray-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('parser')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'parser' ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Smart Parser
            </button>
            <button
              onClick={() => setActiveTab('playlist')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'playlist' ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Playlist Importer
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'courses' ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Courses ({coursesList.length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'reports' ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Reports ({reportsList.filter((r) => r.status === 'open').length})
            </button>
          </div>
        </div>

        {/* TAB 1: SMART LINK PARSER */}
        {activeTab === 'parser' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0E1524] border border-[#1F2937] space-y-5">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
                <LinkIcon className="w-4 h-4" />
                <span>Smart Link Parser & Ingestion</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Paste ANY standard Google Drive folder/file URL or YouTube video/playlist URL. The parser automatically extracts the ID without manual copying.
              </p>

              <form onSubmit={handleParserSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Paste Google Drive or YouTube URL
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://drive.google.com/drive/folders/... OR https://www.youtube.com/watch?v=..."
                    value={pastedUrl}
                    onChange={(e) => setPastedUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#090D16] border border-[#1F2937] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                {parsedResult && (
                  <div className="p-3 bg-black/40 rounded-xl border border-gray-800 text-xs font-mono flex items-center justify-between">
                    <div>
                      <span className="text-gray-500 text-[10px] block uppercase">Detected Resource</span>
                      <span className="text-emerald-400 font-bold">{parsedResult.type.toUpperCase()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 text-[10px] block uppercase">Extracted ID</span>
                      <span className="text-white">{parsedResult.id || 'N/A'}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Target Course</label>
                    <select
                      value={targetCourseId}
                      onChange={(e) => setTargetCourseId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090D16] border border-[#1F2937] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {coursesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Module Name</label>
                    <input
                      type="text"
                      value={moduleName}
                      onChange={(e) => setModuleName(e.target.value)}
                      placeholder="E.g., Module 01: Reconnaissance"
                      className="w-full px-3 py-2 bg-[#090D16] border border-[#1F2937] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Lesson Title</label>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="E.g., 01 - Network Reconnaissance & Port Scanning"
                    className="w-full px-3 py-2 bg-[#090D16] border border-[#1F2937] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {parserSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{parserSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={parserLoading || !parsedResult || parsedResult.type === 'unknown'}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all disabled:opacity-50"
                >
                  {parserLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Publish Lesson to LMS</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Reference Box */}
            <div className="p-6 rounded-2xl bg-[#0E1524] border border-[#1F2937] space-y-4">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-widest block">
                Supported Patterns
              </span>
              <div className="space-y-3 text-xs font-mono">
                <div className="p-2.5 bg-black/40 rounded-xl border border-gray-800">
                  <span className="text-red-400 font-bold block mb-1">YouTube Video:</span>
                  <code className="text-gray-400 text-[11px]">youtu.be/xxx or watch?v=xxx</code>
                </div>
                <div className="p-2.5 bg-black/40 rounded-xl border border-gray-800">
                  <span className="text-red-400 font-bold block mb-1">YouTube Playlist:</span>
                  <code className="text-gray-400 text-[11px]">playlist?list=PLxxx</code>
                </div>
                <div className="p-2.5 bg-black/40 rounded-xl border border-gray-800">
                  <span className="text-blue-400 font-bold block mb-1">Google Drive Folder:</span>
                  <code className="text-gray-400 text-[11px]">drive.google.com/drive/folders/xxx</code>
                </div>
                <div className="p-2.5 bg-black/40 rounded-xl border border-gray-800">
                  <span className="text-emerald-400 font-bold block mb-1">Google Drive File:</span>
                  <code className="text-gray-400 text-[11px]">drive.google.com/file/d/xxx/view</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BULK PLAYLIST IMPORTER */}
        {activeTab === 'playlist' && (
          <div className="p-6 rounded-2xl bg-[#0E1524] border border-[#1F2937] space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <ListPlus className="w-4 h-4" />
              <span>Bulk YouTube Playlist Importer</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Import an entire Unlisted or Public YouTube playlist into any course module in one click.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-gray-400 mb-1">YouTube Playlist URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/playlist?list=PLrAXtmErZgOdP_8GztsuKi9nrraNbJYp4"
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-[#090D16] border border-[#1F2937] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    onClick={handleFetchPlaylist}
                    disabled={isFetchingPlaylist || !playlistUrl.trim()}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-colors disabled:opacity-50 shrink-0"
                  >
                    {isFetchingPlaylist ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch Videos'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Target Course</label>
                <select
                  value={playlistCourseId}
                  onChange={(e) => setPlaylistCourseId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#090D16] border border-[#1F2937] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {coursesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {playlistSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{playlistSuccess}</span>
              </div>
            )}

            {/* Preview List */}
            {previewVideos.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-300">
                    Discovered <span className="text-amber-400 font-bold">{previewVideos.length}</span> lectures
                  </span>
                  <button
                    onClick={handleImportPlaylist}
                    disabled={isImportingPlaylist}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-colors disabled:opacity-50"
                  >
                    {isImportingPlaylist ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>Confirm Bulk Import</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                  {previewVideos.map((v, i) => (
                    <div
                      key={v.videoId + i}
                      className="p-3 bg-black/40 rounded-xl border border-gray-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-red-950 text-red-400 flex items-center justify-center font-mono text-[10px]">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-white line-clamp-1">{v.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 block truncate">
                        ID: {v.videoId}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MANAGE COURSES & LESSONS */}
        {activeTab === 'courses' && (
          <div className="p-6 rounded-2xl bg-[#0E1524] border border-[#1F2937] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
                <Table className="w-4 h-4" />
                <span>Course & Lesson Catalog Manager</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Folder / Playlist ID</th>
                    <th className="py-2.5 px-3">Step</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {coursesList.map((course) => (
                    <tr key={course.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">
                        <div className="truncate max-w-[240px]">{course.title}</div>
                        <span className="text-[10px] text-gray-500 font-normal">{course.slug}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px]">
                          {course.source_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-400 font-mono text-[11px] truncate max-w-[140px]">
                        {course.gdrive_folder_id || course.youtube_playlist_id || '—'}
                      </td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">
                        {course.recommended_step ? `Step ${course.recommended_step}` : '—'}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => togglePublish(course.id, course.is_published)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                            course.is_published
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                              : 'bg-gray-800 text-gray-500 border-gray-700'
                          }`}
                        >
                          {course.is_published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/course/${course.slug}`}
                          className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-white"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: BROKEN LINK REPORTS */}
        {activeTab === 'reports' && (
          <div className="p-6 rounded-2xl bg-[#0E1524] border border-[#1F2937] space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4" />
              <span>User Broken Link Reports ({reportsList.length})</span>
            </div>

            {reportsList.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-gray-500">
                ✅ Zero open reports! All Google Drive and YouTube links are operational.
              </div>
            ) : (
              <div className="space-y-3">
                {reportsList.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 bg-black/40 rounded-xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{report.item_title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400">
                          {report.course_slug}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            report.status === 'resolved'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <p className="text-gray-400 font-sans text-xs">{report.details}</p>
                    </div>

                    {report.status === 'open' && (
                      <button
                        onClick={() => resolveReport(report.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-semibold shrink-0 transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
