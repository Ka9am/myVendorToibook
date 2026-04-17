'use client';

import { Category, CHAR_SCHEMAS, CharValue } from '@/lib/types';

type Props = {
  category: Category;
  value: Record<string, CharValue>;
  onChange: (next: Record<string, CharValue>) => void;
};

export default function CharacteristicsForm({ category, value, onChange }: Props) {
  const schema = CHAR_SCHEMAS[category] ?? [];
  if (schema.length === 0) return null;

  const set = (key: string, v: CharValue) => onChange({ ...value, [key]: v });

  return (
    <div className="space-y-4">
      {schema.map((field) => {
        const current = value[field.key];

        if (field.type === 'boolean') {
          const checked = current === true;
          return (
            <label key={field.key} className="flex items-center gap-3 cursor-pointer select-none">
              <span
                className="w-10 h-6 rounded-full relative transition-colors"
                style={{ background: checked ? 'var(--gold)' : '#E5E7EB' }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
                />
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={(e) => set(field.key, e.target.checked)}
              />
              <span className="text-sm" style={{ color: 'var(--text-main)' }}>
                {field.label}
              </span>
            </label>
          );
        }

        if (field.type === 'number') {
          const val = typeof current === 'number' ? String(current) : '';
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                {field.label} {field.unit && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({field.unit})</span>}
              </label>
              <input
                type="number"
                value={val}
                onChange={(e) => {
                  const n = e.target.value;
                  if (n === '') {
                    const { [field.key]: _gone, ...rest } = value;
                    onChange(rest);
                  } else {
                    set(field.key, Number(n));
                  }
                }}
                className="w-full text-sm rounded-xl px-3 py-2.5 bg-white"
                style={{ border: '1px solid var(--border)' }}
              />
            </div>
          );
        }

        if (field.type === 'select') {
          const val = typeof current === 'string' ? current : '';
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                {field.label}
              </label>
              <select
                value={val}
                onChange={(e) => set(field.key, e.target.value)}
                className="w-full text-sm rounded-xl px-3 py-2.5 bg-white"
                style={{ border: '1px solid var(--border)' }}
              >
                <option value="">Не указано</option>
                {field.options?.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          );
        }

        if (field.type === 'multiselect') {
          const selected = Array.isArray(current) ? current : [];
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                {field.label}
              </label>
              <div className="flex flex-wrap gap-2">
                {field.options?.map((o) => {
                  const on = selected.includes(o);
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => {
                        const next = on ? selected.filter((s) => s !== o) : [...selected, o];
                        set(field.key, next);
                      }}
                      className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                      style={{
                        background: on ? 'var(--gold)' : 'white',
                        color: on ? 'white' : 'var(--text-sub)',
                        border: `1px solid ${on ? 'var(--gold)' : 'var(--border)'}`,
                      }}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
