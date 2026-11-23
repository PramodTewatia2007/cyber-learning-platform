'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { CourseTree, CourseModule, DriveFile, CourseSource, TrackConfig } from '@/types';
import { VideoViewer } from './viewers/VideoViewer';
import { PdfViewer } from './viewers/PdfViewer';
import { MarkdownViewer } from './viewers/MarkdownViewer';
import { LabViewer } from './viewers/LabViewer';
import { DocViewer } from './viewers/DocViewer';
import { LessonNotes } from './LessonNotes';
import {
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderOpen,
  Film,
  FileText,
  FileArchive,
  FileCode,
  CheckCircle2,
  Circle,
  Search,
  BookOpen,
  ArrowLeft,
  Menu,
  X,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

interface CourseWorkspaceProps {
  course: CourseSource;
  track?: TrackConfig;
  initialTree: CourseTree;
}

export function CourseWorkspace({ course, track, initialTree }: CourseWorkspaceProps) {
  const [tree, setTree] = useState<CourseTree>(initialTree);
  const [activeFile, setActiveFile] = useState<DriveFile | null>(null);
  const [activeModuleName, setActiveModuleName] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [searchFilter, setSearchFilter] = useState('');
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const accentColor = course.accentColor || track?.accent || '#10B981';

  // Flat list of all lessons in order for Next/Previous buttons
  const flattenedLessons = useMemo(() => {
    const list: { file: DriveFile; moduleName: string }[] = [];

    tree.rootFiles.forEach((file) => {
      list.push({ file, moduleName: 'Overview' });
    });

    const traverse = (mod: CourseModule) => {
      mod.files.forEach((file) => {
        list.push({ file, moduleName: mod.name });
      });
      if (mod.submodules) {
        mod.submodules.forEach(traverse);
      }
    };

    tree.modules.forEach(traverse);
    return list;
  }, [tree]);

  // Load completed lessons from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cyber_lms_completed_${course.slug}`);
      if (saved) {
        setCompletedLessons(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      console.warn('Could not read saved progress:', e);
    }
  }, [course.slug]);

  // Set default active file on load
  useEffect(() => {
    if (!activeFile && flattenedLessons.length > 0) {
      setActiveFile(flattenedLessons[0].file);
      setActiveModuleName(flattenedLessons[0].moduleName);
    }

    // Open first few modules by default
    const initialOpen: Record<string, boolean> = {};
    tree.modules.forEach((mod, idx) => {
      if (idx < 3) initialOpen[mod.id] = true;
    });
    setOpenModules(initialOpen);
  }, [flattenedLessons, tree.modules, activeFile]);

  const toggleModule = (modId: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const toggleComplete = (fileId: string) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      localStorage.setItem(`cyber_lms_completed_${course.slug}`, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const selectLesson = (file: DriveFile, modName: string) => {
    setActiveFile(file);
    setActiveModuleName(modName);
    // On mobile, collapse sidebar when selecting a lesson
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Find index of current lesson in flattened list
  const currentIndex = flattenedLessons.findIndex((item) => item.file.id === activeFile?.id);
  const prevLesson = currentIndex > 0 ? flattenedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < flattenedLessons.length - 1 ? flattenedLessons[currentIndex + 1] : null;

  const completionPercent = flattenedLessons.length > 0
    ? Math.round((completedLessons.size / flattenedLessons.length) * 100)
    : 0;

  // File type icon helper
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
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
              {track?.title || 'Track'}
            </span>
            {tree.isMock && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                Demo Catalog
              </span>
            )}
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
          {/* Root Overview Lessons */}
          {tree.rootFiles.length > 0 && (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 px-2 py-1 block">
                Overview & Orientation
              </span>
              <div className="space-y-1 mt-1">
                {tree.rootFiles
                  .filter((f) => !searchFilter || f.name.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((file) => {
                    const isActive = activeFile?.id === file.id;
                    const isDone = completedLessons.has(file.id);

                    return (
                      <button
                        key={file.id}
                        onClick={() => selectLesson(file, 'Overview')}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center justify-between group ${
                          isActive
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-white font-medium'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {getFileIcon(file.fileType)}
                          <span className="truncate">{file.name}</span>
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

          {/* Course Modules */}
          {tree.modules.map((mod) => {
            const isOpen = openModules[mod.id] ?? true;
            const filteredFiles = mod.files.filter(
              (f) => !searchFilter || f.name.toLowerCase().includes(searchFilter.toLowerCase())
            );

            return (
              <div key={mod.id} className="rounded-xl border border-gray-800/80 bg-[#070B14] overflow-hidden">
                {/* Module Header Button */}
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
                    {mod.files.length} items
                  </span>
                </button>

                {/* Module Files List */}
                {isOpen && (
                  <div className="p-1 space-y-0.5">
                    {filteredFiles.map((file) => {
                      const isActive = activeFile?.id === file.id;
                      const isDone = completedLessons.has(file.id);

                      return (
                        <button
                          key={file.id}
                          onClick={() => selectLesson(file, mod.name)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center justify-between group ${
                            isActive
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-white font-medium'
                              : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {getFileIcon(file.fileType)}
                            <span className="truncate">{file.name}</span>
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
        {/* Top Operational Navigation Bar */}
        <header className="h-14 border-b border-[#1F2937] bg-[#0A0F1D] flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Sidebar toggle button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-gray-400 truncate">
              <span className="text-gray-500">{track?.title || 'Track'}</span>
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

          {/* Previous / Next Lesson Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => prevLesson && selectLesson(prevLesson.file, prevLesson.moduleName)}
              disabled={!prevLesson}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                prevLesson
                  ? 'bg-gray-800/80 border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'border-gray-800/40 text-gray-600 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <button
              onClick={() => nextLesson && selectLesson(nextLesson.file, nextLesson.moduleName)}
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

        {/* Dynamic Viewer based on active file type */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {activeFile ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="flex-1 min-h-0 overflow-hidden">
                {activeFile.fileType === 'video' && (
                  <VideoViewer
                    file={activeFile}
                    courseTitle={course.title}
                    isCompleted={completedLessons.has(activeFile.id)}
                    onToggleComplete={() => toggleComplete(activeFile.id)}
                    accentColor={accentColor}
                  />
                )}
                {activeFile.fileType === 'pdf' && (
                  <PdfViewer
                    file={activeFile}
                    courseTitle={course.title}
                    isCompleted={completedLessons.has(activeFile.id)}
                    onToggleComplete={() => toggleComplete(activeFile.id)}
                    accentColor={accentColor}
                  />
                )}
                {activeFile.fileType === 'markdown' && (
                  <MarkdownViewer
                    file={activeFile}
                    courseTitle={course.title}
                    isCompleted={completedLessons.has(activeFile.id)}
                    onToggleComplete={() => toggleComplete(activeFile.id)}
                    accentColor={accentColor}
                  />
                )}
                {activeFile.fileType === 'lab' && (
                  <LabViewer
                    file={activeFile}
                    courseTitle={course.title}
                    isCompleted={completedLessons.has(activeFile.id)}
                    onToggleComplete={() => toggleComplete(activeFile.id)}
                    accentColor={accentColor}
                  />
                )}
                {['document', 'presentation', 'spreadsheet', 'unknown'].includes(activeFile.fileType) && (
                  <DocViewer
                    file={activeFile}
                    courseTitle={course.title}
                    isCompleted={completedLessons.has(activeFile.id)}
                    onToggleComplete={() => toggleComplete(activeFile.id)}
                    accentColor={accentColor}
                  />
                )}
              </div>

              {/* Study Notes Scratchpad */}
              <LessonNotes fileId={activeFile.id} lessonName={activeFile.name} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mb-3 text-gray-600" />
              <h3 className="text-base font-semibold text-gray-400">Select a lesson from the sidebar</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Browse through the course modules on the left to start streaming videos, reading PDFs, or downloading lab environments.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
