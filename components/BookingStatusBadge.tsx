import { BookingStatus } from '@/lib/types';

const CONFIG: Record<BookingStatus, { label: string; bg: string; color: string }> = {
  pending:   { label: 'Ожидает ответа', bg: '#FEF9C3', color: '#854D0E' },
  confirmed: { label: 'Договорились ✓', bg: '#DCFCE7', color: '#166534' },
  rejected:  { label: 'Отклонено',      bg: '#FEE2E2', color: '#991B1B' },
};

export default function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { label, bg, color } = CONFIG[status];
  return (
    <span
      className="inline-block text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}
