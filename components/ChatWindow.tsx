'use client';

import { useState, useRef, useEffect } from 'react';
import { Booking, MessageSender, Review } from '@/lib/types';
import { addMessage, updateBookingStatus, getBookingById, addReview } from '@/lib/storage';
import { getUser } from '@/lib/auth';
import BookingStatusBadge from './BookingStatusBadge';
import ReviewModal from './ReviewModal';
import { showToast } from './Toast';

type Props = {
  booking: Booking;
  currentSender: MessageSender;
  onUpdate: (booking: Booking) => void;
};

export default function ChatWindow({ booking, currentSender, onUpdate }: Props) {
  const [text, setText] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [booking.messages.length]);

  const refresh = () => {
    const updated = getBookingById(booking.id);
    if (updated) onUpdate(updated);
  };

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    addMessage(booking.id, {
      id: `msg_${Date.now()}`,
      bookingId: booking.id,
      sender: currentSender,
      text: trimmed,
      timestamp: new Date().toISOString(),
    });
    setText('');
    refresh();
  };

  const confirm = () => {
    updateBookingStatus(booking.id, 'confirmed');
    showToast('Бронь подтверждена');
    refresh();
  };

  const reject = () => {
    updateBookingStatus(booking.id, 'rejected');
    showToast('Заявка отклонена');
    refresh();
  };

  const submitReview = (rating: number, reviewText: string) => {
    const u = getUser();
    if (!u) return;
    const review: Review = {
      id: `review_${Date.now()}`,
      offerId: booking.offerId,
      bookingId: booking.id,
      clientId: u.id,
      clientName: u.name,
      rating,
      text: reviewText,
      createdAt: new Date().toISOString(),
    };
    addReview(review);
    setReviewOpen(false);
    showToast('Спасибо за отзыв!');
    refresh();
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  const showReviewCTA =
    currentSender === 'client' && booking.status === 'confirmed' && !booking.hasReview;

  return (
    <div
      className="flex flex-col h-full bg-white rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
    >
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{booking.offerTitle}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {booking.clientName} · {new Date(booking.eventDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      {booking.status === 'confirmed' && (
        <div className="px-5 py-3 text-center" style={{ background: 'var(--gold-light)', borderBottom: '1px solid var(--border)' }}>
          <p className="font-medium text-sm" style={{ color: 'var(--gold-dark)' }}>
            🎉 Вы договорились! Дата: {new Date(booking.eventDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          {showReviewCTA && (
            <button
              onClick={() => setReviewOpen(true)}
              className="mt-2 text-xs font-semibold px-4 py-2 rounded-full text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--gold)' }}
            >
              ★ Оставить отзыв
            </button>
          )}
          {currentSender === 'client' && booking.hasReview && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-sub)' }}>Вы уже оставили отзыв — спасибо!</p>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {booking.messages.length === 0 && (
          <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>
            Начните общение — напишите первое сообщение
          </p>
        )}
        {booking.messages.map((msg) => {
          const isMe = msg.sender === currentSender;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={
                  isMe
                    ? { background: 'var(--gold)', color: 'white', borderBottomRightRadius: 4 }
                    : { background: '#F3F4F6', color: 'var(--text-main)', borderBottomLeftRadius: 4 }
                }
              >
                <p>{msg.text}</p>
                <p
                  className="text-[11px] mt-1"
                  style={{ color: isMe ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)' }}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {currentSender === 'vendor' && booking.status === 'pending' && (
        <div className="px-5 py-3 flex gap-2" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={confirm}
            className="flex-1 text-white text-sm font-semibold py-2 rounded-xl transition-opacity hover:opacity-90"
            style={{ background: 'var(--gold)' }}
          >
            Подтвердить сотрудничество
          </button>
          <button
            onClick={reject}
            className="px-4 text-sm py-2 rounded-xl transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--text-sub)' }}
          >
            Отклонить
          </button>
        </div>
      )}

      {booking.status !== 'rejected' && (
        <div className="px-5 py-3 flex gap-2" style={{ borderTop: '1px solid var(--border)' }}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Написать сообщение..."
            className="flex-1 text-sm rounded-xl px-4 py-2.5 outline-none"
            style={{ border: '1px solid var(--border)' }}
          />
          <button
            onClick={send}
            disabled={!text.trim()}
            className="text-white px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40 text-sm font-semibold"
            style={{ background: 'var(--gold)' }}
          >
            →
          </button>
        </div>
      )}

      <ReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} onSubmit={submitReview} />
    </div>
  );
}
