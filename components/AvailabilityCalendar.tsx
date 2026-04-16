'use client';

import { useState } from 'react';

type Props = {
  availableDates: string[];
  selectedDate?: string;
  onSelect?: (date: string) => void;
  editable?: boolean;
  onChange?: (dates: string[]) => void;
};

const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const DAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

export default function AvailabilityCalendar({ availableDates, selectedDate, onSelect, editable, onChange }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-based

  const toISO = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const toggleDate = (iso: string) => {
    if (!editable || !onChange) return;
    if (availableDates.includes(iso)) {
      onChange(availableDates.filter(d => d !== iso));
    } else {
      onChange([...availableDates, iso]);
    }
  };

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">‹</button>
        <span className="font-semibold text-gray-800 text-sm">{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">›</button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const iso = toISO(day);
          const isAvailable = availableDates.includes(iso);
          const isSelected = selectedDate === iso;
          const isPast = new Date(iso) < new Date(today.toDateString());

          return (
            <button
              key={i}
              type="button"
              disabled={!editable && (!isAvailable || isPast)}
              onClick={() => {
                if (editable) toggleDate(iso);
                else if (isAvailable && !isPast && onSelect) onSelect(iso);
              }}
              className={`
                w-full aspect-square rounded-lg text-xs font-medium transition-colors
                ${isSelected ? 'bg-rose-600 text-white' : ''}
                ${isAvailable && !isSelected ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : ''}
                ${editable && !isAvailable ? 'text-gray-300 hover:bg-gray-100' : ''}
                ${!editable && !isAvailable ? 'text-gray-200 cursor-default' : ''}
                ${isPast && !editable ? 'opacity-40 cursor-default' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {!editable && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          <span className="inline-block w-3 h-3 rounded-sm bg-rose-100 mr-1 align-middle" />
          Свободные даты
        </p>
      )}
    </div>
  );
}
