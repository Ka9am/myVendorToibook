'use client';

import { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, text: string) => void;
};

export default function ReviewModal({ open, onClose, onSubmit }: Props) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');

  if (!open) return null;

  const handleSubmit = () => {
    if (rating < 1 || !text.trim()) return;
    onSubmit(rating, text.trim());
    setRating(5);
    setText('');
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5"
        style={{ border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
            Оставить отзыв
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-sub)' }}>
            Поделитесь впечатлением — это поможет другим клиентам
          </p>
        </div>

        <div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
            Оценка
          </p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => {
              const active = (hover || rating) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  className="text-3xl transition-transform active:scale-90"
                  style={{ color: active ? '#F59E0B' : '#E5E7EB' }}
                  aria-label={`${n} звёзд`}
                >
                  ★
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
            Отзыв
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Что понравилось, что можно улучшить..."
            className="w-full text-sm rounded-xl px-3 py-2.5 bg-white resize-none"
            style={{ border: '1px solid var(--border)' }}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--text-sub)' }}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || rating < 1}
            className="flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{ background: 'var(--gold)' }}
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}
