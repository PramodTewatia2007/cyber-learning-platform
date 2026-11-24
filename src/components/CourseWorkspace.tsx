'use client';

import React from 'react';
import { CatalogCourse } from '@/types';
import { FlatLessonWorkspace } from './FlatLessonWorkspace';
import { getAllLessons, getAllTracks } from '@/utils/lessonBuilder';

interface CourseWorkspaceProps {
  course?: CatalogCourse;
}

export function CourseWorkspace({ course }: CourseWorkspaceProps) {
  const allLessons = getAllLessons();
  const tracks = getAllTracks();

  let initialTrackId = 'all';
  if (course) {
    const slug = course.slug;
    if (slug === 'cybersecurity-fundamentals' || slug === 'fundamentals') initialTrackId = 'fundamentals';
    else if (slug === 'ethical-hacking-scratch' || slug === 'ethical-hacking') initialTrackId = 'ethical-hacking';
    else if (slug === 'red-team-roadmap') initialTrackId = 'red-team-roadmap';
    else if (slug.startsWith('ceh')) initialTrackId = 'ceh';
    else if (slug === 'red-team-resources') initialTrackId = 'red-team-resources';
    else if (slug.startsWith('offsec')) initialTrackId = 'offsec';
    else if (slug.startsWith('blue') || slug.startsWith('soc')) initialTrackId = 'blue-team-soc';
  }

  return (
    <FlatLessonWorkspace
      initialLessons={allLessons}
      tracks={tracks}
      initialTrackId={initialTrackId}
    />
  );
}
