'use client';

import { useState } from 'react';
import { Category, City, CATEGORY_LABELS, CITIES, CATEGORIES, CharValue } from '@/lib/types';
import ImageUpload from './ImageUpload';
import AvailabilityCalendar from './AvailabilityCalendar';
import CharacteristicsForm from './CharacteristicsForm';

export type OfferFormData = {
  vendorName: string;
  title: string;
  description: string;
  category: Category;
  city: City;
  price: number;
  capacity?: number;
  photos: string[];
  availableDates: string[];
  characteristics: Record<string, CharValue>;
};

type Props = {
  initial?: Partial<OfferFormData>;
  submitLabel: string;
  onSubmit: (data: OfferFormData) => void;
  onCancel?: () => void;
};

export default function OfferForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    vendorName: initial?.vendorName ?? '',
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    category: (initial?.category ?? '') as Category | '',
    city: (initial?.city ?? '') as City | '',
    price: initial?.price ? String(initial.price) : '',
    capacity: initial?.capacity ? String(initial.capacity) : '',
  });
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [availableDates, setAvailableDates] = useState<string[]>(initial?.availableDates ?? []);
  const [chars, setChars] = useState<Record<string, CharValue>>(initial?.characteristics ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.vendorName.trim()) errs.vendorName = 'Введите название компании';
    if (!form.title.trim()) errs.title = 'Введите название';
    if (!form.description.trim()) errs.description = 'Введите описание';
    if (!form.category) errs.category = 'Выберите категорию';
    if (!form.city) errs.city = 'Выберите город';
    if (!form.price || Number(form.price) <= 0) errs.price = 'Введите корректную цену';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    onSubmit({
      vendorName: form.vendorName.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category as Category,
      city: form.city as City,
      price: Number(form.price),
      capacity: form.capacity ? Number(form.capacity) : undefined,
      photos,
      availableDates,
      characteristics: chars,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="bg-white rounded-2xl p-6 space-y-5" style={{ border: '1px solid var(--border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--text-main)' }}>Основная информация</h2>

        <Field label="Название компании / бренда" error={errors.vendorName}>
          <input
            value={form.vendorName}
            onChange={(e) => set('vendorName', e.target.value)}
            placeholder="Например: Сарай Банкет Холл"
            className="form-input"
          />
        </Field>

        <Field label="Название оффера" error={errors.title}>
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Например: Банкетный зал на 300 гостей"
            className="form-input"
          />
        </Field>

        <Field label="Описание" error={errors.description}>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
            placeholder="Расскажите подробнее об услуге..."
            className="form-input resize-none"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Категория" error={errors.category}>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value as Category | '')}
              className="form-input bg-white"
            >
              <option value="">Выберите...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </Field>

          <Field label="Город" error={errors.city}>
            <select
              value={form.city}
              onChange={(e) => set('city', e.target.value as City | '')}
              className="form-input bg-white"
            >
              <option value="">Выберите...</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Цена (₸)" error={errors.price}>
            <input
              type="number"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="150000"
              className="form-input"
            />
          </Field>
          <Field label="Вместимость гостей">
            <input
              type="number"
              value={form.capacity}
              onChange={(e) => set('capacity', e.target.value)}
              placeholder="Необязательно"
              className="form-input"
            />
          </Field>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6 space-y-4" style={{ border: '1px solid var(--border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--text-main)' }}>Фотографии</h2>
        <ImageUpload photos={photos} onChange={setPhotos} maxPhotos={10} />
      </section>

      <section className="bg-white rounded-2xl p-6 space-y-4" style={{ border: '1px solid var(--border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--text-main)' }}>Доступные даты</h2>
        <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
          Нажмите на даты чтобы отметить когда вы свободны
        </p>
        <AvailabilityCalendar availableDates={availableDates} editable onChange={setAvailableDates} />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Выбрано дат: {availableDates.length}
        </p>
      </section>

      {form.category && (
        <section className="bg-white rounded-2xl p-6 space-y-4" style={{ border: '1px solid var(--border)' }}>
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--text-main)' }}>Характеристики</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-sub)' }}>
              Дополнительные параметры для категории «{CATEGORY_LABELS[form.category as Category]}»
            </p>
          </div>
          <CharacteristicsForm category={form.category as Category} value={chars} onChange={setChars} />
        </section>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--text-sub)' }}
          >
            Отмена
          </button>
        )}
        <button
          type="submit"
          className="flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'var(--gold)' }}
        >
          {submitLabel}
        </button>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          background: white;
          color: var(--text-main);
          transition: border-color 0.15s;
        }
        .form-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(201,169,110,0.15);
        }
      `}</style>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
    </div>
  );
}
