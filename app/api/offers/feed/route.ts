import { NextResponse } from 'next/server';
import { getOffers } from '@/lib/api/db';
import { parseFeedParams, applyFeed } from '@/lib/api/feed';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = parseFeedParams(url.searchParams);
  const all = await getOffers();
  const activeOnly = all.filter((o) => o.status === 'ACTIVE');
  return NextResponse.json(applyFeed(activeOnly, params));
}
