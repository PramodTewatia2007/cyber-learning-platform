'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SearchResultItem } from '@/types';
import {
  Search,
  X,
  Film,
  BookOpen,
  FileArchive,
  FileCode,
  FileText,
  ChevronRight,
  Sparkles,
  Command,
  Loader2
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results || []);
          setSelectedIndex(0);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleSelect = (item: SearchResultItem) => {
    onClose();
    if (item.courseSlug === 'red-team-roadmap') {
      router.push('/roadmap');
    } else {
      router.push(`/course/${item.courseSlug}`);
    }
  };

  if (!isOpen) return null;

  const getFileIcon = (fileType?: string) => {
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0E1524] border border-[#1F2937] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#1F2937] bg-[#0A0F1D]">
          <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search across all 6 tracks (e.g., Nmap, SIEM, Metasploit, Cryptography)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm md:text-base text-gray-100 placeholder-gray-500 focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-emerald-400 mx-2 shrink-0" />}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-gray-800/40">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-xs text-gray-500">
              <Command className="w-8 h-8 mx-auto text-gray-600 mb-2" />
              <p>Type to search lessons, PDFs, videos, and labs across all tracks.</p>
              <div className="flex items-center justify-center gap-2 mt-4 text-[11px] font-mono text-gray-400">
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">Nmap</span>
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">Buffer Overflow</span>
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">SIEM</span>
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">CEH Exam</span>
              </div>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No cybersecurity assets found matching &quot;{query}&quot;. Try a different keyword.
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                    isSelected ? 'bg-[#152033] border border-gray-700' : 'hover:bg-[#111827]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-800/80 border border-gray-700 flex items-center justify-center shrink-0">
                      {getFileIcon(item.fileType)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          style={{ color: item.accent }}
                          className="text-[10px] font-mono uppercase font-bold"
                        >
                          {item.trackTitle}
                        </span>
                        {item.moduleName && (
                          <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
                            • {item.moduleName}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-gray-200 truncate mt-0.5">
                        {item.title}
                      </h4>
                      {item.snippet && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {item.snippet}
                        </p>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                </div>
              );
            })
          )}
        </div>

        {/* Search Modal Footer */}
        <div className="px-4 py-2.5 bg-[#0A0F1D] border-t border-[#1F2937] flex items-center justify-between text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700">↵</kbd> Open Lesson</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700">esc</kbd> Dismiss</span>
          </div>
          <span>{results.length} matches</span>
        </div>
      </div>
    </div>
  );
}
