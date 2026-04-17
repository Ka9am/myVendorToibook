'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Offer } from '@/lib/types';
import { getFavorites, getOfferById } from '@/lib/storage';
import { getUser, AuthUser } from '@/lib/auth';
import OfferCard from '@/components/OfferCard';

export default function FavoritesPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [ready, setReady] = useState(false);

  const load = (u: AuthUser) => {
    const ids = getFavorites(u.id);
    const list = ids.map((id) => getOfferById(id)).filter((o): o is Offer => !!o);
    setOffers(list);
  };

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push('/login');
      return;
    }
    setUser(u);
    load(u);
    setReady(true);
  }, [router]);

  if (!ready || !user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1
          className="text-3xl font-bold mb-1"
          style={{ color: 'var(--text-main)', fontFamily: 'var(--font-playfair, Georgia, serif)' }}
        >
          Избранное
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
          {offers.length > 0 ? `${offers.length} сохранённых предложений` : 'Вы пока не сохранили ни одного предложения'}
        </p>
      </div>

      {offers.length === 0 ? (
        <div
          className="bg-white rounded-2xl p-12 text-center"
          style={{ border: '1px solid var(--border)' }}
        >
          <p className="text-5xl mb-4">💛</p>
          <p className="font-medium text-lg mb-2" style={{ color: 'var(--text-main)' }}>
            В избранном пусто
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-sub)' }}>
            Нажмите на сердечко в карточке, чтобы сохранить понравившиеся предложения
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: 'var(--gold)' }}
          >
            К каталогу
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} onFavoriteChange={() => load(user)} />
          ))}
        </div>
      )}
    </div>
  );
}
