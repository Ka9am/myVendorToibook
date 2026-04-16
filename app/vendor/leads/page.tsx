'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Booking, BookingStatus } from '@/lib/types';
import { getVendorBookings, getVendorId } from '@/lib/storage';
import BookingStatusBadge from '@/components/BookingStatusBadge';
import AuthGuard from '@/components/AuthGuard';

const STATUS_TABS: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Ожидают', value: 'pending' },
  { label: 'Подтверждены', value: 'confirmed' },
  { label: 'Отклонены', value: 'rejected' },
];

function LeadsInner() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<BookingStatus | 'all'>('all');

  useEffect(() => {
    setBookings(getVendorBookings(getVendorId()));
  }, []);

  const filtered = tab === 'all' ? bookings : bookings.filter((b) => b.status === tab);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/vendor/dashboard" className="text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>
          ← Дашборд
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Все заявки</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {STATUS_TABS.map((t) => {
          const count = t.value === 'all' ? bookings.length : bookings.filter((b) => b.status === t.value).length;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors border"
              style={{
                background: tab === t.value ? 'var(--gold)' : 'white',
                color: tab === t.value ? 'white' : 'var(--text-sub)',
                borderColor: tab === t.value ? 'var(--gold)' : 'var(--border)',
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
        <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <p className="text-3xl mb-2">📩</p>
          <p>Заявок нет</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl p-5 flex items-center gap-4" style={{ border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold" style={{ color: 'var(--text-main)' }}>{b.clientName}</p>
                  <BookingStatusBadge status={b.status} />
                </div>
                <p className="text-sm text-gray-500 truncate">{b.offerTitle}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Дата мероприятия: {new Date(b.eventDate).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                  {' · '}
                  Заявка от {new Date(b.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'short',
                  })}
                </p>
                {b.messages.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Сообщений: {b.messages.length}
                    {' · '}
                    Последнее: {b.messages[b.messages.length - 1].text.slice(0, 50)}
                    {b.messages[b.messages.length - 1].text.length > 50 ? '...' : ''}
                  </p>
                )}
              </div>
              <Link
                href={`/chat/${b.id}?role=vendor`}
                className="text-white text-sm px-4 py-2 rounded-xl transition-opacity hover:opacity-90 flex-shrink-0"
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

export default function VendorLeadsPage() {
  return (
    <AuthGuard role="vendor">
      <LeadsInner />
    </AuthGuard>
  );
}
