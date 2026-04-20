import { promises as fs } from 'fs';
import path from 'path';
import { ApiVendor, ApiOffer, ApiTicket, ApiConversation, ApiChatMessage } from './types';

const DATA_DIR = path.join(process.cwd(), '.data');
const VENDORS_FILE = path.join(DATA_DIR, 'vendors.json');
const OFFERS_FILE = path.join(DATA_DIR, 'offers.json');
const COUNTERS_FILE = path.join(DATA_DIR, 'counters.json');
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');
const CONVERSATIONS_FILE = path.join(DATA_DIR, 'conversations.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

type Counters = {
  vendor: number;
  offer: number;
  detail: number;
  ticket: number;
  conversation: number;
  message: number;
};

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

export async function getTickets(): Promise<ApiTicket[]> {
  return readJson<ApiTicket[]>(TICKETS_FILE, []);
}

export async function saveTickets(tickets: ApiTicket[]): Promise<void> {
  await writeJson(TICKETS_FILE, tickets);
}

export async function getConversations(): Promise<ApiConversation[]> {
  return readJson<ApiConversation[]>(CONVERSATIONS_FILE, []);
}

export async function saveConversations(items: ApiConversation[]): Promise<void> {
  await writeJson(CONVERSATIONS_FILE, items);
}

export async function getMessages(): Promise<ApiChatMessage[]> {
  return readJson<ApiChatMessage[]>(MESSAGES_FILE, []);
}

export async function saveMessages(items: ApiChatMessage[]): Promise<void> {
  await writeJson(MESSAGES_FILE, items);
}

export async function getCounters(): Promise<Counters> {
  const defaults: Counters = {
    vendor: 0, offer: 0, detail: 0, ticket: 0, conversation: 0, message: 0,
  };
  const data = await readJson<Partial<Counters>>(COUNTERS_FILE, {});
  return { ...defaults, ...data };
}

export async function nextId(key: keyof Counters): Promise<number> {
  const c = await getCounters();
  c[key] += 1;
  await writeJson(COUNTERS_FILE, c);
  return c[key];
}
