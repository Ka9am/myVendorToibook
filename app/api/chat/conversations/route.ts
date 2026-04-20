import { NextResponse } from 'next/server';
import { authFromRequest } from '@/lib/api/jwt';
import { getConversations, getMessages } from '@/lib/api/db';

export async function GET(req: Request) {
  const auth = authFromRequest(req);
  if (!auth || typeof auth.vendorId !== 'number') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const conversations = await getConversations();
  const messages = await getMessages();

  const mine = conversations.filter((c) => c.vendorId === auth.vendorId);
  const result = mine.map((c) => {
    const convMsgs = messages.filter((m) => m.conversationId === c.id);
    const unread = convMsgs.filter((m) => m.senderRole === 'CLIENT' && m.status !== 'READ').length;
    return { ...c, unreadCount: unread };
  });

  result.sort((a, b) =>
    (b.lastMessageAt ?? '').localeCompare(a.lastMessageAt ?? ''),
  );

  return NextResponse.json(result);
}
