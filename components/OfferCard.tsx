import Link from 'next/link';
import { Offer, CATEGORY_LABELS } from '@/lib/types';

const CATEGORY_ICONS: Record<string, string> = {
  venue: '🏛️', catering: '🍽️', music: '🎵',
  photo_video: '📷', decor: '🌸', tamada: '🎤', other: '✨',
};

type Props = { offer: Offer };

export default function OfferCard({ offer }: Props) {
  const icon = CATEGORY_ICONS[offer.category] ?? '✨';
  const hasPhoto = offer.photos.length > 0;

  return (
    <Link href={`/offers/${offer.id}`} className="group block">
      <div
        className="bg-white rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          border: '1px solid var(--border)',
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)')}
      >
        {/* Photo */}
        <div className="relative h-48 flex items-center justify-center" style={{ background: 'var(--gold-light)' }}>
          {hasPhoto ? (
            <img src={offer.photos[0]} alt={offer.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl">{icon}</span>
          )}
          <span
            className="absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--gold-dark)' }}
          >
            {CATEGORY_LABELS[offer.category]}
          </span>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{offer.city} · {offer.vendorName}</p>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-3" style={{ color: 'var(--text-main)' }}>
            {offer.title}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--gold-dark)' }}>
                от {offer.price.toLocaleString('ru-RU')} ₸
              </p>
              {offer.capacity && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>до {offer.capacity} гостей</p>
              )}
            </div>
            {offer.rating && (
              <div className="flex items-center gap-1">
                <span className="text-amber-400 text-sm">★</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{offer.rating}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({offer.reviewCount})</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
