'use client';

import { useEffect, useState } from 'react';
import { Offer, Category } from '@/lib/types';
import { getActiveOffers } from '@/lib/storage';
import OfferCard from './OfferCard';

type Props = {
  offerId: string;
  category: Category;
  max?: number;
};

export default function SimilarOffers({ offerId, category, max = 4 }: Props) {
  const [items, setItems] = useState<Offer[]>([]);

  useEffect(() => {
    const pool = getActiveOffers().filter((o) => o.category === category && o.id !== offerId);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, max);
    setItems(shuffled);
  }, [offerId, category, max]);

  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2
        className="text-xl font-semibold"
        style={{ color: 'var(--text-main)', fontFamily: 'var(--font-playfair, Georgia, serif)' }}
      >
        Похожие предложения
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </section>
  );
}
