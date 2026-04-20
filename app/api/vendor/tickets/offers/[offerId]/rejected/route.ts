import { NextResponse } from 'next/server';
import { listVendorTickets, parseOfferId } from '@/lib/api/tickets';

type Ctx = { params: Promise<{ offerId: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { offerId } = await ctx.params;
  const id = parseOfferId(offerId);
  if (id == null) return NextResponse.json({ message: 'Invalid offer id' }, { status: 400 });
  return listVendorTickets(req, { offerId: id, status: 'REJECTED' });
}
