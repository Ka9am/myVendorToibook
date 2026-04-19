import { NextResponse } from 'next/server';
import { getOffers } from '@/lib/api/db';

type Ctx = { params: Promise<{ offerId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
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
