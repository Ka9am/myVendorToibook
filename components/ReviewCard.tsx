import { Review } from '@/lib/types';

type Props = { review: Review };

export default function ReviewCard({ review }: Props) {
  const initials = review.clientName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className="bg-white rounded-2xl p-5"
      style={{ border: '1px solid var(--border)' }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
          style={{ background: 'var(--gold)' }}
        >
          {initials || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
            {review.clientName}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {new Date(review.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex-shrink-0 text-sm">
          <span style={{ color: '#F59E0B' }}>{'★'.repeat(review.rating)}</span>
          <span style={{ color: 'var(--border)' }}>{'★'.repeat(5 - review.rating)}</span>
        </div>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-main)' }}>
        {review.text}
      </p>
    </div>
  );
}
