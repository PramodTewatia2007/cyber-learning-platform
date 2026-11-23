import { NextResponse } from 'next/server';
import { fetchRedTeamRoadmap } from '@/lib/roadmap';

export async function GET() {
  try {
    const data = await fetchRedTeamRoadmap();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch roadmap' },
      { status: 500 }
    );
  }
}
