import React from 'react';
import { Metadata } from 'next';
import { getAllLessons, getAllTracks } from '@/utils/lessonBuilder';
import { FlatLessonWorkspace } from '@/components/FlatLessonWorkspace';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Full Curriculum Lessons // Cyber Academy LMS',
  description: 'Curated cybersecurity lessons with matched YouTube videos, Google Drive PDFs, notes, and hands-on lab downloads.',
};

export default async function FullCurriculumPage() {
  const allLessons = getAllLessons();
  const tracks = getAllTracks();

  return (
    <FlatLessonWorkspace
      initialLessons={allLessons}
      tracks={tracks}
      initialTrackId="all"
    />
  );
}
