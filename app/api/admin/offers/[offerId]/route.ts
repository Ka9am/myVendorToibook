import { NextResponse } from 'next/server';
import { authFromRequest } from '@/lib/api/jwt';
import { getOffers } from '@/lib/api/db';
import { getVendors } from '@/lib/api/db';

type Ctx = { params: Promise<{ offerId: string }> };

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
