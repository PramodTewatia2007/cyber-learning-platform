'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Search,
  Key,
  Flame,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Settings,
  ChevronDown,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { SearchModal } from './SearchModal';
import { AuthModal } from './AuthModal';
import { useAuth } from '@/lib/supabase/authContext';

interface NavbarProps {
  isStorageConfigured?: boolean;
}

export function Navbar({ isStorageConfigured = false }: NavbarProps) {
  const pathname = usePathname();
  const { user, profile, isAdmin, signOut } = useAuth();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
                    LMS
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 tracking-wider">
                  DRIVE • YOUTUBE • SUPABASE
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-[#1F2937]">
              <Link
                href="/#learning-path"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname === '/' ? 'text-gray-300 hover:text-white hover:bg-[#111827]' : 'text-gray-400 hover:text-white'
                }`}
              >
                7-Step Path
              </Link>
              <Link
                href="/#tracks"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-[#111827] transition-colors"
              >
                Courses
              </Link>
              <Link
                href="/roadmap"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  pathname === '/roadmap'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-[#111827]'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-red-400" />
                <span>Roadmap</span>
              </Link>
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-[#111827]'
                }`}
              >
                Dashboard
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 ${
                    pathname === '/admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-amber-400 hover:bg-amber-500/10 border border-amber-500/20'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Admin CMS</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            {/* Quick Search Button */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] hover:bg-[#172033] border border-[#1F2937] text-gray-400 hover:text-gray-200 text-xs transition-all shadow-sm group"
            >
              <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-black/60 text-gray-400 rounded border border-gray-700">
                Ctrl K
              </kbd>
            </button>

            {/* Auth Indicator / Profile Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#111827] border border-[#1F2937] hover:border-gray-700 transition-colors text-xs text-white"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-[11px]">
                    {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold leading-tight truncate max-w-[100px]">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[9px] font-mono text-gray-400 uppercase">
                      {profile?.role || 'student'}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#0E1524] border border-[#1F2937] rounded-xl shadow-2xl py-1 z-40 animate-fade-in text-xs font-medium">
                    <div className="px-3 py-2 border-b border-gray-800">
                      <p className="text-white font-semibold truncate">{profile?.full_name || 'Operative'}</p>
                      <p className="text-[10px] font-mono text-gray-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-[#1A2337] hover:text-white transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>My Dashboard</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-amber-300 hover:bg-amber-950/20 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="border-t border-gray-800 my-1" />

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-950/20 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/10 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#111827] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 border-t border-[#1F2937] bg-[#090D16] space-y-1">
            <Link
              href="/#learning-path"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-gray-300 hover:bg-[#111827]"
            >
              7-Step Recommended Path
            </Link>
            <Link
              href="/#tracks"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-gray-300 hover:bg-[#111827]"
            >
              Course Tracks
            </Link>
            <Link
              href="/roadmap"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-[#111827]"
            >
              Red Team Roadmap
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-emerald-400 hover:bg-[#111827]"
            >
              My Dashboard
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-xs font-medium text-amber-400 hover:bg-amber-950/20"
              >
                Admin CMS
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Global Modals */}
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
