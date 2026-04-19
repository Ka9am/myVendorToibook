import { NextResponse } from 'next/server';
import { authFromRequest } from '@/lib/api/jwt';
import { getOffers, saveOffers, nextId } from '@/lib/api/db';
import { toOfferCard } from '@/lib/api/mappers';
import { validateOfferRequest } from '@/lib/api/validate';
import { OfferDetail } from '@/lib/api/types';

type Ctx = { params: Promise<{ offerId: string }> };

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(req: Request, ctx: Ctx) {
  const auth = authFromRequest(req);
  if (!auth) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { offerId } = await ctx.params;
  const id = parseId(offerId);
  if (id == null) return NextResponse.json({ message: 'Invalid offer id' }, { status: 400 });

  const offers = await getOffers();
  const offer = offers.find((o) => o.id === id);
  if (!offer) return NextResponse.json({ message: 'Offer not found' }, { status: 404 });
  if (offer.vendorId !== auth.vendorId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    id: offer.id,
    vendorType: offer.vendorType,
    venueType: offer.venueType,
    serviceType: offer.serviceType,
    displayName: offer.displayName,
    description: offer.description,
    city: offer.city,
    status: offer.status,
    images: offer.images,
    detailsResponses: offer.detailsResponses,
  });
}

export async function PUT(req: Request, ctx: Ctx) {
  const auth = authFromRequest(req);
  if (!auth) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { offerId } = await ctx.params;
  const id = parseId(offerId);
  if (id == null) return NextResponse.json({ message: 'Invalid offer id' }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const result = validateOfferRequest(body);
  if (!result.ok) return NextResponse.json({ message: result.error }, { status: 400 });

  const offers = await getOffers();
  const idx = offers.findIndex((o) => o.id === id);
  if (idx < 0) return NextResponse.json({ message: 'Offer not found' }, { status: 404 });
  if (offers[idx].vendorId !== auth.vendorId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const data = result.value;
  const detailsResponses: OfferDetail[] = [];
  for (const d of data.details) {
    detailsResponses.push({
      id: await nextId('detail'),
      detailsType: d.detailsType,
      data: d.data,
    });
  }

  offers[idx] = {
    ...offers[idx],
    vendorType: data.vendorType,
    venueType: data.venueType,
    serviceType: data.serviceType,
    displayName: data.displayName,
    description: data.description,
    city: data.city,
    images: data.images,
    detailsResponses,
  };
  await saveOffers(offers);

  return NextResponse.json(toOfferCard(offers[idx]));
}

export async function DELETE(req: Request, ctx: Ctx) {
  const auth = authFromRequest(req);
  if (!auth) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { offerId } = await ctx.params;
  const id = parseId(offerId);
  if (id == null) return NextResponse.json({ message: 'Invalid offer id' }, { status: 400 });

  const offers = await getOffers();
  const idx = offers.findIndex((o) => o.id === id);
  if (idx < 0) return NextResponse.json({ message: 'Offer not found' }, { status: 404 });
  if (offers[idx].vendorId !== auth.vendorId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  offers.splice(idx, 1);
  await saveOffers(offers);
  return new NextResponse(null, { status: 204 });
}
