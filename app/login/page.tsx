'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, getUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Заполните все поля'); return; }
    setLoading(true);
    setError('');

    const user = login(form.email, form.password);
    if (!user) {
      setError('Неверный email или пароль');
      setLoading(false);
      return;
    }
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
          <p className="text-sm" style={{ color: 'var(--text-sub)' }}>Войдите в аккаунт</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-5" style={{ borderColor: 'var(--border)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Пароль</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-field"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
              style={{ background: 'var(--gold)' }}
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>

          <p className="text-center text-sm" style={{ color: 'var(--text-sub)' }}>
            Нет аккаунта?{' '}
            <Link href="/register" className="font-medium hover:underline" style={{ color: 'var(--gold-dark)' }}>
              Зарегистрироваться
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
