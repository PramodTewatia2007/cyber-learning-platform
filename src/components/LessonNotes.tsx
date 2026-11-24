'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, Save, Check, Trash2, Bookmark, BookmarkCheck, Cloud, HardDrive, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/supabase/authContext';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface LessonNotesProps {
  fileId: string;
  lessonName: string;
}

export function LessonNotes({ fileId, lessonName }: LessonNotesProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<string>('');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const storageKey = `cyber_lms_notes_${fileId}`;
  const bookmarkStorageKey = `cyber_lms_bookmark_${fileId}`;
  const configured = isSupabaseConfigured();

  // Load notes and bookmark status
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // 1. Try local storage first
      const localNotes = localStorage.getItem(storageKey) || '';
      const localBookmark = localStorage.getItem(bookmarkStorageKey) === 'true';

      if (isMounted) {
        setNotes(localNotes);
        setIsBookmarked(localBookmark);
      }

      // 2. If user is signed in to Supabase, fetch cloud notes
      if (user && configured) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          try {
            const { data } = await supabase
              .from('lesson_notes')
              .select('*')
              .eq('user_id', user.id)
              .eq('item_key', fileId)
              .maybeSingle();

            if (data && isMounted) {
              setNotes(data.content || localNotes);
              setIsBookmarked(Boolean(data.is_bookmarked));
            }
          } catch {
            // fallback
          }
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [fileId, user, configured, storageKey, bookmarkStorageKey]);

  // Save notes
  const handleSave = async () => {
    setIsLoading(true);
    // Always persist to localStorage
    localStorage.setItem(storageKey, notes);

    // If logged in, save to Supabase
    if (user && configured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          await supabase.from('lesson_notes').upsert({
            user_id: user.id,
            item_key: fileId,
            content: notes,
            is_bookmarked: isBookmarked,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,item_key' });
        } catch (err) {
          console.warn('Could not sync note to Supabase:', err);
        }
      }
    }

    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Toggle bookmark
  const toggleBookmark = async () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    localStorage.setItem(bookmarkStorageKey, String(nextState));

    if (user && configured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          await supabase.from('lesson_notes').upsert({
            user_id: user.id,
            item_key: fileId,
            content: notes,
            is_bookmarked: nextState,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,item_key' });
        } catch {
          // fallback
        }
      }
    }
  };

  const handleClear = async () => {
    if (confirm('Clear notes for this lesson?')) {
      localStorage.removeItem(storageKey);
      setNotes('');

      if (user && configured) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          try {
            await supabase.from('lesson_notes').update({ content: '' }).eq('user_id', user.id).eq('item_key', fileId);
          } catch {
            // fallback
          }
        }
      }
    }
  };

  return (
    <div className="border-t border-[#1F2937] bg-[#0B101E]">
      <div className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-gray-400 bg-[#0E1524]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 hover:text-gray-200 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-gray-300">My Study Notes</span>
          {notes.trim() && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          <span className="font-mono text-[10px] text-gray-500">
            {isOpen ? '▲ Collapse' : '▼ Expand'}
          </span>
        </button>

        <div className="flex items-center gap-3">
          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors ${
              isBookmarked
                ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                : 'bg-black/40 text-gray-400 border-gray-800 hover:text-gray-200'
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          {/* Cloud Sync indicator */}
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-gray-500">
            {user && configured ? (
              <>
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span>Cloud Synced</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3 h-3 text-gray-400" />
                <span>Local Only</span>
              </>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 md:p-6 bg-[#080C16] border-t border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 truncate max-w-[280px]">
              Notes for: <span className="text-white font-semibold">{lessonName}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                disabled={!notes.trim()}
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/20 disabled:opacity-40 transition-colors"
                title="Clear Notes"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isSaved ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                <span>{isSaved ? 'Saved!' : 'Save'}</span>
              </button>
            </div>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write key takeaways, CLI syntax, exploit commands, or exam questions..."
            rows={4}
            className="w-full bg-[#0E1524] text-gray-200 text-xs font-mono p-3 rounded-xl border border-gray-800 focus:outline-none focus:border-emerald-500 transition-colors resize-y leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}
