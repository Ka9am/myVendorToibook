import { NextResponse } from 'next/server';
import { getOffers } from '@/lib/api/db';
import { authFromRequest } from '@/lib/api/jwt';
import { parseFeedParams, applyFeed } from '@/lib/api/feed';

export async function GET(req: Request) {
  const auth = authFromRequest(req);
  if (!auth) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const params = parseFeedParams(url.searchParams);
  const all = await getOffers();
  const mine = all.filter((o) => o.vendorId === auth.vendorId);
  return NextResponse.json(applyFeed(mine, params));
}
