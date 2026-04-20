import { NextResponse } from 'next/server';
import { authFromRequest } from '@/lib/api/jwt';
import { getOffers } from '@/lib/api/db';
import { OfferStatus } from '@/lib/api/types';

const VALID: OfferStatus[] = ['CREATED', 'PENDING', 'ACTIVE', 'DISABLED'];

export async function GET(req: Request) {
  const auth = authFromRequest(req);
  if (!auth || auth.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const statusRaw = url.searchParams.get('status');
  const status = statusRaw && VALID.includes(statusRaw as OfferStatus)
    ? (statusRaw as OfferStatus) : null;

  const offers = await getOffers();
  const filtered = status ? offers.filter((o) => o.status === status) : offers;
  filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json(filtered);
}
