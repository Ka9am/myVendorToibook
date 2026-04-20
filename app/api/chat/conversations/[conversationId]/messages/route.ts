import { NextResponse } from 'next/server';
import { authFromRequest } from '@/lib/api/jwt';
import {
  getConversations, getMessages, saveMessages, saveConversations, nextId,
} from '@/lib/api/db';
import { ApiChatMessage } from '@/lib/api/types';

type Ctx = { params: Promise<{ conversationId: string }> };

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(req: Request, ctx: Ctx) {
  const auth = authFromRequest(req);
  if (!auth || typeof auth.vendorId !== 'number') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { conversationId } = await ctx.params;
  const id = parseId(conversationId);
  if (id == null) return NextResponse.json({ message: 'Invalid conversation id' }, { status: 400 });

  const conversations = await getConversations();
  const conv = conversations.find((c) => c.id === id);
  if (!conv) return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
  if (conv.vendorId !== auth.vendorId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const messages = await getMessages();
  const result = messages
    .filter((m) => m.conversationId === id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return NextResponse.json(result);
}

export async function POST(req: Request, ctx: Ctx) {
  const auth = authFromRequest(req);
  if (!auth || typeof auth.vendorId !== 'number') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { conversationId } = await ctx.params;
  const id = parseId(conversationId);
  if (id == null) return NextResponse.json({ message: 'Invalid conversation id' }, { status: 400 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }
  const text = typeof (body as { text?: unknown })?.text === 'string'
    ? ((body as { text: string }).text).trim() : '';
  if (!text) return NextResponse.json({ message: 'text is required' }, { status: 400 });

  const conversations = await getConversations();
  const idx = conversations.findIndex((c) => c.id === id);
  if (idx < 0) return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
  if (conversations[idx].vendorId !== auth.vendorId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const messages = await getMessages();
  const now = new Date().toISOString();
  const message: ApiChatMessage = {
    id: await nextId('message'),
    conversationId: id,
    senderId: auth.vendorId,
    senderRole: 'VENDOR',
    text,
    status: 'SENT',
    createdAt: now,
  };
  messages.push(message);
  await saveMessages(messages);

  conversations[idx] = {
    ...conversations[idx],
    lastMessage: text,
    lastMessageAt: now,
  };
  await saveConversations(conversations);

  return NextResponse.json(message, { status: 201 });
}
