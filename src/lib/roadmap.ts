import fs from 'fs';
import path from 'path';

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

export interface RoadmapData {
  markdown: string;
  toc: TocItem[];
  totalMilestones: number;
  lastUpdated: string;
}

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/soheilsec/Red-Team-Roadmap/main/English.md';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function parseTableOfContents(markdown: string): TocItem[] {
  const lines = markdown.split('\n');
  const toc: TocItem[] = [];
  const headingRegex = /^(#{1,4})\s+(.+)$/;

  for (const line of lines) {
    const match = line.match(headingRegex);
    if (match) {
      const level = match[1].length;
      let title = match[2].trim();

      // Clean up markdown links or html anchor artifacts
      title = title.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      title = title.replace(/<[^>]+>/g, '');

      // Skip generic Table of contents heading
      if (/table of contents/i.test(title)) continue;

      const id = slugify(title);
      toc.push({ id, title, level });
    }
  }

  return toc;
}

export function extractChecklistMilestones(markdown: string): string[] {
  const lines = markdown.split('\n');
  const milestones: string[] = [];

  for (const line of lines) {
    // Check if line contains a bullet or numbered list with actionable items
    const match = line.match(/^(\s*[-*]|\s*\d+\.)\s+(.+)$/);
    if (match) {
      const cleanText = match[2].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
      if (cleanText.length > 5 && !cleanText.startsWith('#')) {
        milestones.push(cleanText);
      }
    }
  }

  return milestones;
}

export async function fetchRedTeamRoadmap(): Promise<RoadmapData> {
  let markdown = '';

  try {
    const response = await fetch(GITHUB_RAW_URL, {
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      markdown = await response.text();
    } else {
      console.warn(`[Roadmap] Failed to fetch live roadmap from GitHub (${response.status}), loading fallback snapshot.`);
    }
  } catch (error) {
    console.warn('[Roadmap] Error fetching live roadmap, using fallback snapshot');
  }

  // Fallback to local snapshot
  if (!markdown || markdown.trim() === '') {
    try {
      const fallbackPath = path.join(process.cwd(), 'src', 'data', 'red-team-roadmap-fallback.md');
      if (fs.existsSync(fallbackPath)) {
        markdown = fs.readFileSync(fallbackPath, 'utf8');
      }
    } catch (readErr) {
      console.error('[Roadmap] Could not read fallback roadmap:', readErr);
      markdown = '# Red Team Roadmap\n\nCould not load roadmap content. Please check your network connection.';
    }
  }

  const toc = parseTableOfContents(markdown);
  const milestones = extractChecklistMilestones(markdown);

  return {
    markdown,
    toc,
    totalMilestones: milestones.length,
    lastUpdated: new Date().toISOString(),
  };
}
