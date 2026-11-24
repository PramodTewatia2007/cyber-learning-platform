'use client';

import React from 'react';
import { LessonItem } from '@/types';
import { DrivePreviewViewer } from './DrivePreviewViewer';

interface PdfViewerProps {
  lesson: LessonItem;
  courseTitle?: string;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
  accentColor?: string;
}

export function PdfViewer(props: PdfViewerProps) {
  return <DrivePreviewViewer {...props} />;
}
