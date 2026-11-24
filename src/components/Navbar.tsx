'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Search,
  Key,
  Flame,
  Cloud,
  Menu,
  X
} from 'lucide-react';
import { ApiKeyModal } from './ApiKeyModal';
import { SearchModal } from './SearchModal';

interface NavbarProps {
  isStorageConfigured?: boolean;
}

export function Navbar({ isStorageConfigured = false }: NavbarProps) {
  const pathname = usePathname();
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[#090D16]/95 backdrop-blur-md border-b border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Tactical Badge */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-black font-black shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    CYBER ACADEMY
                  </span>
                  <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    SELF-OWNED
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 tracking-wider">
                  CLOUDFLARE R2 + YOUTUBE HYBRID LMS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-[#1F2937]">
              <Link
                href="/#learning-path"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-[#111827] transition-colors"
              >
                7-Step Path
              </Link>
              <Link
                href="/#tracks"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-[#111827] transition-colors"
              >
                Course Tracks
              </Link>
              <Link
                href="/roadmap"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname === '/roadmap'
                    ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                    : 'text-gray-300 hover:text-red-400 hover:bg-[#111827]'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-red-400" />
                <span>Red Team Roadmap</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Search Trigger Button */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#1F2937] hover:border-gray-600 text-xs text-gray-400 hover:text-gray-200 transition-all shadow-sm"
              title="Search curriculum (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Search library...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">
                Ctrl K
              </kbd>
            </button>

            {/* Storage Status Pill */}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                isStorageConfigured
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-950/60'
                  : 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-950/60'
              }`}
              title="Cloudflare R2 & Pipeline Status"
            >
              <Cloud className={`w-3.5 h-3.5 ${isStorageConfigured ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="hidden lg:inline">
                {isStorageConfigured ? 'Cloudflare R2 Active' : 'Setup R2 Storage'}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#1F2937] bg-[#0E1524] px-4 py-3 space-y-2">
            <Link
              href="/#learning-path"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800"
            >
              7-Step Learning Path
            </Link>
            <Link
              href="/#tracks"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800"
            >
              Course Catalog
            </Link>
            <Link
              href="/roadmap"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-gray-800"
            >
              <Flame className="w-4 h-4 text-red-400" />
              <span>Red Team Roadmap</span>
            </Link>
          </div>
        )}
      </header>

      {/* Global Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        isConfigured={isStorageConfigured}
      />
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
}
