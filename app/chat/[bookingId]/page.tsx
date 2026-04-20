'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Booking, MessageSender } from '@/lib/types';
import { getBookingById } from '@/lib/storage';
import { getUser } from '@/lib/auth';
import ChatWindow from '@/components/ChatWindow';
import Link from 'next/link';

export default function ChatPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [role, setRole] = useState<MessageSender>('client');

  useEffect(() => {
    const found = getBookingById(bookingId);
    setBooking(found ?? null);
    const user = getUser();
    if (user) setRole(user.role === 'vendor' ? 'vendor' : 'client');
  }, [bookingId]);

  if (!booking) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
        <p className="text-4xl mb-3">💬</p>
        <p>Чат не найден</p>
        <Link href="/" className="text-sm mt-2 inline-block hover:underline" style={{ color: 'var(--gold-dark)' }}>
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link href="/" className="hover:underline" style={{ color: 'var(--text-muted)' }}>← Каталог</Link>
        <span>/</span>
        <Link href={`/offers/${booking.offerId}`} className="hover:underline" style={{ color: 'var(--text-muted)' }}>
          {booking.offerTitle}
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-main)' }}>Чат</span>
      </div>

      <div className="h-[600px]">
        <ChatWindow booking={booking} currentSender={role} onUpdate={setBooking} />
      </div>
    </div>
  );
}
