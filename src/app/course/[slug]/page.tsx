import React from 'react';
import { Metadata } from 'next';
import { getAllLessons, getAllTracks } from '@/utils/lessonBuilder';
import { FlatLessonWorkspace } from '@/components/FlatLessonWorkspace';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tracks = getAllTracks();
  const track = tracks.find(
    (t) => t.id === slug || t.title.toLowerCase().includes(slug.toLowerCase())
  );
  if (!track) {
    return { title: 'Cybersecurity Curriculum Lessons // Cyber Academy' };
  }
  return {
    title: `${track.title} // Cyber Academy LMS`,
    description: track.description,
  };
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params;

  const allLessons = getAllLessons();
  const tracks = getAllTracks();

  // Map incoming slug to canonical track id
  let targetTrackId = 'all';
  if (slug === 'cybersecurity-fundamentals' || slug === 'fundamentals') {
    targetTrackId = 'fundamentals';
  } else if (slug === 'ethical-hacking-scratch' || slug === 'ethical-hacking') {
    targetTrackId = 'ethical-hacking';
  } else if (slug === 'red-team-roadmap') {
    targetTrackId = 'red-team-roadmap';
  } else if (slug.startsWith('ceh')) {
    targetTrackId = 'ceh';
  } else if (slug === 'red-team-resources') {
    targetTrackId = 'red-team-resources';
  } else if (slug.startsWith('offsec')) {
    targetTrackId = 'offsec';
  } else if (slug.startsWith('blue') || slug.startsWith('soc')) {
    targetTrackId = 'blue-team-soc';
  } else {
    const matched = tracks.find((t) => t.id === slug);
    if (matched) targetTrackId = matched.id;
  }

  return (
    <FlatLessonWorkspace
      initialLessons={allLessons}
      tracks={tracks}
      initialTrackId={targetTrackId}
    />
  );
}
