'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, Save, Check, Trash2, FileText } from 'lucide-react';

interface LessonNotesProps {
  fileId: string;
  lessonName: string;
}

export function LessonNotes({ fileId, lessonName }: LessonNotesProps) {
  const [notes, setNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const storageKey = `cyber_lms_notes_${fileId}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setNotes(saved);
    } else {
      setNotes('');
    }
  }, [fileId, storageKey]);

  const handleSave = () => {
    localStorage.setItem(storageKey, notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleClear = () => {
    if (confirm('Clear notes for this lesson?')) {
      localStorage.removeItem(storageKey);
      setNotes('');
    }
  };

  return (
    <div className="border-t border-[#1F2937] bg-[#0B101E]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-2.5 flex items-center justify-between text-xs text-gray-400 hover:text-gray-200 hover:bg-[#0E1524] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-gray-300">Personal Lesson Notes</span>
          {notes.trim() && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </div>
        <span className="font-mono text-[11px] text-gray-500">
          {isOpen ? 'Collapse Notes ▲' : 'Open Scratchpad ▼'}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 md:p-6 bg-[#080C16] border-t border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-mono">
              Saved automatically to browser local storage
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
                title="Clear Notes"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors"
              >
                {isSaved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                <span>{isSaved ? 'Saved' : 'Save Notes'}</span>
              </button>
            </div>
          </div>

          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              localStorage.setItem(storageKey, e.target.value);
            }}
            placeholder="Type your notes, key takeaways, command syntax, or findings here..."
            className="w-full h-36 bg-[#0A0F1D] text-gray-200 border border-gray-800 rounded-lg p-3 text-xs md:text-sm font-mono focus:outline-none focus:border-emerald-500 resize-y"
          />
        </div>
      )}
    </div>
  );
}
