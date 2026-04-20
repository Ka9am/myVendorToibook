import { NextResponse } from 'next/server';
import { authFromRequest } from './jwt';
import { getTickets } from './db';
import { ApiTicket, TicketCard, TicketStatus } from './types';

export function toTicketCard(t: ApiTicket): TicketCard {
  return {
    id: t.id,
    eventId: t.eventId,
    offerId: t.offerId,
    eventName: t.eventName,
    eventDescription: t.eventDescription,
    messageToVendor: t.messageToVendor,
    status: t.status,
    created_At: t.created_At,
  };
}

type Filter = { offerId?: number; status?: TicketStatus; excludeSaved?: boolean };

export async function listVendorTickets(req: Request, filter: Filter = {}) {
  const auth = authFromRequest(req);
  if (!auth || typeof auth.vendorId !== 'number') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const tickets = await getTickets();
  const result = tickets
    .filter((t) => t.vendorId === auth.vendorId)
    .filter((t) => (filter.offerId == null ? true : t.offerId === filter.offerId))
    .filter((t) => (filter.status ? t.status === filter.status : true))
    .filter((t) => (filter.excludeSaved ? t.status !== 'SAVED' : true))
    .sort((a, b) => b.created_At.localeCompare(a.created_At));

  return NextResponse.json(result.map(toTicketCard));
}

export function parseOfferId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}
