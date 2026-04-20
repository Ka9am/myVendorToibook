'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  fetchAdminOffer, approveOffer, rejectOffer, type AdminOfferDetail,
} from '@/lib/admin-api';
import type { OfferStatus } from '@/lib/api/types';

const STATUS_STYLE: Record<OfferStatus, { bg: string; color: string; label: string }> = {
  CREATED:  { bg: '#F3F4F6', color: '#4B5563', label: 'Черновик' },
  PENDING:  { bg: '#FEF3C7', color: '#92400E', label: 'На модерации' },
  ACTIVE:   { bg: '#D1FAE5', color: '#065F46', label: 'Активен' },
  DISABLED: { bg: '#FEE2E2', color: '#991B1B', label: 'Отклонён' },
};

const VENUE_LABEL: Record<string, string> = {
  RESTAURANT: 'Ресторан', BAR: 'Бар', LOFT: 'Лофт',
};
const SERVICE_LABEL: Record<string, string> = {
  PHOTOGRAPHER: 'Фотограф', FLORIST: 'Флорист', DJ: 'DJ', HOST: 'Ведущий',
};

export default function AdminOfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idRaw } = use(params);
  const id = Number(idRaw);
  const router = useRouter();

  const [offer, setOffer] = useState<AdminOfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminOffer(id);
      setOffer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async () => {
    if (!confirm('Одобрить оффер и опубликовать его в каталоге?')) return;
    setSubmitting(true);
    try {
      await approveOffer(id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) { alert('Укажите причину отклонения'); return; }
    setSubmitting(true);
    try {
      await rejectOffer(id, reason.trim());
      setRejectMode(false);
      setReason('');
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="py-10 text-center text-sm" style={{ color: 'var(--text-sub)' }}>Загрузка…</p>;
  }
  if (error || !offer) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
        {error || 'Оффер не найден'}
        <button onClick={() => router.push('/admin')} className="ml-3 underline">Назад</button>
      </div>
    );
  }

  const style = STATUS_STYLE[offer.status];
  const typeLabel = offer.vendorType === 'VENUE'
    ? (offer.venueType ? VENUE_LABEL[offer.venueType] : 'Площадка')
    : (offer.serviceType ? SERVICE_LABEL[offer.serviceType] : 'Услуга');
  const canModerate = offer.status === 'PENDING';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-sm hover:underline" style={{ color: 'var(--text-sub)' }}>
          ← К списку
        </Link>
      </div>

      <div
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: 'var(--border)' }}
      >
        {offer.images?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 bg-gray-50">
            {offer.images.slice(0, 6).map((img, i) => (
              <div
                key={i}
                className="aspect-[4/3] bg-cover bg-center"
                style={{ background: `url(${img.imageUrl}) center/cover` }}
              />
            ))}
          </div>
        )}

        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1
                className="text-3xl font-bold"
                style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', color: 'var(--text-main)' }}
              >
                {offer.displayName}
              </h1>
              <div
                className="flex flex-wrap gap-2 mt-2 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>#{offer.id}</span>
                <span>•</span>
                <span>{typeLabel}</span>
                <span>•</span>
                <span>{offer.city === 'ALMATY' ? 'Алматы' : 'Астана'}</span>
                <span>•</span>
                <span>создан {new Date(offer.createdAt).toLocaleString('ru-RU')}</span>
              </div>
            </div>
            <span
              className="text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap"
              style={{ background: style.bg, color: style.color }}
            >
              {style.label}
            </span>
          </div>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-sub)' }}>
              Описание
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-main)' }}>
              {offer.description}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-sub)' }}>
              Вендор
            </h2>
            {offer.vendor ? (
              <div className="text-sm" style={{ color: 'var(--text-main)' }}>
                <div className="font-medium">{offer.vendor.name} {offer.vendor.surname}</div>
                <div style={{ color: 'var(--text-sub)' }}>{offer.vendor.email}</div>
              </div>
            ) : (
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Вендор #{offer.vendorId} не найден
              </div>
            )}
          </section>

          {offer.detailsResponses?.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-sub)' }}>
                Контакты
              </h2>
              <div className="space-y-1 text-sm">
                {offer.detailsResponses.flatMap((d) =>
                  d.data.map((c, i) => (
                    <div key={`${d.id}-${i}`} className="flex gap-3">
                      <span className="w-24 shrink-0" style={{ color: 'var(--text-sub)' }}>
                        {c.contactType}
                      </span>
                      <span style={{ color: 'var(--text-main)' }}>{c.contactInfo}</span>
                    </div>
                  )),
                )}
              </div>
            </section>
          )}

          {offer.rejectionReason && (
            <section className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-red-800 mb-1">
                Причина отклонения
              </div>
              <p className="text-sm text-red-900">{offer.rejectionReason}</p>
            </section>
          )}
        </div>
      </div>

      {canModerate && !rejectMode && (
        <div
          className="bg-white rounded-2xl border p-5 flex flex-wrap gap-3 justify-end sticky bottom-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => setRejectMode(true)}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl border font-medium text-sm transition disabled:opacity-60"
            style={{ borderColor: '#FCA5A5', color: '#B91C1C', background: 'white' }}
          >
            Отклонить
          </button>
          <button
            onClick={handleApprove}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl text-white font-medium text-sm transition disabled:opacity-60"
            style={{ background: 'var(--gold)' }}
          >
            {submitting ? 'Сохраняем…' : 'Одобрить'}
          </button>
        </div>
      )}

      {canModerate && rejectMode && (
        <div
          className="bg-white rounded-2xl border p-5 space-y-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <label className="block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
            Причина отклонения
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Например: некорректные фотографии или описание"
            className="w-full border rounded-xl px-3 py-2 text-sm outline-none"
            style={{ borderColor: 'var(--border)' }}
          />
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => { setRejectMode(false); setReason(''); }}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border font-medium text-sm"
              style={{ borderColor: 'var(--border)', color: 'var(--text-sub)' }}
            >
              Отмена
            </button>
            <button
              onClick={handleReject}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-white font-medium text-sm transition disabled:opacity-60"
              style={{ background: '#DC2626' }}
            >
              {submitting ? 'Сохраняем…' : 'Отклонить оффер'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
