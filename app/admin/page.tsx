'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { fetchAdminOffers, type AdminOffer } from '@/lib/admin-api';
import type { OfferStatus } from '@/lib/api/types';

type Tab = OfferStatus | 'ALL';

const TABS: { value: Tab; label: string }[] = [
  { value: 'PENDING', label: 'На модерации' },
  { value: 'ACTIVE', label: 'Активные' },
  { value: 'DISABLED', label: 'Отклонённые' },
  { value: 'CREATED', label: 'Черновики' },
  { value: 'ALL', label: 'Все' },
];

const STATUS_STYLE: Record<OfferStatus, { bg: string; color: string; label: string }> = {
  CREATED:  { bg: '#F3F4F6', color: '#4B5563', label: 'Черновик' },
  PENDING:  { bg: '#FEF3C7', color: '#92400E', label: 'На модерации' },
  ACTIVE:   { bg: '#D1FAE5', color: '#065F46', label: 'Активен' },
  DISABLED: { bg: '#FEE2E2', color: '#991B1B', label: 'Отклонён' },
};

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>('PENDING');
  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminOffers(tab === 'ALL' ? undefined : tab);
      setOffers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-3xl font-bold"
          style={{ color: 'var(--text-main)', fontFamily: 'var(--font-playfair, Georgia, serif)' }}
        >
          Модерация офферов
        </h1>
        <button
          onClick={load}
          className="text-sm font-medium px-4 py-2 rounded-lg border hover:bg-white transition"
          style={{ borderColor: 'var(--border)', color: 'var(--text-sub)' }}
        >
          Обновить
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className="px-4 py-2 rounded-full text-sm font-medium transition border"
              style={{
                background: active ? 'var(--gold)' : 'white',
                color: active ? 'white' : 'var(--text-sub)',
                borderColor: active ? 'var(--gold)' : 'var(--border)',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {loading && (
        <p className="text-sm py-10 text-center" style={{ color: 'var(--text-sub)' }}>
          Загрузка…
        </p>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && offers.length === 0 && (
        <div
          className="bg-white border rounded-2xl px-6 py-16 text-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
            В этой категории пусто
          </p>
        </div>
      )}

      {!loading && !error && offers.length > 0 && (
        <div className="grid gap-3">
          {offers.map((o) => {
            const cover = o.images?.find((i) => i.isCover) || o.images?.[0];
            const style = STATUS_STYLE[o.status];
            return (
              <Link
                key={o.id}
                href={`/admin/offers/${o.id}`}
                className="flex gap-4 bg-white border rounded-2xl p-4 hover:shadow-sm transition"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="w-24 h-24 rounded-xl bg-cover bg-center shrink-0"
                  style={{
                    background: cover
                      ? `url(${cover.imageUrl}) center/cover`
                      : 'var(--gold-light)',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3
                      className="text-lg font-semibold truncate"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {o.displayName}
                    </h3>
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {style.label}
                    </span>
                  </div>
                  <p
                    className="text-sm mt-1 line-clamp-2"
                    style={{ color: 'var(--text-sub)' }}
                  >
                    {o.description}
                  </p>
                  <div
                    className="flex flex-wrap gap-3 mt-2 text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span>#{o.id}</span>
                    <span>•</span>
                    <span>{o.vendorType === 'VENUE' ? 'Площадка' : 'Услуга'}</span>
                    <span>•</span>
                    <span>{o.city === 'ALMATY' ? 'Алматы' : 'Астана'}</span>
                    <span>•</span>
                    <span>vendor #{o.vendorId}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
