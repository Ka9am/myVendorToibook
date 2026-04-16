'use client';

import { Category, City, CATEGORY_LABELS, CITIES, CATEGORIES } from '@/lib/types';

export type Filters = {
  category: Category | '';
  city: City | '';
  maxPrice: string;
  minCapacity: string;
};

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

export default function FilterBar({ filters, onChange }: Props) {
  const set = (key: keyof Filters, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="bg-white rounded-2xl p-4 flex flex-wrap gap-3" style={{ border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <style>{`.filter-input { text-size: 14px; border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; background: white; outline: none; font-size: 14px; color: var(--text-main); } .filter-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,169,110,0.15); }`}</style>
      {/* Category */}
      <select
        value={filters.category}
        onChange={(e) => set('category', e.target.value)}
        className="filter-input flex-1 min-w-36"
      >
        <option value="">Все категории</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
        ))}
      </select>

      <select
        value={filters.city}
        onChange={(e) => set('city', e.target.value)}
        className="filter-input flex-1 min-w-36"
      >
        <option value="">Все города</option>
        {CITIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Макс. цена (₸)"
        value={filters.maxPrice}
        onChange={(e) => set('maxPrice', e.target.value)}
        className="filter-input flex-1 min-w-36"
      />

      <input
        type="number"
        placeholder="Мин. вместимость"
        value={filters.minCapacity}
        onChange={(e) => set('minCapacity', e.target.value)}
        className="filter-input flex-1 min-w-36"
      />

      {(filters.category || filters.city || filters.maxPrice || filters.minCapacity) && (
        <button
          onClick={() => onChange({ category: '', city: '', maxPrice: '', minCapacity: '' })}
          className="text-sm px-3 py-2 font-medium"
          style={{ color: 'var(--gold-dark)' }}
        >
          Сбросить
        </button>
      )}
    </div>
  );
}
