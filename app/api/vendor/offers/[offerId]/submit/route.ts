import { NextResponse } from 'next/server';
import { authFromRequest } from '@/lib/api/jwt';
import { getOffers, saveOffers } from '@/lib/api/db';

type Ctx = { params: Promise<{ offerId: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const auth = authFromRequest(req);
  if (!auth || typeof auth.vendorId !== 'number') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { offerId } = await ctx.params;
  const id = Number(offerId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: 'Invalid offer id' }, { status: 400 });
  }

  const offers = await getOffers();
  const idx = offers.findIndex((o) => o.id === id);
  if (idx < 0) {
    return NextResponse.json({ message: 'Offer not found' }, { status: 404 });
  }
  if (offers[idx].vendorId !== auth.vendorId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const current = offers[idx].status;
  if (current !== 'CREATED' && current !== 'DISABLED') {
    return NextResponse.json(
      { message: `Only CREATED or DISABLED offers can be submitted (current: ${current})` },
      { status: 409 },
    );
  }

  offers[idx] = { ...offers[idx], status: 'PENDING', rejectionReason: null };
  await saveOffers(offers);

  return NextResponse.json({ id: offers[idx].id, status: offers[idx].status });
}
