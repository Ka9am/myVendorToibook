'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { isFavorite, toggleFavorite } from '@/lib/storage';
import { showToast } from './Toast';

type Props = {
  offerId: string;
  size?: 'sm' | 'md';
  onToggle?: (isFav: boolean) => void;
};

export default function FavoriteButton({ offerId, size = 'md', onToggle }: Props) {
  const router = useRouter();
  const [fav, setFav] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u) setFav(isFavorite(u.id, offerId));
    setMounted(true);
  }, [offerId]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const u = getUser();
    if (!u) {
      router.push('/login');
      return;
    }
    const isFav = toggleFavorite(u.id, offerId);
    setFav(isFav);
    showToast(isFav ? 'Добавлено в избранное' : 'Удалено из избранного');
    onToggle?.(isFav);
  };

  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={fav ? 'Удалить из избранного' : 'Добавить в избранное'}
      className={`${dim} rounded-full flex items-center justify-center transition-all active:scale-90`}
      style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}
    >
      <svg
        width={size === 'sm' ? 16 : 20}
        height={size === 'sm' ? 16 : 20}
        viewBox="0 0 24 24"
        fill={mounted && fav ? '#E53935' : 'none'}
        stroke={mounted && fav ? '#E53935' : '#6B6B6B'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
