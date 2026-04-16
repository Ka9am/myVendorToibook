'use client';

import { Category, CATEGORY_LABELS } from '@/lib/types';

const ITEMS: { value: Category | ''; icon: string; label: string }[] = [
  { value: '', icon: '✨', label: 'Все' },
  { value: 'venue', icon: '🏛️', label: 'Площадки' },
  { value: 'tamada', icon: '🎤', label: 'Тамада' },
  { value: 'photo_video', icon: '📷', label: 'Фото/Видео' },
  { value: 'decor', icon: '🌸', label: 'Декор' },
  { value: 'music', icon: '🎵', label: 'Музыка' },
  { value: 'catering', icon: '🍽️', label: 'Кейтеринг' },
  { value: 'other', icon: '🎊', label: 'Другое' },
];

type Props = {
  selected: Category | '';
  onSelect: (cat: Category | '') => void;
};

export default function CategoryPills({ selected, onSelect }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {ITEMS.map((item) => {
        const isActive = selected === item.value;
        return (
          <button
            key={item.value}
            onClick={() => onSelect(item.value as Category | '')}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 px-4 py-3 rounded-2xl border-2 transition-all duration-200"
            style={{
              borderColor: isActive ? 'var(--gold)' : 'var(--border)',
              background: isActive ? 'var(--gold-light)' : 'white',
              color: isActive ? 'var(--gold-dark)' : 'var(--text-sub)',
            }}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
