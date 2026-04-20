import { NextResponse } from 'next/server';
import { authFromRequest } from '@/lib/api/jwt';
import { getConversations, getMessages, saveMessages } from '@/lib/api/db';

type Ctx = { params: Promise<{ messageId: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const auth = authFromRequest(req);
  if (!auth || typeof auth.vendorId !== 'number') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { messageId } = await ctx.params;
  const id = Number(messageId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: 'Invalid message id' }, { status: 400 });
  }

  const messages = await getMessages();
  const idx = messages.findIndex((m) => m.id === id);
  if (idx < 0) return NextResponse.json({ message: 'Message not found' }, { status: 404 });

  const conversations = await getConversations();
  const conv = conversations.find((c) => c.id === messages[idx].conversationId);
  if (!conv || conv.vendorId !== auth.vendorId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  if (messages[idx].senderRole !== 'CLIENT') {
    return NextResponse.json(
      { message: 'Only incoming messages can be marked delivered' },
      { status: 400 },
    );
  }

  if (messages[idx].status === 'SENT') {
    messages[idx].status = 'DELIVERED';
    await saveMessages(messages);
  }

  return NextResponse.json({ id: messages[idx].id, status: messages[idx].status });
}
