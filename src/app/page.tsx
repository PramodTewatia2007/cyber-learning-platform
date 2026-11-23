import React from 'react';
import Link from 'next/link';
import { TRACKS } from '@/config/sources';
import { getAllCatalogTrees, isDriveConfigured } from '@/lib/drive';
import { Navbar } from '@/components/Navbar';
import { ApiKeyBanner } from '@/components/ApiKeyBanner';
import { LearningPath } from '@/components/LearningPath';
import { CourseCard } from '@/components/CourseCard';
import {
  Shield,
  Terminal,
  Flame,
  Award,
  Crosshair,
  Lock,
  Radio,
  BookOpen,
  Film,
  FileArchive,
  Download,
  Key,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const isConfigured = isDriveConfigured();
  const catalogTrees = await getAllCatalogTrees();

  // Calculate platform totals
  let totalVideos = 0;
  let totalPdfs = 0;
  let totalLabs = 0;
  let totalDocs = 0;

  Object.values(catalogTrees).forEach((tree) => {
    if (tree.stats) {
      totalVideos += tree.stats.videos || 0;
      totalPdfs += tree.stats.pdfs || 0;
      totalLabs += tree.stats.labs || 0;
      totalDocs += tree.stats.docs || 0;
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-[#E5E7EB]">
      {/* Tactical Navbar */}
      <Navbar isDriveConfigured={isConfigured} />

      {/* Setup notification banner if API key is not yet configured */}
      <ApiKeyBanner isConfigured={isConfigured} />

      <main className="flex-1">
        {/* Tactical Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#1F2937]/80 bg-tactical-grid">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Tactical Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111827] border border-[#1F2937] text-xs font-mono mb-6 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-gray-300">SYSTEM STATUS: FULL OPERATIONAL SYNC</span>
              <span className="text-gray-600">•</span>
              <span className="text-emerald-400">ZERO OUTBOUND DRIVE LINKS</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
              OPERATIONAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">CYBERSECURITY</span> LEARNING PLATFORM
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Full-stack academy ingesting structured Google Drive courseware &amp; the Red Team Roadmap natively into our custom video player, in-app PDF reader, and lab asset proxy.
            </p>

            {/* Tactical Metrics Bar */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
              <div className="bg-[#111827]/80 backdrop-blur rounded-xl border border-gray-800 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-red-400 mb-0.5">
                  <Film className="w-4 h-4" />
                  <span className="text-lg md:text-xl font-bold font-mono">{totalVideos || 25}+</span>
                </div>
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Video Lectures</span>
              </div>

              <div className="bg-[#111827]/80 backdrop-blur rounded-xl border border-gray-800 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-0.5">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-lg md:text-xl font-bold font-mono">{totalPdfs || 42}+</span>
                </div>
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">PDFs &amp; Books</span>
              </div>

              <div className="bg-[#111827]/80 backdrop-blur rounded-xl border border-gray-800 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-0.5">
                  <FileArchive className="w-4 h-4" />
                  <span className="text-lg md:text-xl font-bold font-mono">{totalLabs || 16}+</span>
                </div>
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Virtual Labs</span>
              </div>

              <div className="bg-[#111827]/80 backdrop-blur rounded-xl border border-gray-800 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-cyan-400 mb-0.5">
                  <Terminal className="w-4 h-4" />
                  <span className="text-lg md:text-xl font-bold font-mono">6 Tracks</span>
                </div>
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Specializations</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
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

        {/* Course Catalog Grid organized across the 6 Tracks */}
        <section id="tracks" className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Modular Academy Structure</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              All 6 Specialization Tracks &amp; Courses
            </h2>
            <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
              Synced directly from authoritative Google Drive sources and GitHub roadmaps with live lesson tracking and zero external redirects.
            </p>
          </div>

          <div className="space-y-14">
            {TRACKS.map((track) => (
              <div key={track.id} className="space-y-5">
                {/* Track Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1F2937] gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      style={{ backgroundColor: `${track.accent}20`, borderColor: `${track.accent}50`, color: track.accent }}
                      className="w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-sm"
                    >
                      <Terminal className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>{track.title}</span>
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">{track.subtitle}</p>
                    </div>
                  </div>

                  <span
                    style={{ color: track.accent }}
                    className="text-xs font-mono font-semibold"
                  >
                    {track.courses.length} {track.courses.length === 1 ? 'Course' : 'Courses / Modules'}
                  </span>
                </div>

                {/* Course Grid for this Track */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {track.courses.map((course) => {
                    const tree = catalogTrees[course.slug];
                    return (
                      <CourseCard
                        key={course.slug}
                        course={course}
                        stats={tree?.stats}
                        totalFiles={tree?.totalFiles || 0}
                        trackAccent={track.accent}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tactical Security Architecture Features */}
        <section className="py-16 border-t border-[#1F2937]/80 bg-[#070B14]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-2">
                CRITICAL INGESTION ARCHITECTURE
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Engineered for Zero Data Leaks &amp; Native UX
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0E1524] p-6 rounded-2xl border border-gray-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
                  <Film className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Custom Stream Engine</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Video lectures are proxied through internal byte-range API endpoints (<code className="text-gray-300">/api/content/[fileId]</code>) with custom playback controls, zero Google Drive branding, and zero outbound redirect buttons.
                </p>
              </div>

              <div className="bg-[#0E1524] p-6 rounded-2xl border border-gray-800">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">In-App PDF &amp; Markdown Readers</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Read CEH study books, forensic cheat sheets, and foundation notes natively with zoom controls, reading progress bars, and syntax-highlighted code blocks with one-click copying.
                </p>
              </div>

              <div className="bg-[#0E1524] p-6 rounded-2xl border border-gray-800">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
                  <FileArchive className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Direct Lab Proxy Downloads</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Virtual machines (.ova), packet captures (.pcap), and vulnerability challenge files (.zip) download straight to the user&apos;s machine via internal site streaming with zero external popups.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Tactical Footer */}
      <footer className="border-t border-[#1F2937] bg-[#070B14] py-10 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-mono text-gray-400 font-semibold">
              CYBER ACADEMY LMS • STRICT NO-OUTBOUND-DRIVE POLICY
            </span>
          </div>

          <div className="flex items-center gap-4 text-gray-400 font-mono text-[11px]">
            <span>Next.js App Router</span>
            <span>•</span>
            <span>Google Drive API v3</span>
            <span>•</span>
            <span>React Markdown</span>
            <span>•</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
