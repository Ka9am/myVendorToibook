import { NextResponse } from 'next/server';
import { authFromRequest } from '@/lib/api/jwt';
import { getOffers } from '@/lib/api/db';
import { toOfferCard } from '@/lib/api/mappers';

export async function GET(req: Request) {
  const auth = authFromRequest(req);
  if (!auth || auth.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const offers = await getOffers();
  const pending = offers.filter((o) => o.status === 'PENDING');
  pending.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json(pending.map((o) => ({
    ...toOfferCard(o),
    createdAt: o.createdAt,
  })));
}
