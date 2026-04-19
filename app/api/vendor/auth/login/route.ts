import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getVendors } from '@/lib/api/db';
import { signToken } from '@/lib/api/jwt';

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export async function POST(req: Request) {
  let body: LoginBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const { email, password } = body;

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  const emailNormalized = email.trim().toLowerCase();
  const vendors = await getVendors();
  const vendor = vendors.find((v) => v.email.toLowerCase() === emailNormalized);

  if (!vendor) {
    return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, vendor.passwordHash);
  if (!ok) {
    return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
  }

  const token = signToken({ sub: vendor.email, vendorId: vendor.id });
  return NextResponse.json({ token });
}
