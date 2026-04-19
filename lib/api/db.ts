import { promises as fs } from 'fs';
import path from 'path';
import { ApiVendor, ApiOffer } from './types';

const DATA_DIR = path.join(process.cwd(), '.data');
const VENDORS_FILE = path.join(DATA_DIR, 'vendors.json');
const OFFERS_FILE = path.join(DATA_DIR, 'offers.json');
const COUNTERS_FILE = path.join(DATA_DIR, 'counters.json');

type Counters = { vendor: number; offer: number; detail: number };

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  await ensureDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getVendors(): Promise<ApiVendor[]> {
  return readJson<ApiVendor[]>(VENDORS_FILE, []);
}

export async function saveVendors(vendors: ApiVendor[]): Promise<void> {
  await writeJson(VENDORS_FILE, vendors);
}

export async function getOffers(): Promise<ApiOffer[]> {
  return readJson<ApiOffer[]>(OFFERS_FILE, []);
}

export async function saveOffers(offers: ApiOffer[]): Promise<void> {
  await writeJson(OFFERS_FILE, offers);
}

export async function getCounters(): Promise<Counters> {
  return readJson<Counters>(COUNTERS_FILE, { vendor: 0, offer: 0, detail: 0 });
}

export async function nextId(key: keyof Counters): Promise<number> {
  const c = await getCounters();
  c[key] += 1;
  await writeJson(COUNTERS_FILE, c);
  return c[key];
}
