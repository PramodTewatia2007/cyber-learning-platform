'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle2, Loader2, Send } from 'lucide-react';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/authContext';

interface ReportBrokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseSlug: string;
  itemTitle: string;
}

export function ReportBrokenModal({
  isOpen,
  onClose,
  courseSlug,
  itemTitle,
}: ReportBrokenModalProps) {
  const { user } = useAuth();
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const configured = isSupabaseConfigured();
    const supabase = getSupabaseBrowserClient();

    if (configured && supabase) {
      try {
        const { error: insertErr } = await supabase.from('broken_link_reports').insert({
          user_id: user?.id || null,
          course_slug: courseSlug,
          item_title: itemTitle,
          details: details.trim() || 'Broken link or inaccessible file reported by learner.',
          status: 'open',
        });

        if (insertErr) {
          throw new Error(insertErr.message);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to submit report');
        setIsSubmitting(false);
        return;
      }
    } else {
      // Local fallback in demo mode
      try {
        const existing = JSON.parse(localStorage.getItem('cyber_lms_broken_reports') || '[]');
        existing.push({
          id: 'report-' + Date.now(),
          user_id: user?.id || 'guest',
          course_slug: courseSlug,
          item_title: itemTitle,
          details: details.trim() || 'Broken link reported.',
          status: 'open',
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('cyber_lms_broken_reports', JSON.stringify(existing));
      } catch {
        // ignore
      }
    }

    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setDetails('');
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0E1524] border border-[#1F2937] rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-100">Report Broken Resource</h3>
            <p className="text-xs text-gray-400">Notify admin to verify Google Drive or YouTube link</p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
            <h4 className="text-sm font-semibold text-white">Report Submitted</h4>
            <p className="text-xs text-gray-400 mt-1">Thank you! Our admins will review and restore access.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Resource</label>
              <div className="px-3 py-2 bg-black/40 border border-gray-800 rounded-lg text-xs text-gray-200 truncate">
                {itemTitle}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="E.g., Google Drive says 'Access Denied', YouTube video is private, or file is missing..."
                rows={3}
                className="w-full px-3 py-2 bg-[#090D16] border border-[#1F2937] rounded-lg text-xs text-gray-200 focus:outline-none focus:border-amber-500 transition-colors resize-none placeholder:text-gray-600"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/40 p-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
