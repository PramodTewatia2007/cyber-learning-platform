import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { fetchCourseBySlug } from '@/lib/courses';
import { CourseWorkspace } from '@/components/CourseWorkspace';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await fetchCourseBySlug(slug);
  if (!course) return { title: 'Course Not Found // Cyber Academy' };

  return {
    title: `${course.title} // Cyber Academy LMS`,
    description: course.description,
  };
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === 'red-team-roadmap') {
    redirect('/roadmap');
  }

  const course = await fetchCourseBySlug(slug);
  if (!course) {
    notFound();
  }

  return (
    <CourseWorkspace
      course={course}
    />
  );
}
