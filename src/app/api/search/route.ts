import { NextRequest, NextResponse } from 'next/server';
import { searchCatalog } from '@/lib/catalog';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get('q') || '').trim();

  if (!query) {
    return NextResponse.json({ query: '', count: 0, results: [] });
  }

  const results = searchCatalog(query);

  return NextResponse.json({
    query,
    count: results.length,
    results,
  });
}
