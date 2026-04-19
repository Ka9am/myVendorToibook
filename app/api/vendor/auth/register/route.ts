import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getVendors, saveVendors, nextId } from '@/lib/api/db';

type RegisterBody = {
  name?: unknown;
  surname?: unknown;
  email?: unknown;
  password?: unknown;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export async function POST(req: Request) {
  let body: RegisterBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, surname, email, password } = body;

  if (!isNonEmptyString(name) || !isNonEmptyString(surname) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
    return NextResponse.json(
      { message: 'Fields name, surname, email and password are required' },
      { status: 400 }
    );
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const vendors = await getVendors();
  const emailNormalized = email.trim().toLowerCase();

  if (vendors.some((v) => v.email.toLowerCase() === emailNormalized)) {
    return NextResponse.json({ message: 'Vendor with this email already exists' }, { status: 409 });
  }

  const id = await nextId('vendor');
  const passwordHash = await bcrypt.hash(password, 10);

  vendors.push({
    id,
    name: name.trim(),
    surname: surname.trim(),
    email: emailNormalized,
    passwordHash,
    createdAt: new Date().toISOString(),
  });
  await saveVendors(vendors);

  return NextResponse.json(
    { id, message: 'Vendor registered successfully' },
    { status: 201 }
  );
}
