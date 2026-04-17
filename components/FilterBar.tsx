'use client';

import { Category, City, CATEGORY_LABELS, CITIES, CATEGORIES } from '@/lib/types';

export type SortMode = 'new' | 'price_asc' | 'price_desc' | 'rating';

export type Filters = {
  search: string;
  category: Category | '';
  city: City | '';
  maxPrice: string;
  minCapacity: string;
  minRating: string;
  sort: SortMode;
};

export const DEFAULT_FILTERS: Filters = {
  search: '',
  category: '',
  city: '',
  maxPrice: '',
  minCapacity: '',
  minRating: '',
  sort: 'new',
};

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

export default function FilterBar({ filters, onChange }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  const hasActive =
    filters.search || filters.category || filters.city ||
    filters.maxPrice || filters.minCapacity || filters.minRating ||
    filters.sort !== 'new';

  return (
    <div
      className="bg-white rounded-2xl p-4 space-y-3"
      style={{ border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
    >
      <style>{`.filter-input { border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; background: white; outline: none; font-size: 14px; color: var(--text-main); } .filter-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,169,110,0.15); }`}</style>

      <div className="flex items-center gap-2">
        <span className="text-sm pl-2" style={{ color: 'var(--text-muted)' }}>🔍</span>
        <input
          type="text"
          placeholder="Поиск по названию, описанию, компании..."
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          className="filter-input flex-1"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={filters.category} onChange={(e) => set('category', e.target.value as Category | '')} className="filter-input flex-1 min-w-36">
          <option value="">Все категории</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>

        <select value={filters.city} onChange={(e) => set('city', e.target.value as City | '')} className="filter-input flex-1 min-w-36">
          <option value="">Все города</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <input
          type="number"
          placeholder="Макс. цена (₸)"
          value={filters.maxPrice}
          onChange={(e) => set('maxPrice', e.target.value)}
          className="filter-input flex-1 min-w-32"
        />

        <input
          type="number"
          placeholder="Мин. вместимость"
          value={filters.minCapacity}
          onChange={(e) => set('minCapacity', e.target.value)}
          className="filter-input flex-1 min-w-32"
        />

        <select value={filters.minRating} onChange={(e) => set('minRating', e.target.value)} className="filter-input min-w-32">
          <option value="">Любой рейтинг</option>
          <option value="4">от 4.0 ★</option>
          <option value="4.5">от 4.5 ★</option>
          <option value="4.8">от 4.8 ★</option>
        </select>

        <select value={filters.sort} onChange={(e) => set('sort', e.target.value as SortMode)} className="filter-input min-w-36">
          <option value="new">Сначала новые</option>
          <option value="price_asc">Цена ↑</option>
          <option value="price_desc">Цена ↓</option>
          <option value="rating">По рейтингу</option>
        </select>

        {hasActive && (
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="text-sm px-3 py-2 font-medium"
            style={{ color: 'var(--gold-dark)' }}
          >
            Сбросить
          </button>
        )}
      </div>
    </div>
  );
}
