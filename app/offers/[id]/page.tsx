'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Offer, Review, CATEGORY_LABELS } from '@/lib/types';
import { getOfferById, saveBooking, incrementViews, getOfferReviews } from '@/lib/storage';
import { getUser } from '@/lib/auth';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import FavoriteButton from '@/components/FavoriteButton';
import CharacteristicsView from '@/components/CharacteristicsView';
import SimilarOffers from '@/components/SimilarOffers';
import ReviewCard from '@/components/ReviewCard';
import { showToast } from '@/components/Toast';

const CATEGORY_ICONS: Record<string, string> = {
  venue: '🏛️', catering: '🍽️', music: '🎵',
  photo_video: '📷', decor: '🌸', tamada: '🎤', other: '✨',
};

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [clientName, setClientName] = useState('');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    incrementViews(id);
    const found = getOfferById(id);
    setOffer(found ?? null);
    setReviews(getOfferReviews(id));
    const u = getUser();
    if (u) setClientName(u.name);
  }, [id]);

  if (!offer) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
        <p className="text-4xl mb-3">🔍</p>
        <p>Оффер не найден</p>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!clientName.trim() || !selectedDate) return;
    const user = getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setSubmitting(true);
    const bookingId = `booking_${Date.now()}`;
    saveBooking({
      id: bookingId,
      offerId: offer.id,
      offerTitle: offer.title,
      vendorId: offer.vendorId,
      clientId: user.id,
      clientName: clientName.trim(),
      eventDate: selectedDate,
      status: 'pending',
      messages: [],
      hasReview: false,
      createdAt: new Date().toISOString(),
    });
    router.push(`/chat/${bookingId}?role=client`);
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: offer.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast('Ссылка скопирована');
      }
    } catch {
      /* user cancelled */
    }
  };

  const hasPhotos = offer.photos.length > 0;
  const prevPhoto = () => setPhotoIndex((i) => (i - 1 + offer.photos.length) % offer.photos.length);
  const nextPhoto = () => setPhotoIndex((i) => (i + 1) % offer.photos.length);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div
        className="relative h-[380px] rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ background: 'var(--gold-light)' }}
      >
        {hasPhotos ? (
          <>
            <img src={offer.photos[photoIndex]} alt={offer.title} className="w-full h-full object-cover" />
            {offer.photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--text-main)' }}
                  aria-label="Предыдущее фото"
                >
                  ←
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--text-main)' }}
                  aria-label="Следующее фото"
                >
                  →
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {offer.photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === photoIndex ? 'bg-white' : 'bg-white/50'}`}
                      aria-label={`Фото ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <span className="text-7xl">{CATEGORY_ICONS[offer.category]}</span>
        )}

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
            aria-label="Поделиться"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          <FavoriteButton offerId={offer.id} size="md" />
        </div>

        {offer.featured && (
          <span
            className="absolute top-4 left-4 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full text-white"
            style={{ background: 'var(--gold)' }}
          >
            ⭐ Рекомендуем
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: 'var(--gold-light)', color: 'var(--gold-dark)' }}
              >
                {CATEGORY_LABELS[offer.category]}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{offer.city}</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>·</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>👁 {offer.views}</span>
            </div>
            <h1
              className="text-3xl font-bold mb-2 leading-tight"
              style={{ color: 'var(--text-main)', fontFamily: 'var(--font-playfair, Georgia, serif)' }}
            >
              {offer.title}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-sub)' }}>от {offer.vendorName}</p>
          </div>

          {offer.rating > 0 && (
            <div className="flex items-center gap-2">
              <span style={{ color: '#F59E0B' }}>{'★'.repeat(Math.round(offer.rating))}</span>
              <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{offer.rating}</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>({offer.reviewCount} отзывов)</span>
            </div>
          )}

          <div className="flex gap-8 flex-wrap">
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Стоимость</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--gold-dark)' }}>
                от {offer.price.toLocaleString('ru-RU')} ₸
              </p>
            </div>
            {offer.capacity && (
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Вместимость</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>до {offer.capacity} гостей</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
            <h2 className="font-semibold mb-2" style={{ color: 'var(--text-main)' }}>Описание</h2>
            <p className="leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-sub)' }}>
              {offer.description}
            </p>
          </div>

          {offer.characteristics && Object.keys(offer.characteristics).length > 0 && (
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
              <h2 className="font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Характеристики</h2>
              <CharacteristicsView category={offer.category} characteristics={offer.characteristics} />
            </div>
          )}

          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: 'var(--text-main)' }}>
                Отзывы{reviews.length > 0 && <span className="ml-1" style={{ color: 'var(--text-muted)' }}>({reviews.length})</span>}
              </h2>
            </div>
            {reviews.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Пока нет отзывов</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 space-y-4 sticky top-24" style={{ border: '1px solid var(--border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text-main)' }}>Свободные даты</h2>
            <AvailabilityCalendar
              availableDates={offer.availableDates}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
            />

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full text-white font-semibold py-3 rounded-xl transition-opacity hover:opacity-90"
                style={{ background: 'var(--gold)' }}
              >
                Отправить заявку
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2.5"
                  style={{ border: '1px solid var(--border)' }}
                />
                {selectedDate ? (
                  <p className="text-xs" style={{ color: 'var(--text-sub)' }}>
                    Дата: <span className="font-medium" style={{ color: 'var(--text-main)' }}>
                      {new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </p>
                ) : (
                  <p className="text-xs" style={{ color: '#E53935' }}>Выберите дату в календаре</p>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!clientName.trim() || !selectedDate || submitting}
                  className="w-full text-white font-semibold py-2.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40 text-sm"
                  style={{ background: 'var(--gold)' }}
                >
                  {submitting ? 'Отправляем...' : 'Перейти в чат'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <SimilarOffers offerId={offer.id} category={offer.category} max={4} />
    </div>
  );
}
