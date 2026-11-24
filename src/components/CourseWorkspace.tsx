'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { CatalogCourse, CourseModule, LessonItem } from '@/types';
import { VideoPlayer } from './VideoPlayer';
import { DrivePreviewViewer } from './viewers/DrivePreviewViewer';
import { DriveFolderEmbedViewer } from './viewers/DriveFolderEmbedViewer';
import { MarkdownViewer } from './viewers/MarkdownViewer';
import { LabViewer } from './viewers/LabViewer';
import { LessonNotes } from './LessonNotes';
import { ReportBrokenModal } from './ReportBrokenModal';
import {
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderOpen,
  Film,
  BookOpen,
  FileArchive,
  FileCode,
  FileText,
  CheckCircle2,
  Circle,
  Search,
  ArrowLeft,
  Menu,
  X,
  AlertTriangle,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Youtube } from './YoutubeIcon';
import { useAuth } from '@/lib/supabase/authContext';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface CourseWorkspaceProps {
  course: CatalogCourse;
}

export function CourseWorkspace({ course }: CourseWorkspaceProps) {
  const { user } = useAuth();
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);
  const [activeModuleName, setActiveModuleName] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [searchFilter, setSearchFilter] = useState('');
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [showReportModal, setShowReportModal] = useState(false);
  const [dynamicModules, setDynamicModules] = useState<CourseModule[]>(course.modules || []);
  const isPureDriveCourse = course.sourceType === 'gdrive_folder' || (!course.modules || course.modules.length === 0);
  const [isViewingDrive, setIsViewingDrive] = useState<boolean>(isPureDriveCourse);
  const [isDriveFolderFallback, setIsDriveFolderFallback] = useState<boolean>(isPureDriveCourse);

  const accentColor = course.accentColor || course.trackAccent || '#10B981';
  const configured = isSupabaseConfigured();

  // If initial course has no modules but has a gdriveFolderId, fetch from /api/drive/[folderId]
  useEffect(() => {
    if ((!course.modules || course.modules.length === 0) && course.gdriveFolderId) {
      fetch(`/api/drive/${course.gdriveFolderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.modules && data.modules.length > 0) {
            setDynamicModules(data.modules);
            setIsDriveFolderFallback(false);
          } else {
            setIsDriveFolderFallback(true);
          }
        })
        .catch(() => {
          setIsDriveFolderFallback(true);
        });
    } else {
      setDynamicModules(course.modules || []);
      setIsDriveFolderFallback(false);
    }
  }, [course]);

  // Flattened ordered lessons for Previous / Next buttons
  const flattenedLessons = useMemo(() => {
    const list: { lesson: LessonItem; moduleName: string }[] = [];

    (course.rootLessons || []).forEach((lesson) => {
      list.push({ lesson, moduleName: 'Overview' });
    });

    const traverse = (mod: CourseModule) => {
      mod.lessons.forEach((lesson) => {
        list.push({ lesson, moduleName: mod.name });
      });
      if (mod.submodules) {
        mod.submodules.forEach(traverse);
      }
    };

    dynamicModules.forEach(traverse);
    return list;
  }, [course.rootLessons, dynamicModules]);

  // Load completed lessons from localStorage and Supabase
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cyber_lms_completed_${course.slug}`);
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
          .eq('course_slug', course.slug)
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
  }, [course.slug, user, configured]);

  // Set initial active lesson and open modules
  useEffect(() => {
    if (!activeLesson && flattenedLessons.length > 0 && !isPureDriveCourse) {
      setActiveLesson(flattenedLessons[0].lesson);
      setActiveModuleName(flattenedLessons[0].moduleName);
    }

    const initialOpen: Record<string, boolean> = {};
    dynamicModules.forEach((mod, idx) => {
      if (idx < 3) initialOpen[mod.id] = true;
    });
    setOpenModules(initialOpen);
  }, [dynamicModules, flattenedLessons, isPureDriveCourse]);

  const toggleModule = (modId: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const selectLesson = (lesson: LessonItem, moduleName: string) => {
    setIsViewingDrive(false);
    setActiveLesson(lesson);
    setActiveModuleName(moduleName);
  };

  const toggleComplete = async (lessonId: string) => {
    const nextSet = new Set(completedLessons);
    const isNowCompleted = !nextSet.has(lessonId);

    if (isNowCompleted) {
      nextSet.add(lessonId);
    } else {
      nextSet.delete(lessonId);
    }

    setCompletedLessons(nextSet);
    localStorage.setItem(`cyber_lms_completed_${course.slug}`, JSON.stringify(Array.from(nextSet)));

    // Sync to Supabase if authenticated
    if (user && configured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          await supabase.from('user_progress').upsert({
            user_id: user.id,
            course_slug: course.slug,
            item_key: lessonId,
            completed: isNowCompleted,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,item_key' });
        } catch (err) {
          console.warn('Could not sync progress to Supabase:', err);
        }
      }
    }
  };

  // Find index of active lesson for Prev/Next
  const currentIndex = flattenedLessons.findIndex((l) => l.lesson.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? flattenedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < flattenedLessons.length - 1 ? flattenedLessons[currentIndex + 1] : null;

  // Icon for lesson
  const getLessonIcon = (lesson: LessonItem) => {
    if (lesson.source === 'youtube' || lesson.fileType === 'video') {
      return <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />;
    }
    if (lesson.fileType === 'pdf') {
      return <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    }
    if (lesson.fileType === 'lab') {
      return <FileArchive className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
    if (lesson.fileType === 'markdown') {
      return <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    }
    return <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[#090D16]">
      {/* Collapsible Left Sidebar */}
      <aside
        className={`border-r border-[#1F2937] bg-[#0B101E] flex flex-col shrink-0 transition-all duration-300 z-20 ${
          sidebarOpen ? 'w-80 md:w-96' : 'w-0'
        } overflow-hidden`}
      >
        {/* Course Info & Back Link */}
        <div className="p-4 border-b border-gray-800 bg-[#0E1524]">
          <div className="flex items-center justify-between mb-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span
              style={{ backgroundColor: `${accentColor}20`, color: accentColor, borderColor: `${accentColor}40` }}
              className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border"
            >
              {course.trackTitle}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">
              {(course.sourceType || 'gdrive_folder').toUpperCase()}
            </span>
          </div>

          <h2 className="text-sm font-bold text-gray-100 line-clamp-2 mt-1">
            {course.title}
          </h2>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-1">
              <span>Course Progress</span>
              <span className="text-emerald-400">
                {flattenedLessons.length > 0
                  ? Math.round((completedLessons.size / flattenedLessons.length) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${
                    flattenedLessons.length > 0
                      ? (completedLessons.size / flattenedLessons.length) * 100
                      : 0
                  }%`,
                  backgroundColor: accentColor,
                }}
                className="h-full rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Search within course */}
        <div className="p-2 border-b border-gray-800/80 bg-[#090D16]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Filter lessons & files..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-[#111827] text-gray-200 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-gray-800 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-gray-600 font-mono"
            />
          </div>
        </div>

        {/* Lessons Tree */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {/* Quick Access: Google Drive Folder */}
          {course.gdriveFolderId && (
            <div className="rounded-xl border border-gray-800/80 bg-[#070B14] overflow-hidden p-1">
              <button
                onClick={() => {
                  setIsViewingDrive(true);
                  setActiveModuleName('Google Drive Materials');
                }}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center justify-between group ${
                  isViewingDrive
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200 font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Google Drive Files & Labs</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                  isViewingDrive
                    ? 'bg-amber-500/30 text-amber-300 border-amber-500/50'
                    : 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                }`}>
                  Drive
                </span>
              </button>
            </div>
          )}

          {/* If pure folder embed mode */}
          {isViewingDrive && dynamicModules.length === 0 && (
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 text-xs text-amber-200">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Zero-Config Folder Active</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                All files are interactively browsable in the main canvas via Google Drive embed.
              </p>
            </div>
          )}

          {/* Root lessons */}
          {(course.rootLessons || []).length > 0 && (
            <div className="rounded-xl border border-gray-800/80 bg-[#070B14] overflow-hidden">
              <div className="px-3 py-2 bg-[#0E1524]/60 border-b border-gray-800/60 text-xs font-semibold text-gray-300">
                Course Overview
              </div>
              <div className="p-1 space-y-0.5">
                {course.rootLessons
                  .filter((l) => !searchFilter || l.title.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((lesson) => {
                    const isActive = activeLesson?.id === lesson.id;
                    const isDone = completedLessons.has(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson, 'Overview')}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center justify-between group ${
                          isActive && !isViewingDrive
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-white font-medium'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {getLessonIcon(lesson)}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <div className="shrink-0 ml-2">
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Modules */}
          {dynamicModules.map((mod) => {
            const isOpen = openModules[mod.id] ?? true;
            const filteredLessons = mod.lessons.filter(
              (l) => !searchFilter || l.title.toLowerCase().includes(searchFilter.toLowerCase())
            );

            return (
              <div key={mod.id} className="rounded-xl border border-gray-800/80 bg-[#070B14] overflow-hidden">
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full px-3 py-2.5 flex items-center justify-between text-left text-xs font-medium text-gray-300 hover:text-white bg-[#0E1524]/60 hover:bg-[#0E1524] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isOpen ? (
                      <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Folder className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                    <span className="truncate font-semibold text-gray-200">{mod.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 shrink-0 ml-2">
                    {mod.lessons.length}
                  </span>
                </button>

                {isOpen && (
                  <div className="p-1 space-y-0.5">
                    {filteredLessons.map((lesson) => {
                      const isActive = activeLesson?.id === lesson.id;
                      const isDone = completedLessons.has(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => selectLesson(lesson, mod.name)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center justify-between group ${
                            isActive && !isViewingDrive
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-white font-medium'
                              : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {getLessonIcon(lesson)}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          <div className="shrink-0 ml-2">
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-full bg-[#090D16]">
        {/* Top Header */}
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
              <span className="text-gray-500">{course.trackTitle}</span>
              <span>/</span>
              <span className="text-gray-300 truncate">{course.title}</span>
              {activeModuleName && (
                <>
                  <span>/</span>
                  <span className="text-emerald-400 truncate">{activeModuleName}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Report Broken Link Button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-400 bg-amber-950/20 border border-amber-800/40 hover:bg-amber-950/40 transition-colors"
              title="Report broken or inaccessible link"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Report Resource</span>
            </button>

            {/* Prev Lesson */}
            <button
              onClick={() => prevLesson && selectLesson(prevLesson.lesson, prevLesson.moduleName)}
              disabled={!prevLesson}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                prevLesson
                  ? 'bg-gray-800/80 border-gray-700 text-gray-300 hover:text-white'
                  : 'border-gray-800/40 text-gray-600 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Next Lesson */}
            <button
              onClick={() => nextLesson && selectLesson(nextLesson.lesson, nextLesson.moduleName)}
              disabled={!nextLesson}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                nextLesson
                  ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500'
                  : 'border-gray-800/40 text-gray-600 cursor-not-allowed'
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Viewer Canvas */}
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
          {(isViewingDrive || !activeLesson) && course.gdriveFolderId ? (
            /* Google Drive Folder View */
            <div className="flex-1 flex flex-col">
              <DriveFolderEmbedViewer
                folderId={course.gdriveFolderId}
                courseTitle={course.title}
                accentColor={accentColor}
              />
              <LessonNotes fileId={`folder-${course.gdriveFolderId}`} lessonName={course.title} />
            </div>
          ) : activeLesson ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 min-h-[500px]">
                {/* 1. YouTube Video Engine */}
                {activeLesson.source === 'youtube' || (activeLesson.youtubeId && !activeLesson.gdriveFileId) ? (
                  <VideoPlayer
                    key={activeLesson.id || activeLesson.youtubeId}
                    lesson={activeLesson}
                    courseTitle={course.title}
                    isCompleted={completedLessons.has(activeLesson.id)}
                    onToggleComplete={() => toggleComplete(activeLesson.id)}
                    onNextLesson={() => nextLesson && selectLesson(nextLesson.lesson, nextLesson.moduleName)}
                    accentColor={accentColor}
                  />
                ) : activeLesson.fileType === 'lab' ? (
                  /* 2. Lab Archive Engine */
                  <LabViewer
                    key={activeLesson.id}
                    lesson={activeLesson}
                    courseTitle={course.title}
                    isCompleted={completedLessons.has(activeLesson.id)}
                    onToggleComplete={() => toggleComplete(activeLesson.id)}
                    accentColor={accentColor}
                  />
                ) : activeLesson.fileType === 'markdown' ? (
                  /* 3. Markdown / Notes Engine */
                  <MarkdownViewer
                    key={activeLesson.id}
                    lesson={activeLesson}
                    courseTitle={course.title}
                    isCompleted={completedLessons.has(activeLesson.id)}
                    onToggleComplete={() => toggleComplete(activeLesson.id)}
                    accentColor={accentColor}
                  />
                ) : (
                  /* 4. Native Google Drive In-App Preview (PDF, Slides, Docs, Images, Videos) */
                  <DrivePreviewViewer key={activeLesson.id} lesson={activeLesson} />
                )}
              </div>

              {/* Personal Notes Drawer */}
              <LessonNotes fileId={activeLesson.id} lessonName={activeLesson.title} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mb-3 text-gray-600" />
              <h3 className="text-base font-semibold text-gray-400">Select a lesson to begin</h3>
            </div>
          )}
        </div>
      </div>

      {/* Report Broken Link Modal */}
      <ReportBrokenModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        courseSlug={course.slug}
        itemTitle={activeLesson ? activeLesson.title : course.title}
      />
    </div>
  );
}
