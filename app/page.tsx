'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Offer, Category } from '@/lib/types';
import { getOffers } from '@/lib/storage';
import { getUser } from '@/lib/auth';
import OfferCard from '@/components/OfferCard';
import FilterBar, { Filters } from '@/components/FilterBar';
import CategoryPills from '@/components/CategoryPills';

export default function HomePage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [category, setCategory] = useState<Category | ''>('');
  const [filters, setFilters] = useState<Filters>({ category: '', city: '', maxPrice: '', minCapacity: '' });
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);

  useEffect(() => {
    setOffers(getOffers());
    setUser(getUser());
  }, []);

  const filtered = useMemo(() => {
    const activeCat = category || filters.category;
    return offers.filter((o) => {
      if (activeCat && o.category !== activeCat) return false;
      if (filters.city && o.city !== filters.city) return false;
      if (filters.maxPrice && o.price > Number(filters.maxPrice)) return false;
      if (filters.minCapacity && (o.capacity ?? 0) < Number(filters.minCapacity)) return false;
      return true;
    });
  }, [offers, filters, category]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div
        className="rounded-3xl px-8 py-14 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #FDF3E3 0%, #FDF8F0 60%, #FAF0DC 100%)' }}
      >
        <p className="text-sm font-medium mb-3 tracking-widest uppercase" style={{ color: 'var(--gold)' }}>
          Маркетплейс вендоров · Казахстан
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ color: 'var(--text-main)' }}>
          Найдите лучших вендоров<br />для вашего торжества
        </h1>
        <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-sub)' }}>
          Площадки, тамады, фотографы, декор, музыка и кейтеринг — всё в одном месте по всему Казахстану
        </p>
        {!user && (
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: 'var(--gold)' }}
            >
              Найти вендора
            </Link>
            <Link
              href="/register?role=vendor"
              className="px-6 py-3 rounded-xl font-semibold text-sm border-2 transition-colors hover:bg-white"
              style={{ borderColor: 'var(--gold)', color: 'var(--gold-dark)' }}
            >
              Стать вендором
            </Link>
          </div>
        )}
      </div>

      {/* Category pills */}
      <CategoryPills selected={category} onSelect={setCategory} />

      {/* Filters */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Count */}
      <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
        Найдено: <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{filtered.length}</span> предложений
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium text-lg">Ничего не найдено</p>
          <p className="text-sm mt-1">Попробуйте изменить фильтры</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}
