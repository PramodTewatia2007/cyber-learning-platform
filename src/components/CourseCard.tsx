'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CatalogCourse } from '@/types';
import {
  Film,
  BookOpen,
  FileArchive,
  FileCode,
  ArrowRight,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

interface CourseCardProps {
  course: CatalogCourse;
  trackAccent: string;
}

export function CourseCard({ course, trackAccent }: CourseCardProps) {
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    try {
      if (course.isRoadmap) {
        const savedRoadmap = localStorage.getItem('cyber_lms_roadmap_completed_items');
        if (savedRoadmap) {
          const items = JSON.parse(savedRoadmap);
          setCompletedCount(Array.isArray(items) ? items.length : 0);
        }
      } else {
        const saved = localStorage.getItem(`cyber_lms_completed_${course.slug}`);
        if (saved) {
          const items = JSON.parse(saved);
          setCompletedCount(Array.isArray(items) ? items.length : 0);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [course.slug, course.isRoadmap]);

  const targetUrl = course.isRoadmap ? '/roadmap' : `/course/${course.slug}`;
  const total = course.totalLessons || 1;
  const completionPercent = Math.min(100, Math.round((completedCount / total) * 100));

  return (
    <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-5 flex flex-col justify-between hover:border-gray-700 transition-all duration-200 group relative overflow-hidden shadow-lg hover:shadow-2xl">
      {/* Accent corner line */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
        style={{ backgroundColor: trackAccent }}
      />

      <div>
        {/* Top meta tags */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {course.recommendedStep && (
              <span
                style={{ color: trackAccent, borderColor: `${trackAccent}40`, backgroundColor: `${trackAccent}15` }}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
              >
                STEP #{course.recommendedStep}
              </span>
            )}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
              {course.isRoadmap ? 'Roadmap Snapshot' : 'R2 + YouTube'}
            </span>
          </div>

          {completedCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>{completionPercent}%</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-100 group-hover:text-white transition-colors line-clamp-1">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-400 line-clamp-2 mt-2 leading-relaxed">
          {course.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 my-3.5">
          {course.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#090D16] text-gray-400 border border-gray-800"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Section: Live counts & Enter button */}
      <div className="pt-3 border-t border-[#1F2937]/80">
        <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400 mb-3.5 flex-wrap">
          {course.stats.videos > 0 && (
            <span className="flex items-center gap-1 text-red-400/90">
              <Film className="w-3 h-3" />
              <span>{course.stats.videos} Videos</span>
            </span>
          )}
          {course.stats.pdfs > 0 && (
            <span className="flex items-center gap-1 text-emerald-400/90">
              <BookOpen className="w-3 h-3" />
              <span>{course.stats.pdfs} PDFs</span>
            </span>
          )}
          {course.stats.labs > 0 && (
            <span className="flex items-center gap-1 text-amber-400/90">
              <FileArchive className="w-3 h-3" />
              <span>{course.stats.labs} Labs</span>
            </span>
          )}
          {course.stats.docs > 0 && (
            <span className="flex items-center gap-1 text-cyan-400/90">
              <FileCode className="w-3 h-3" />
              <span>{course.stats.docs} Notes</span>
            </span>
          )}
          {course.stats.formattedTotalSize && course.stats.formattedTotalSize !== '0 B' && (
            <span className="flex items-center gap-1 text-gray-400 ml-auto">
              <HardDrive className="w-3 h-3 text-gray-500" />
              <span>{course.stats.formattedTotalSize}</span>
            </span>
          )}
        </div>

        {/* Action Link */}
        <Link
          href={targetUrl}
          className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold bg-[#1F2937] hover:bg-gray-700 text-gray-100 group/btn transition-colors border border-gray-700/60"
        >
          <span>{course.isRoadmap ? 'Open Roadmap' : 'Launch Workspace'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover/btn:translate-x-1 group-hover/btn:text-white transition-all" />
        </Link>
      </div>
    </div>
  );
}
