import React from 'react';
import Link from 'next/link';
import { getCatalog } from '@/lib/catalog';
import { Navbar } from '@/components/Navbar';
import { ApiKeyBanner } from '@/components/ApiKeyBanner';
import { LearningPath } from '@/components/LearningPath';
import { CourseCard } from '@/components/CourseCard';
import { CatalogCourse, TrackConfig } from '@/types';
import {
  Shield,
  Terminal,
  Flame,
  BookOpen,
  Film,
  FileArchive,
  CheckCircle2,
  ArrowRight,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { Youtube } from '@/components/YoutubeIcon';

export default function HomePage() {
  const catalog = getCatalog();

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-[#E5E7EB]">
      {/* Tactical Navbar */}
      <Navbar />

      {/* Core 3-Layer Architecture Banner */}
      <ApiKeyBanner />

      <main className="flex-1">
        {/* Tactical Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#1F2937]/80 bg-tactical-grid">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111827] border border-[#1F2937] text-xs font-mono mb-6 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-gray-300">100% FREE-TIER READY</span>
              <span className="text-gray-600">•</span>
              <span className="text-emerald-400">GOOGLE DRIVE + YOUTUBE + SUPABASE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
              TACTICAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">CYBERSECURITY</span> LEARNING PLATFORM
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Curriculum covering offensive operations, ethical hacking, CEH v12, and SOC defense. Native in-app Google Drive document readers, cinema-mode YouTube lectures, and Supabase cloud sync.
            </p>

            {/* Live Stats Bar */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
              <div className="bg-[#111827]/80 backdrop-blur rounded-xl border border-gray-800 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-red-400 mb-0.5">
                  <Youtube className="w-4 h-4 text-red-500" />
                  <span className="text-lg md:text-xl font-bold font-mono">{catalog.totalVideos || 42}+</span>
                </div>
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Video Lectures</span>
              </div>

              <div className="bg-[#111827]/80 backdrop-blur rounded-xl border border-gray-800 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-0.5">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-lg md:text-xl font-bold font-mono">{catalog.totalPdfs || 56}+</span>
                </div>
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">PDFs &amp; Books</span>
              </div>

              <div className="bg-[#111827]/80 backdrop-blur rounded-xl border border-gray-800 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-0.5">
                  <FileArchive className="w-4 h-4" />
                  <span className="text-lg md:text-xl font-bold font-mono">{catalog.totalLabs || 18}+</span>
                </div>
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Lab Archives</span>
              </div>

              <div className="bg-[#111827]/80 backdrop-blur rounded-xl border border-gray-800 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-cyan-400 mb-0.5">
                  <Database className="w-4 h-4" />
                  <span className="text-lg md:text-xl font-bold font-mono">6 Tracks</span>
                </div>
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">12 Courses</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/course/cybersecurity-fundamentals"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <span>Start Learning (Track 1)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/roadmap"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#111827] hover:bg-gray-800 text-red-400 border border-red-500/30 hover:border-red-500/60 font-semibold text-xs sm:text-sm transition-all shadow-sm"
              >
                <Flame className="w-4 h-4" />
                <span>Open Red Team Roadmap</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 7-Step Recommended Learning Path */}
        <LearningPath />

        {/* Track & Course Catalog */}
        <section id="tracks" className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Full Specialization Tracks</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Curriculum &amp; Resource Catalog
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  12 courses spanning 6 dedicated cybersecurity domains. All files and video streams rendered natively.
                </p>
              </div>
            </div>
          </div>

          {/* Tracks and Course Grid */}
          <div className="space-y-16">
            {catalog.tracks.map((track: TrackConfig) => (
              <div key={track.id} className="space-y-6">
                {/* Track Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-[#1F2937]">
                  <div
                    style={{ backgroundColor: `${track.accent}15`, borderColor: `${track.accent}30` }}
                    className="w-10 h-10 rounded-xl border flex items-center justify-center text-lg"
                  >
                    <Shield style={{ color: track.accent }} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>{track.title}</span>
                      <span
                        style={{ color: track.accent }}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-gray-800 font-normal"
                      >
                        {track.courses.length} {track.courses.length === 1 ? 'Course' : 'Courses'}
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">{track.subtitle}</p>
                  </div>
                </div>

                {/* Courses in Track */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {track.courses.map((course: CatalogCourse) => (
                    <CourseCard key={course.slug} course={course} trackAccent={track.accent} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F2937] bg-[#070B14] py-12 text-xs font-mono text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>CYBER ACADEMY LMS • GOOGLE DRIVE + YOUTUBE + SUPABASE</span>
          </div>
          <div>
            <span>100% Free Tier Ready • Row Level Security • In-App Document &amp; Video Viewers</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
