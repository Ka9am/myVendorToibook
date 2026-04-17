import { Category, CHAR_SCHEMAS, CharValue } from '@/lib/types';

type Props = {
  category: Category;
  characteristics: Record<string, CharValue>;
};

function formatValue(value: CharValue, unit?: string): string {
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'number' && unit) return `${value} ${unit}`;
  return String(value);
}

export default function CharacteristicsView({ category, characteristics }: Props) {
  const schema = CHAR_SCHEMAS[category] ?? [];
  const rows = schema
    .map((field) => ({ field, value: characteristics[field.key] }))
    .filter((r) => r.value !== undefined && r.value !== '' && !(Array.isArray(r.value) && r.value.length === 0));

  if (rows.length === 0) return null;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      <table className="w-full text-sm">
        <tbody>
          {rows.map(({ field, value }, i) => (
            <tr key={field.key} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
              <td className="px-4 py-3 w-1/2" style={{ color: 'var(--text-sub)' }}>
                {field.label}
              </td>
              <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-main)' }}>
                {formatValue(value!, field.unit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
