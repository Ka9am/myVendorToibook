'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Offer, Booking, CATEGORY_LABELS } from '@/lib/types';
import {
  getVendorOffers, getVendorBookings, getVendorId, deleteOffer,
  toggleOfferActive, toggleOfferFeatured,
} from '@/lib/storage';
import BookingStatusBadge from '@/components/BookingStatusBadge';
import AuthGuard from '@/components/AuthGuard';
import { showToast } from '@/components/Toast';

const ICONS: Record<string, string> = {
  venue: '🏛️', catering: '🍽️', music: '🎵',
  photo_video: '📷', decor: '🌸', tamada: '🎤', other: '✨',
};

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
    if (!confirm('Удалить оффер? Это действие нельзя отменить.')) return;
    deleteOffer(id);
    showToast('Оффер удалён');
    load();
  };

  const handleToggleActive = (id: string) => {
    toggleOfferActive(id);
    load();
  };

  const handleToggleFeatured = (id: string) => {
    toggleOfferFeatured(id);
    load();
  };

  const pending = bookings.filter((b) => b.status === 'pending').length;
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const totalViews = offers.reduce((s, o) => s + o.views, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1
          className="text-3xl font-bold"
          style={{ color: 'var(--text-main)', fontFamily: 'var(--font-playfair, Georgia, serif)' }}
        >
          Мой дашборд
        </h1>
        <Link
          href="/vendor/create"
          className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'var(--gold)' }}
        >
          + Новый оффер
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Офферов', value: offers.length, color: 'var(--text-main)' },
          { label: 'Просмотров', value: totalViews, color: 'var(--gold-dark)' },
          { label: 'Новых заявок', value: pending, color: '#D97706' },
          { label: 'Подтверждено', value: confirmed, color: '#059669' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 text-center" style={{ border: '1px solid var(--border)' }}>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-sub)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Мои офферы</h2>
        {offers.length === 0 ? (
          <div
            className="bg-white rounded-2xl p-10 text-center"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            <p className="text-3xl mb-2">📋</p>
            <p>Офферов пока нет</p>
            <Link href="/vendor/create" className="text-sm mt-2 inline-block hover:underline" style={{ color: 'var(--gold-dark)' }}>
              Создать первый
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => {
              const offerBookings = bookings.filter((b) => b.offerId === offer.id);
              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl p-5 flex items-center gap-4 flex-wrap md:flex-nowrap"
                  style={{ border: '1px solid var(--border)', opacity: offer.isActive ? 1 : 0.6 }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
                    style={{ background: 'var(--gold-light)' }}
                  >
                    {offer.photos[0] ? (
                      <img src={offer.photos[0]} className="w-full h-full object-cover" alt="" />
                    ) : (
                      ICONS[offer.category]
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate" style={{ color: 'var(--text-main)' }}>{offer.title}</p>
                      {offer.featured && (
                        <span
                          className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full text-white"
                          style={{ background: 'var(--gold)' }}
                        >
                          ⭐ Рекомендуем
                        </span>
                      )}
                      {!offer.isActive && (
                        <span
                          className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                          style={{ background: '#F3F4F6', color: 'var(--text-muted)' }}
                        >
                          Скрыт
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {CATEGORY_LABELS[offer.category]} · {offer.city} · {offer.price.toLocaleString('ru-RU')} ₸
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-sub)' }}>
                      👁 {offer.views} · ★ {offer.rating || '—'} ({offer.reviewCount}) · {offerBookings.length} заявок
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 flex-wrap">
                    <button
                      onClick={() => handleToggleFeatured(offer.id)}
                      className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                      style={{
                        border: '1px solid var(--border)',
                        color: offer.featured ? 'var(--gold-dark)' : 'var(--text-muted)',
                        background: offer.featured ? 'var(--gold-light)' : 'white',
                      }}
                      title={offer.featured ? 'Снять пометку' : 'Пометить как рекомендуемый'}
                    >
                      ⭐
                    </button>
                    <button
                      onClick={() => handleToggleActive(offer.id)}
                      className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                      style={{ border: '1px solid var(--border)', color: 'var(--text-sub)' }}
                    >
                      {offer.isActive ? 'Скрыть' : 'Показать'}
                    </button>
                    <Link
                      href={`/offers/${offer.id}`}
                      className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                      style={{ border: '1px solid var(--border)', color: 'var(--text-sub)' }}
                    >
                      Просмотр
                    </Link>
                    <Link
                      href={`/vendor/offers/${offer.id}/edit`}
                      className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                      style={{ border: '1px solid var(--gold)', color: 'var(--gold-dark)' }}
                    >
                      Редактировать
                    </Link>
                    <button
                      onClick={() => handleDelete(offer.id)}
                      className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                      style={{ border: '1px solid #FECACA', color: '#DC2626' }}
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

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: 'var(--text-main)' }}>Последние заявки</h2>
          <Link href="/vendor/leads" className="text-sm hover:underline" style={{ color: 'var(--gold-dark)' }}>
            Все заявки →
          </Link>
        </div>
        {bookings.length === 0 ? (
          <div
            className="bg-white rounded-2xl p-8 text-center"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            <p className="text-3xl mb-2">📩</p>
            <p>Заявок пока нет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-4 flex items-center gap-4"
                style={{ border: '1px solid var(--border)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: 'var(--text-main)' }}>{b.clientName}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {b.offerTitle} · {new Date(b.eventDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <BookingStatusBadge status={b.status} />
                <Link
                  href={`/chat/${b.id}?role=vendor`}
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: '#F3F4F6', color: 'var(--text-sub)' }}
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
