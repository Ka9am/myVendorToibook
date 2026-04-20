import { NextResponse } from 'next/server';
import { authFromRequest } from '@/lib/api/jwt';
import { getConversations, getMessages, saveMessages } from '@/lib/api/db';

type Ctx = { params: Promise<{ conversationId: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const auth = authFromRequest(req);
  if (!auth || typeof auth.vendorId !== 'number') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { conversationId } = await ctx.params;
  const id = Number(conversationId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: 'Invalid conversation id' }, { status: 400 });
  }

  const conversations = await getConversations();
  const conv = conversations.find((c) => c.id === id);
  if (!conv) return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
  if (conv.vendorId !== auth.vendorId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const messages = await getMessages();
  let updated = 0;
  for (const m of messages) {
    if (m.conversationId === id && m.senderRole === 'CLIENT' && m.status !== 'READ') {
      m.status = 'READ';
      updated += 1;
    }
  }
  if (updated > 0) await saveMessages(messages);

  return NextResponse.json({ conversationId: id, markedRead: updated });
}
