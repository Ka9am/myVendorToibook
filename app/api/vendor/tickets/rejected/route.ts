import { listVendorTickets } from '@/lib/api/tickets';

export async function GET(req: Request) {
  return listVendorTickets(req, { status: 'REJECTED' });
}
