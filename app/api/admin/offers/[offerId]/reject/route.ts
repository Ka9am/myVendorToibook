import { NextResponse } from 'next/server';
import { authFromRequest } from '@/lib/api/jwt';
import { getOffers, saveOffers } from '@/lib/api/db';

type Ctx = { params: Promise<{ offerId: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const auth = authFromRequest(req);
  if (!auth || auth.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { offerId } = await ctx.params;
  const id = Number(offerId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: 'Invalid offer id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const reasonRaw = (body as { reason?: unknown })?.reason;
  const reason = typeof reasonRaw === 'string' ? reasonRaw.trim() : '';
  if (!reason) {
    return NextResponse.json({ message: 'reason is required' }, { status: 400 });
  }

  const offers = await getOffers();
  const idx = offers.findIndex((o) => o.id === id);
  if (idx < 0) {
    return NextResponse.json({ message: 'Offer not found' }, { status: 404 });
  }

  if (offers[idx].status !== 'PENDING') {
    return NextResponse.json(
      { message: `Only PENDING offers can be rejected (current: ${offers[idx].status})` },
      { status: 409 },
    );
  }

  offers[idx] = { ...offers[idx], status: 'DISABLED', rejectionReason: reason };
  await saveOffers(offers);

  return NextResponse.json({
    id: offers[idx].id,
    status: offers[idx].status,
    rejectionReason: offers[idx].rejectionReason,
  });
}
