'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { CatalogCourse, CourseModule, LessonItem } from '@/types';
import { VideoPlayer } from './VideoPlayer';
import { PdfViewer } from './viewers/PdfViewer';
import { MarkdownViewer } from './viewers/MarkdownViewer';
import { LabViewer } from './viewers/LabViewer';
import { LessonNotes } from './LessonNotes';
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
  AlertCircle,
  Layers,
  Cloud
} from 'lucide-react';
import { Youtube } from './YoutubeIcon';

interface CourseWorkspaceProps {
  course: CatalogCourse;
}

export function CourseWorkspace({ course }: CourseWorkspaceProps) {
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);
  const [activeModuleName, setActiveModuleName] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [searchFilter, setSearchFilter] = useState('');
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [showUnmappedDrawer, setShowUnmappedDrawer] = useState(false);

  const accentColor = course.accentColor || course.trackAccent || '#10B981';

  // Flattened ordered lessons for Previous / Next buttons
  const flattenedLessons = useMemo(() => {
    const list: { lesson: LessonItem; moduleName: string }[] = [];

    course.rootLessons.forEach((lesson) => {
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

    course.modules.forEach(traverse);
    return list;
  }, [course]);

  // Load completed lessons from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cyber_lms_completed_${course.slug}`);
      if (saved) {
        setCompletedLessons(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      // ignore
    }
  }, [course.slug]);

  // Set initial active lesson and open modules
  useEffect(() => {
    if (!activeLesson && flattenedLessons.length > 0) {
      setActiveLesson(flattenedLessons[0].lesson);
      setActiveModuleName(flattenedLessons[0].moduleName);
    }

    const initialOpen: Record<string, boolean> = {};
    course.modules.forEach((mod, idx) => {
      if (idx < 3) initialOpen[mod.id] = true;
    });
    setOpenModules(initialOpen);
  }, [course, flattenedLessons, activeLesson]);

  const toggleModule = (modId: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const toggleComplete = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      localStorage.setItem(`cyber_lms_completed_${course.slug}`, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const selectLesson = (lesson: LessonItem, modName: string) => {
    setActiveLesson(lesson);
    setActiveModuleName(modName);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const currentIndex = flattenedLessons.findIndex((item) => item.lesson.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? flattenedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < flattenedLessons.length - 1 ? flattenedLessons[currentIndex + 1] : null;

  const completionPercent = flattenedLessons.length > 0
    ? Math.round((completedLessons.size / flattenedLessons.length) * 100)
    : 0;

  const getLessonIcon = (lesson: LessonItem) => {
    if (lesson.source === 'youtube') {
      return <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />;
    }
    switch (lesson.fileType) {
      case 'video':
        return <Film className="w-3.5 h-3.5 text-red-400 shrink-0" />;
      case 'pdf':
        return <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'lab':
      case 'archive':
        return <FileArchive className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'markdown':
        return <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090D16] text-white">
      {/* Collapsible Left Sidebar */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 bg-[#0A0F1D] border-r border-[#1F2937] flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-80 md:w-88 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#1F2937] bg-[#0E1524]">
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Catalog Home</span>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 text-gray-400 hover:text-white"
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
            {course.pendingVideoCount && course.pendingVideoCount > 0 ? (
              <button
                onClick={() => setShowUnmappedDrawer(true)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 hover:bg-amber-900/60 transition-colors"
              >
                {course.pendingVideoCount} Unmapped
              </button>
            ) : null}
          </div>

          <h2 className="text-sm font-bold text-gray-100 line-clamp-2 mt-1">
            {course.title}
          </h2>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-1">
              <span>Course Progress</span>
              <span className="font-bold text-emerald-400">{completionPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lesson Filter Search */}
        <div className="p-3 border-b border-[#1F2937]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search lessons in course..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-[#111827] text-gray-200 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-gray-800 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Module & Lesson Accordion Tree */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Root Lessons */}
          {course.rootLessons.length > 0 && (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 px-2 py-1 block">
                Overview & Orientation
              </span>
              <div className="space-y-1 mt-1">
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
                          isActive
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
          {course.modules.map((mod) => {
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
                            isActive
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

            <button
              onClick={() => nextLesson && selectLesson(nextLesson.lesson, nextLesson.moduleName)}
              disabled={!nextLesson}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                nextLesson
                  ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500'
                  : 'border-gray-800/40 text-gray-600 cursor-not-allowed'
              }`}
            >
              <span className="hidden sm:inline">Next Lesson</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Dynamic Viewer */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {activeLesson ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="flex-1 min-h-0 overflow-hidden">
                {activeLesson.fileType === 'video' ? (
                  <VideoPlayer
                    lesson={activeLesson}
                    courseTitle={course.title}
                    isCompleted={completedLessons.has(activeLesson.id)}
                    onToggleComplete={() => toggleComplete(activeLesson.id)}
                    onNextLesson={() => nextLesson && selectLesson(nextLesson.lesson, nextLesson.moduleName)}
                    accentColor={accentColor}
                  />
                ) : activeLesson.fileType === 'pdf' ? (
                  <PdfViewer
                    lesson={activeLesson}
                    courseTitle={course.title}
                    isCompleted={completedLessons.has(activeLesson.id)}
                    onToggleComplete={() => toggleComplete(activeLesson.id)}
                    accentColor={accentColor}
                  />
                ) : activeLesson.fileType === 'markdown' ? (
                  <MarkdownViewer
                    lesson={activeLesson}
                    courseTitle={course.title}
                    isCompleted={completedLessons.has(activeLesson.id)}
                    onToggleComplete={() => toggleComplete(activeLesson.id)}
                    accentColor={accentColor}
                  />
                ) : (
                  <LabViewer
                    lesson={activeLesson}
                    courseTitle={course.title}
                    isCompleted={completedLessons.has(activeLesson.id)}
                    onToggleComplete={() => toggleComplete(activeLesson.id)}
                    accentColor={accentColor}
                  />
                )}
              </div>

              {/* Personal Notes */}
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

      {/* Unmapped Videos Drawer (Dev Mode Tool) */}
      {showUnmappedDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0E1524] border border-[#1F2937] rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-bold">Unmapped Videos ({course.pendingVideoCount || 0})</h3>
              </div>
              <button onClick={() => setShowUnmappedDrawer(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              These video lectures were skipped during R2 migration. Add their Unlisted YouTube IDs to <code className="text-emerald-400">src/config/youtube-videos.json</code> or run:
            </p>
            <div className="mt-3 p-3 bg-black/60 rounded-lg border border-gray-800 font-mono text-xs text-gray-300">
              npm run import-yt-playlist -- --playlist=ID --course={course.slug}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowUnmappedDrawer(false)}
                className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
