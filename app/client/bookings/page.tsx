'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Booking, BookingStatus } from '@/lib/types';
import { getClientBookings } from '@/lib/storage';
import { getUser } from '@/lib/auth';
import BookingStatusBadge from '@/components/BookingStatusBadge';
import AuthGuard from '@/components/AuthGuard';

const TABS: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Ожидают', value: 'pending' },
  { label: 'Подтверждены', value: 'confirmed' },
  { label: 'Отклонены', value: 'rejected' },
];

function BookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<BookingStatus | 'all'>('all');

  useEffect(() => {
    const user = getUser();
    if (!user) return;
    setBookings(getClientBookings(user.id));
  }, []);

  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Мои заявки</h1>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => {
          const count = t.value === 'all' ? bookings.length : bookings.filter(b => b.status === t.value).length;
          const isActive = tab === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors border"
              style={{
                background: isActive ? 'var(--gold)' : 'white',
                color: isActive ? 'white' : 'var(--text-sub)',
                borderColor: isActive ? 'var(--gold)' : 'var(--border)',
              }}
            >
              {t.label}
              {count > 0 && (
                <span className="ml-1.5 text-xs opacity-80">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-white" style={{ border: '1px solid var(--border)' }}>
          <p className="text-3xl mb-3">📩</p>
          <p className="font-medium" style={{ color: 'var(--text-sub)' }}>Заявок пока нет</p>
          <Link href="/" className="text-sm mt-2 inline-block hover:underline" style={{ color: 'var(--gold-dark)' }}>
            Найти вендора
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-5 flex items-center gap-4"
              style={{ border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{b.offerTitle}</p>
                  <BookingStatusBadge status={b.status} />
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Дата: {new Date(b.eventDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {b.messages.length > 0 && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {b.messages.length} сообщ. · {b.messages[b.messages.length - 1].text.slice(0, 60)}
                    {b.messages[b.messages.length - 1].text.length > 60 ? '...' : ''}
                  </p>
                )}
              </div>
              <Link
                href={`/chat/${b.id}?role=client`}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--gold)' }}
              >
                Открыть чат
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClientBookingsPage() {
  return (
    <AuthGuard role="client">
      <BookingsContent />
    </AuthGuard>
  );
}
