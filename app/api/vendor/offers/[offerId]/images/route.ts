import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { authFromRequest } from '@/lib/api/jwt';
import { getOffers, saveOffers } from '@/lib/api/db';
import { toOfferCard } from '@/lib/api/mappers';
import { OfferImage } from '@/lib/api/types';

type Ctx = { params: Promise<{ offerId: string }> };

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'offers');
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 8 * 1024 * 1024;

async function saveFile(buf: Buffer, ext: string): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return `/uploads/offers/${name}`;
}

function extFromMime(mime: string): string {
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/gif') return '.gif';
  return '.bin';
}

export async function POST(req: Request, ctx: Ctx) {
  const auth = authFromRequest(req);
  if (!auth || typeof auth.vendorId !== 'number') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { offerId } = await ctx.params;
  const id = Number(offerId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: 'Invalid offer id' }, { status: 400 });
  }

  const offers = await getOffers();
  const idx = offers.findIndex((o) => o.id === id);
  if (idx < 0) {
    return NextResponse.json({ message: 'Offer not found' }, { status: 404 });
  }
  if (offers[idx].vendorId !== auth.vendorId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ message: 'Expected multipart/form-data' }, { status: 400 });
  }

  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ message: 'No files uploaded (field: files)' }, { status: 400 });
  }

  const newImages: OfferImage[] = [];
  for (const file of files) {
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { message: `Unsupported file type: ${file.type}` },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { message: `File too large (>8MB): ${file.name}` },
        { status: 400 },
      );
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const url = await saveFile(buf, extFromMime(file.type));
    newImages.push({ imageUrl: url, isCover: false });
  }

  const hasCover = offers[idx].images.some((i) => i.isCover);
  if (!hasCover && newImages.length > 0) {
    newImages[0].isCover = true;
  }

  offers[idx] = {
    ...offers[idx],
    images: [...offers[idx].images, ...newImages],
  };
  await saveOffers(offers);

  return NextResponse.json({
    ...toOfferCard(offers[idx]),
    images: offers[idx].images,
  });
}
