import { NextResponse } from 'next/server';
import { authFromRequest } from '@/lib/api/jwt';
import { getOffers, saveOffers, nextId } from '@/lib/api/db';
import { toOfferCard } from '@/lib/api/mappers';
import { validateOfferRequest } from '@/lib/api/validate';
import { ApiOffer, OfferDetail } from '@/lib/api/types';

export async function GET(req: Request) {
  const auth = authFromRequest(req);
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const offers = await getOffers();
  const mine = offers
    .filter((o) => o.vendorId === auth.vendorId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toOfferCard);

  return NextResponse.json(mine);
}

export async function POST(req: Request) {
  const auth = authFromRequest(req);
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const result = validateOfferRequest(body);
  if (!result.ok) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  const data = result.value;
  const id = await nextId('offer');

  const detailsResponses: OfferDetail[] = [];
  for (const d of data.details) {
    detailsResponses.push({
      id: await nextId('detail'),
      detailsType: d.detailsType,
      data: d.data,
    });
  }

  const offer: ApiOffer = {
    id,
    vendorId: auth.vendorId,
    vendorType: data.vendorType,
    venueType: data.venueType,
    serviceType: data.serviceType,
    displayName: data.displayName,
    description: data.description,
    city: data.city,
    status: 'CREATED',
    images: data.images,
    detailsResponses,
    createdAt: new Date().toISOString(),
  };

  const offers = await getOffers();
  offers.push(offer);
  await saveOffers(offers);

  return NextResponse.json(toOfferCard(offer), { status: 201 });
}
