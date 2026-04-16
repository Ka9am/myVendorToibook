'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Offer } from '@/lib/types';
import { getOfferById, saveBooking } from '@/lib/storage';
import { CATEGORY_LABELS } from '@/lib/types';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [clientName, setClientName] = useState('');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const found = getOfferById(id);
    setOffer(found ?? null);
  }, [id]);

  if (!offer) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-4xl mb-3">🔍</p>
        <p>Оффер не найден</p>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!clientName.trim() || !selectedDate) return;
    setSubmitting(true);

    const bookingId = `booking_${Date.now()}`;
    saveBooking({
      id: bookingId,
      offerId: offer.id,
      offerTitle: offer.title,
      vendorId: offer.vendorId,
      clientName: clientName.trim(),
      eventDate: selectedDate,
      status: 'pending',
      messages: [],
      createdAt: new Date().toISOString(),
    });

    router.push(`/chat/${bookingId}?role=client`);
  };

  const hasPhotos = offer.photos.length > 0;
  const CATEGORY_ICONS: Record<string, string> = {
    venue: '🏛️', catering: '🍽️', music: '🎵',
    photo_video: '📷', decor: '🌸', tamada: '🎤', other: '✨',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Photo gallery */}
      <div className="relative h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        {hasPhotos ? (
          <>
            <img
              src={offer.photos[photoIndex]}
              alt={offer.title}
              className="w-full h-full object-cover"
            />
            {offer.photos.length > 1 && (
              <div className="absolute bottom-4 flex gap-2">
                {offer.photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === photoIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <span className="text-7xl">{CATEGORY_ICONS[offer.category]}</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full font-medium">
                {CATEGORY_LABELS[offer.category]}
              </span>
              <span className="text-sm text-gray-400">{offer.city}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{offer.title}</h1>
            <p className="text-sm text-gray-500">от {offer.vendorName}</p>
          </div>

          {offer.rating && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">★★★★★</span>
              <span className="font-semibold text-gray-800">{offer.rating}</span>
              <span className="text-gray-400 text-sm">({offer.reviewCount} отзывов)</span>
            </div>
          )}

          <div className="flex gap-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">Стоимость</p>
              <p className="text-xl font-bold text-rose-600">
                от {offer.price.toLocaleString('ru-RU')} ₸
              </p>
            </div>
            {offer.capacity && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Вместимость</p>
                <p className="text-xl font-bold text-gray-900">до {offer.capacity} гостей</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-900 mb-2">Описание</h2>
            <p className="text-gray-600 leading-relaxed">{offer.description}</p>
          </div>
        </div>

        {/* Right: calendar + booking */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Свободные даты</h2>
          <AvailabilityCalendar
            availableDates={offer.availableDates}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
          />

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Отправить заявку
            </button>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm">Ваши данные</h3>
              <input
                type="text"
                placeholder="Ваше имя"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
              {selectedDate && (
                <p className="text-xs text-gray-500">
                  Дата: <span className="font-medium text-gray-800">
                    {new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </p>
              )}
              {!selectedDate && (
                <p className="text-xs text-rose-500">Выберите дату в календаре</p>
              )}
              <button
                onClick={handleSubmit}
                disabled={!clientName.trim() || !selectedDate || submitting}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                {submitting ? 'Отправляем...' : 'Перейти в чат'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
