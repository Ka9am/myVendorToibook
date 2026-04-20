import { NextResponse } from 'next/server';
import { signToken } from '@/lib/api/jwt';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@toibook.kz';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const b = body as { email?: unknown; password?: unknown };
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
  const password = typeof b.password === 'string' ? b.password : '';

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
  }

  const token = signToken({ sub: ADMIN_EMAIL, role: 'ADMIN' });
  return NextResponse.json({ token });
}
