'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Offer, Booking } from '@/lib/types';
import { getVendorOffers, getVendorBookings, getVendorId, deleteOffer } from '@/lib/storage';
import { CATEGORY_LABELS } from '@/lib/types';
import { getUser } from '@/lib/auth';
import BookingStatusBadge from '@/components/BookingStatusBadge';
import AuthGuard from '@/components/AuthGuard';

function DashboardContent() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const load = () => {
    const vendorId = getVendorId();
    setOffers(getVendorOffers(vendorId));
    setBookings(getVendorBookings(vendorId));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = (id: string) => {
    if (!confirm('Удалить оффер?')) return;
    deleteOffer(id);
    load();
  };

  const pending = bookings.filter((b) => b.status === 'pending').length;
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Мой дашборд</h1>
        <Link
          href="/vendor/create"
          className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
        >
          + Новый оффер
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Офферов', value: offers.length, color: 'text-gray-900' },
          { label: 'Новых заявок', value: pending, color: 'text-yellow-600' },
          { label: 'Подтверждено', value: confirmed, color: 'text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Offers */}
      <div>
        <h2 className="font-semibold text-gray-800 mb-4">Мои офферы</h2>
        {offers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            <p className="text-3xl mb-2">📋</p>
            <p>Офферов пока нет</p>
            <Link href="/vendor/create" className="text-rose-600 text-sm mt-2 inline-block hover:underline">
              Создать первый
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => {
              const offerBookings = bookings.filter((b) => b.offerId === offer.id);
              const icon: Record<string, string> = {
                venue: '🏛️', catering: '🍽️', music: '🎵',
                photo_video: '📷', decor: '🌸', tamada: '🎤', other: '✨',
              };
              return (
                <div key={offer.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-2xl flex-shrink-0">
                    {offer.photos[0] ? (
                      <img src={offer.photos[0]} className="w-full h-full rounded-xl object-cover" alt="" />
                    ) : (
                      icon[offer.category]
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{offer.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {CATEGORY_LABELS[offer.category]} · {offer.city} · {offer.price.toLocaleString('ru-RU')} ₸
                    </p>
                    {offerBookings.length > 0 && (
                      <p className="text-xs text-rose-600 mt-1">
                        {offerBookings.length} заявок
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      href={`/offers/${offer.id}`}
                      className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Просмотр
                    </Link>
                    <button
                      onClick={() => handleDelete(offer.id)}
                      className="text-xs text-red-400 hover:text-red-600 border border-red-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Последние заявки</h2>
          <Link href="/vendor/leads" className="text-sm text-rose-600 hover:underline">
            Все заявки →
          </Link>
        </div>
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">📩</p>
            <p>Заявок пока нет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{b.clientName}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {b.offerTitle} · {new Date(b.eventDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <BookingStatusBadge status={b.status} />
                <Link
                  href={`/chat/${b.id}?role=vendor`}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Открыть чат
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VendorDashboardPage() {
  return (
    <AuthGuard role="vendor">
      <DashboardContent />
    </AuthGuard>
  );
}
