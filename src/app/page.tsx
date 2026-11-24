import React from 'react';
import Link from 'next/link';
import { getCatalog } from '@/lib/catalog';
import { isR2Configured } from '@/lib/r2';
import { Navbar } from '@/components/Navbar';
import { ApiKeyBanner } from '@/components/ApiKeyBanner';
import { LearningPath } from '@/components/LearningPath';
import { CourseCard } from '@/components/CourseCard';
import {
  Shield,
  Terminal,
  Flame,
  BookOpen,
  Film,
  FileArchive,
  Cloud,
  CheckCircle2,
  ArrowRight,
  HardDrive
} from 'lucide-react';
import { Youtube } from '@/components/YoutubeIcon';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const catalog = getCatalog();
  const isStorageConfigured = isR2Configured();

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-[#E5E7EB]">
      {/* Tactical Navbar */}
      <Navbar isStorageConfigured={isStorageConfigured} />

      {/* Storage Architecture Banner */}
      <ApiKeyBanner isConfigured={isStorageConfigured} />

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
              <span className="text-gray-300">100% SELF-OWNED CLOUD STORAGE</span>
              <span className="text-gray-600">•</span>
              <span className="text-emerald-400">ZERO RUNTIME DRIVE DEPENDENCIES</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
              SELF-OWNED <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">CYBERSECURITY</span> LEARNING PLATFORM
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Hybrid free-tier architecture serving all PDFs, ebooks, notes, and lab assets from your own <strong>Cloudflare R2</strong> bucket, paired with privacy-enhanced YouTube video lectures.
            </p>

            {/* Live Stats Bar */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
              <div className="bg-[#111827]/80 backdrop-blur rounded-xl border border-gray-800 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-red-400 mb-0.5">
                  <Film className="w-4 h-4" />
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
                <div className="flex items-center justify-center gap-1.5 text-blue-400 mb-0.5">
                  <HardDrive className="w-4 h-4" />
                  <span className="text-lg md:text-xl font-bold font-mono">{catalog.formattedTotalSize || '3.17 GB'}</span>
                </div>
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Total Library Size</span>
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
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              All 6 Specialization Tracks &amp; Courses
            </h2>
            <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
              100% self-owned cloud library. Serving documents from Cloudflare R2 and streaming video lectures natively with zero external drive links.
            </p>
          </div>

          <div className="space-y-14">
            {catalog.tracks.map((track) => (
              <div key={track.id} className="space-y-5">
                {/* Track Header */}
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

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {track.courses.map((course) => (
                    <CourseCard
                      key={course.slug}
                      course={course}
                      trackAccent={track.accent}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture Guarantee Matrix */}
        <section className="py-16 border-t border-[#1F2937]/80 bg-[#070B14]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-2">
                HYBRID FREE-TIER STORAGE ARCHITECTURE
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Zero Monthly Storage Costs • Zero Egress Fees
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0E1524] p-6 rounded-2xl border border-gray-800">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4">
                  <Cloud className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Cloudflare R2 Storage</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  10 GB free cloud storage with $0 egress bandwidth costs. Hosts all course PDFs, books, markdown notes, slides, and hands-on lab archives directly under your ownership.
                </p>
              </div>

              <div className="bg-[#0E1524] p-6 rounded-2xl border border-gray-800">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mb-4">
                  <Youtube className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Dual-Engine Video Player</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Plays both R2 video files and privacy-enhanced Unlisted YouTube videos inside the exact same native LMS course canvas, with auto-completion and auto-advance controls.
                </p>
              </div>

              <div className="bg-[#0E1524] p-6 rounded-2xl border border-gray-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
                  <Terminal className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Cloud-to-Cloud Migration</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Five production Node.js CLI scripts and a zero-bandwidth GitHub Action that streams content directly from Google Drive into R2 with smart deduplication and size audits.
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
              CYBER ACADEMY LMS • CLOUDFLARE R2 + YOUTUBE HYBRID ARCHITECTURE
            </span>
          </div>

          <div className="flex items-center gap-4 text-gray-400 font-mono text-[11px]">
            <span>Next.js App Router</span>
            <span>•</span>
            <span>AWS SDK v3 S3</span>
            <span>•</span>
            <span>Cloudflare R2</span>
            <span>•</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
