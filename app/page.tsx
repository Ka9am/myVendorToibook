'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Offer, Category } from '@/lib/types';
import { getActiveOffers } from '@/lib/storage';
import { getUser } from '@/lib/auth';
import OfferCard from '@/components/OfferCard';
import FilterBar, { Filters, DEFAULT_FILTERS } from '@/components/FilterBar';
import CategoryPills from '@/components/CategoryPills';

const PAGE_SIZE = 12;

export default function HomePage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [category, setCategory] = useState<Category | ''>('');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);

  useEffect(() => {
    setOffers(getActiveOffers());
    setUser(getUser());
  }, []);

  useEffect(() => {
    setPage(1);
  }, [category, filters]);

  const filtered = useMemo(() => {
    const activeCat = category || filters.category;
    const q = filters.search.trim().toLowerCase();
    const minR = filters.minRating ? Number(filters.minRating) : 0;

    const result = offers.filter((o) => {
      if (activeCat && o.category !== activeCat) return false;
      if (filters.city && o.city !== filters.city) return false;
      if (filters.maxPrice && o.price > Number(filters.maxPrice)) return false;
      if (filters.minCapacity && (o.capacity ?? 0) < Number(filters.minCapacity)) return false;
      if (minR && o.rating < minR) return false;
      if (q) {
        const hay = `${o.title} ${o.description} ${o.vendorName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const byNew = (a: Offer, b: Offer) => b.createdAt.localeCompare(a.createdAt);

    result.sort((a, b) => {
      if (filters.sort === 'price_asc') return a.price - b.price;
      if (filters.sort === 'price_desc') return b.price - a.price;
      if (filters.sort === 'rating') return b.rating - a.rating;
      return byNew(a, b);
    });

    if (filters.sort === 'new' || filters.sort === 'rating') {
      result.sort((a, b) => {
        if (a.featured === b.featured) {
          if (filters.sort === 'rating') return b.rating - a.rating;
          return byNew(a, b);
        }
        return a.featured ? -1 : 1;
      });
    }

    return result;
  }, [offers, filters, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-8">
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

      <CategoryPills selected={category} onSelect={setCategory} />

      <FilterBar filters={filters} onChange={setFilters} />

      <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
        Найдено: <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{filtered.length}</span> предложений
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium text-lg">Ничего не найдено</p>
          <p className="text-sm mt-1">Попробуйте изменить фильтры</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paged.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
                style={{ border: '1px solid var(--border)', color: 'var(--text-sub)' }}
              >
                ← Назад
              </button>
              <span className="px-4 text-sm" style={{ color: 'var(--text-main)' }}>
                Страница <span className="font-semibold">{page}</span> из {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
                style={{ border: '1px solid var(--border)', color: 'var(--text-sub)' }}
              >
                Вперёд →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
