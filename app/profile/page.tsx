'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, setUser, logout, AuthUser } from '@/lib/auth';
import AuthGuard from '@/components/AuthGuard';
import { CITIES, City } from '@/lib/types';

function ProfileContent() {
  const router = useRouter();
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', city: '', companyName: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u) {
      setUserState(u);
      setForm({
        name: u.name,
        phone: u.phone ?? '',
        city: u.city ?? '',
        companyName: u.companyName ?? '',
      });
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated: AuthUser = {
      ...user,
      name: form.name,
      phone: form.phone || undefined,
      city: form.city || undefined,
      companyName: form.companyName || undefined,
    };
    setUser(updated);
    setUserState(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) return null;

  const isVendor = user.role === 'vendor';

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Профиль</h1>

      {/* Role badge */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{ background: 'var(--gold-light)', border: '1px solid #EDD9A3' }}
      >
        <span className="text-2xl">{isVendor ? '🏪' : '🎉'}</span>
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--gold-dark)' }}>
            {isVendor ? 'Аккаунт вендора' : 'Аккаунт клиента'}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-sub)' }}>{user.email}</p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl p-6 space-y-5"
        style={{ border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        {isVendor && (
          <Field label="Название компании / бренда">
            <input
              type="text"
              value={form.companyName}
              onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
              placeholder="Сарай Банкет Холл"
              className="profile-input"
            />
          </Field>
        )}

        <Field label="Ваше имя">
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Айбар"
            className="profile-input"
          />
        </Field>

        <Field label="Телефон">
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+7 777 000 00 00"
            className="profile-input"
          />
        </Field>

        <Field label="Город">
          <select
            value={form.city}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            className="profile-input"
          >
            <option value="">Выберите город</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: 'var(--gold)' }}
          >
            {saved ? 'Сохранено ✓' : 'Сохранить'}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="px-5 py-3 rounded-xl text-sm font-medium border transition-colors hover:bg-red-50"
            style={{ borderColor: '#FCA5A5', color: '#DC2626' }}
          >
            Выйти
          </button>
        </div>
      </form>

      <style>{`
        .profile-input {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          background: white;
          color: var(--text-main);
          transition: border-color 0.15s;
        }
        .profile-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(201,169,110,0.15);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>{label}</label>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
