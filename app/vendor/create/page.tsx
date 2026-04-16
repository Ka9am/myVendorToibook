'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category, City, CATEGORY_LABELS, CITIES, CATEGORIES, Offer } from '@/lib/types';
import { saveOffer, getVendorId } from '@/lib/storage';
import ImageUpload from '@/components/ImageUpload';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';

export default function CreateOfferPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '' as Category | '',
    city: '' as City | '',
    price: '',
    capacity: '',
    vendorName: '',
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Введите название';
    if (!form.description.trim()) e.description = 'Введите описание';
    if (!form.category) e.category = 'Выберите категорию';
    if (!form.city) e.city = 'Выберите город';
    if (!form.price || Number(form.price) <= 0) e.price = 'Введите корректную цену';
    if (!form.vendorName.trim()) e.vendorName = 'Введите название компании';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    const offer: Offer = {
      id: `offer_${Date.now()}`,
      vendorId: getVendorId(),
      vendorName: form.vendorName.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category as Category,
      city: form.city as City,
      price: Number(form.price),
      capacity: form.capacity ? Number(form.capacity) : undefined,
      photos,
      availableDates,
      createdAt: new Date().toISOString(),
    };

    saveOffer(offer);
    router.push('/vendor/dashboard');
  };

  const field = (label: string, key: keyof typeof form, props?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        {...props}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-300"
      />
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Создать оффер</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Основная информация</h2>

          {field('Название компании / бренда', 'vendorName', { placeholder: 'Например: Сарай Банкет Холл' })}
          {field('Название оффера', 'title', { placeholder: 'Например: Банкетный зал на 300 гостей' })}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              placeholder="Расскажите подробнее об услуге..."
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <option value="">Выберите...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
              <select
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <option value="">Выберите...</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('Цена (₸)', 'price', { type: 'number', placeholder: '150000' })}
            {field('Вместимость (гостей)', 'capacity', { type: 'number', placeholder: 'Необязательно' })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Фотографии</h2>
          <ImageUpload photos={photos} onChange={setPhotos} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Доступные даты</h2>
          <p className="text-sm text-gray-500">Нажмите на даты чтобы отметить когда вы свободны</p>
          <AvailabilityCalendar
            availableDates={availableDates}
            editable
            onChange={setAvailableDates}
          />
          <p className="text-xs text-gray-400">Выбрано дат: {availableDates.length}</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-medium py-3 rounded-xl transition-colors"
          >
            {saving ? 'Сохраняем...' : 'Опубликовать оффер'}
          </button>
        </div>
      </form>
    </div>
  );
}
