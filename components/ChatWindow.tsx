'use client';

import { useState, useRef, useEffect } from 'react';
import { Booking, MessageSender } from '@/lib/types';
import { addMessage, updateBookingStatus, getBookingById } from '@/lib/storage';
import BookingStatusBadge from './BookingStatusBadge';

type Props = {
  booking: Booking;
  currentSender: MessageSender;
  onUpdate: (booking: Booking) => void;
};

export default function ChatWindow({ booking, currentSender, onUpdate }: Props) {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [booking.messages.length]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const msg = {
      id: `msg_${Date.now()}`,
      bookingId: booking.id,
      sender: currentSender,
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    addMessage(booking.id, msg);
    setText('');
    const updated = getBookingById(booking.id);
    if (updated) onUpdate(updated);
  };

  const confirm = () => {
    updateBookingStatus(booking.id, 'confirmed');
    const updated = getBookingById(booking.id);
    if (updated) onUpdate(updated);
  };

  const reject = () => {
    updateBookingStatus(booking.id, 'rejected');
    const updated = getBookingById(booking.id);
    if (updated) onUpdate(updated);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{booking.offerTitle}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {booking.clientName} · {new Date(booking.eventDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      {/* Confirmed banner */}
      {booking.status === 'confirmed' && (
        <div className="bg-green-50 border-b border-green-100 px-5 py-3 text-center">
          <p className="text-green-700 font-medium text-sm">
            🎉 Вы договорились! Дата мероприятия: {new Date(booking.eventDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {booking.messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">
            Начните общение — напишите первое сообщение
          </p>
        )}
        {booking.messages.map((msg) => {
          const isMe = msg.sender === currentSender;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-rose-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-rose-200' : 'text-gray-400'}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Vendor actions */}
      {currentSender === 'vendor' && booking.status === 'pending' && (
        <div className="px-5 py-3 border-t border-gray-100 flex gap-2">
          <button
            onClick={confirm}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-xl transition-colors"
          >
            Подтвердить сотрудничество
          </button>
          <button
            onClick={reject}
            className="px-4 text-sm text-gray-500 hover:text-red-500 border border-gray-200 rounded-xl transition-colors"
          >
            Отклонить
          </button>
        </div>
      )}

      {/* Input */}
      {booking.status !== 'rejected' && (
        <div className="px-5 py-3 border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Написать сообщение..."
            className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <button
            onClick={send}
            disabled={!text.trim()}
            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl transition-colors text-sm font-medium"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
