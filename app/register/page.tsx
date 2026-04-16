'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register, UserRole } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('client');
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Введите имя';
    if (!form.email.includes('@')) e.email = 'Введите корректный email';
    if (form.password.length < 6) e.password = 'Минимум 6 символов';
    if (role === 'vendor' && !form.companyName.trim()) e.companyName = 'Введите название компании';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    const user = register({ ...form, role });
    router.push(user.role === 'vendor' ? '/vendor/dashboard' : '/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--cream)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', color: 'var(--gold-dark)' }}>
            ToiBook
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-sub)' }}>Создайте аккаунт</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-6" style={{ borderColor: 'var(--border)' }}>
          {/* Role selector */}
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-main)' }}>Я хочу:</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'client', icon: '🎉', title: 'Найти вендоров', sub: 'Планирую мероприятие' },
                { value: 'vendor', icon: '🏪', title: 'Предоставлять услуги', sub: 'Я вендор / компания' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className="p-4 rounded-xl border-2 text-left transition-all"
                  style={{
                    borderColor: role === opt.value ? 'var(--gold)' : 'var(--border)',
                    background: role === opt.value ? 'var(--gold-light)' : 'white',
                  }}
                >
                  <div className="text-2xl mb-1">{opt.icon}</div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{opt.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === 'vendor' && (
              <Field label="Название компании / бренда" error={errors.companyName}>
                <input
                  type="text"
                  placeholder="Например: Сарай Банкет Холл"
                  value={form.companyName}
                  onChange={e => set('companyName', e.target.value)}
                  className="input-field"
                />
              </Field>
            )}

            <Field label="Ваше имя" error={errors.name}>
              <input
                type="text"
                placeholder="Айбар"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                className="input-field"
              />
            </Field>

            <Field label="Email" error={errors.email}>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className="input-field"
              />
            </Field>

            <Field label="Пароль" error={errors.password}>
              <input
                type="password"
                placeholder="Минимум 6 символов"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                className="input-field"
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60 mt-2"
              style={{ background: 'var(--gold)' }}
            >
              {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
            </button>
          </form>

          <p className="text-center text-sm" style={{ color: 'var(--text-sub)' }}>
            Уже есть аккаунт?{' '}
            <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--gold-dark)' }}>
              Войти
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
          background: white;
        }
        .input-field:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(201,169,110,0.15);
        }
      `}</style>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>{label}</label>
      {children}
      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
    </div>
  );
}
