import { NextResponse } from 'next/server';
import { authFromRequest } from '@/lib/api/jwt';
import { getOffers, saveOffers, getVendors } from '@/lib/api/db';
import { OfferStatus } from '@/lib/api/types';

type Ctx = { params: Promise<{ offerId: string }> };

const VALID: OfferStatus[] = ['CREATED', 'PENDING', 'ACTIVE', 'DISABLED'];

export async function GET(req: Request, ctx: Ctx) {
  const auth = authFromRequest(req);
  if (!auth || auth.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { offerId } = await ctx.params;
  const id = Number(offerId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: 'Invalid offer id' }, { status: 400 });
  }

  const offers = await getOffers();
  const offer = offers.find((o) => o.id === id);
  if (!offer) {
    return NextResponse.json({ message: 'Offer not found' }, { status: 404 });
  }

  const vendors = await getVendors();
  const vendor = vendors.find((v) => v.id === offer.vendorId);

  return NextResponse.json({
    ...offer,
    vendor: vendor ? {
      id: vendor.id,
      name: vendor.name,
      surname: vendor.surname,
      email: vendor.email,
    } : null,
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
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
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const b = body as { status?: unknown; reason?: unknown };
  const statusRaw = typeof b.status === 'string' ? b.status : '';
  if (!VALID.includes(statusRaw as OfferStatus)) {
    return NextResponse.json(
      { message: `status must be one of ${VALID.join(', ')}` },
      { status: 400 },
    );
  }
  const status = statusRaw as OfferStatus;
  const reason = typeof b.reason === 'string' ? b.reason.trim() : '';
  if (status === 'DISABLED' && !reason) {
    return NextResponse.json({ message: 'reason is required when rejecting' }, { status: 400 });
  }

  const offers = await getOffers();
  const idx = offers.findIndex((o) => o.id === id);
  if (idx < 0) {
    return NextResponse.json({ message: 'Offer not found' }, { status: 404 });
  }

  if (offers[idx].status !== 'PENDING') {
    return NextResponse.json(
      { message: `Only PENDING offers can be moderated (current: ${offers[idx].status})` },
      { status: 409 },
    );
  }

  offers[idx] = {
    ...offers[idx],
    status,
    rejectionReason: status === 'DISABLED' ? reason : null,
  };
  await saveOffers(offers);

  return NextResponse.json({
    id: offers[idx].id,
    status: offers[idx].status,
    rejectionReason: offers[idx].rejectionReason ?? null,
  });
}
