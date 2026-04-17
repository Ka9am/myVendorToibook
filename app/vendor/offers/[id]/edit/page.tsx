'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Offer } from '@/lib/types';
import { getOfferById, saveOffer, getVendorId } from '@/lib/storage';
import AuthGuard from '@/components/AuthGuard';
import OfferForm, { OfferFormData } from '@/components/OfferForm';
import { showToast } from '@/components/Toast';

function EditContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const found = getOfferById(id);
    if (!found) {
      setReady(true);
      return;
    }
    if (found.vendorId !== getVendorId()) {
      setForbidden(true);
    } else {
      setOffer(found);
    }
    setReady(true);
  }, [id]);

  if (!ready) return null;

  if (forbidden) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
        <p className="text-4xl mb-3">🔒</p>
        <p>Этот оффер принадлежит другому вендору</p>
        <Link href="/vendor/dashboard" className="text-sm mt-2 inline-block hover:underline" style={{ color: 'var(--gold-dark)' }}>
          К моим офферам
        </Link>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
        <p className="text-4xl mb-3">🔍</p>
        <p>Оффер не найден</p>
      </div>
    );
  }

  const handleSubmit = (data: OfferFormData) => {
    saveOffer({
      ...offer,
      vendorName: data.vendorName,
      title: data.title,
      description: data.description,
      category: data.category,
      city: data.city,
      price: data.price,
      capacity: data.capacity,
      photos: data.photos,
      availableDates: data.availableDates,
      characteristics: data.characteristics,
    });
    showToast('Изменения сохранены');
    router.push('/vendor/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1
        className="text-3xl font-bold mb-6"
        style={{ color: 'var(--text-main)', fontFamily: 'var(--font-playfair, Georgia, serif)' }}
      >
        Редактировать оффер
      </h1>
      <OfferForm
        initial={{
          vendorName: offer.vendorName,
          title: offer.title,
          description: offer.description,
          category: offer.category,
          city: offer.city,
          price: offer.price,
          capacity: offer.capacity,
          photos: offer.photos,
          availableDates: offer.availableDates,
          characteristics: offer.characteristics,
        }}
        submitLabel="Сохранить изменения"
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}

export default function EditOfferPage() {
  return (
    <AuthGuard role="vendor">
      <EditContent />
    </AuthGuard>
  );
}
