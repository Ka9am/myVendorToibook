'use client';

import { useRouter } from 'next/navigation';
import { Offer } from '@/lib/types';
import { saveOffer, getVendorId } from '@/lib/storage';
import AuthGuard from '@/components/AuthGuard';
import OfferForm, { OfferFormData } from '@/components/OfferForm';
import { showToast } from '@/components/Toast';

function CreateContent() {
  const router = useRouter();

  const handleSubmit = (data: OfferFormData) => {
    const offer: Offer = {
      id: `offer_${Date.now()}`,
      vendorId: getVendorId(),
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
      rating: 0,
      reviewCount: 0,
      views: 0,
      featured: false,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    saveOffer(offer);
    showToast('Оффер опубликован');
    router.push('/vendor/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1
        className="text-3xl font-bold mb-6"
        style={{ color: 'var(--text-main)', fontFamily: 'var(--font-playfair, Georgia, serif)' }}
      >
        Создать оффер
      </h1>
      <OfferForm
        submitLabel="Опубликовать оффер"
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}

export default function CreateOfferPage() {
  return (
    <AuthGuard role="vendor">
      <CreateContent />
    </AuthGuard>
  );
}
