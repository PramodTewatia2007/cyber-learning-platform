import React from 'react';
import { Metadata } from 'next';
import { fetchRedTeamRoadmap } from '@/lib/roadmap';
import { isDriveConfigured } from '@/lib/drive';
import { Navbar } from '@/components/Navbar';
import { RoadmapViewer } from '@/components/RoadmapViewer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Red Team Operations Roadmap // Cyber Academy',
  description: 'Interactive offensive security curriculum and career roadmap tracking C2 frameworks, Active Directory dominance, and adversary emulation.',
};

export default async function RoadmapPage() {
  const isConfigured = isDriveConfigured();
  const data = await fetchRedTeamRoadmap();

  return (
    <div className="h-screen w-screen flex flex-col bg-[#090D16] text-[#E5E7EB] overflow-hidden">
      <Navbar isDriveConfigured={isConfigured} />
      <div className="flex-1 min-h-0 overflow-hidden">
        <RoadmapViewer initialData={data} />
      </div>
    </div>
  );
}
