import { useState, type FormEvent } from 'react';
import { AlertCircle, ArrowLeft, Lock } from 'lucide-react';

interface AdminLoginProps {
  brandName: string;
  onLoginSuccess: (token: string, username: string) => void;
  onBackToSite: () => void;
}

export function AdminLogin({
  brandName,
  onLoginSuccess,
  onBackToSite,
}: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Kullanıcı adı ve parola gereklidir.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Giriş başarısız.');
        return;
      }
      onLoginSuccess(data.token, data.username);
    } catch {
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setUsername('admin');
    setPassword('anb2026');
    setError('');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            {brandName} · Yönetici Girişi
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            WordPress İçerik ve Sayfa Yönetim Paneli (wp-admin)
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="wp-login-user"
                className="block text-sm font-medium text-slate-800"
              >
                Kullanıcı Adı
              </label>
              <input
                id="wp-login-user"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-700"
              />
            </div>

            <div>
              <label
                htmlFor="wp-login-pass"
                className="block text-sm font-medium text-slate-800"
              >
                Parola
              </label>
              <input
                id="wp-login-pass"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-700"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
            >
              {submitting ? 'Oturum Açılıyor...' : 'Yönetim Paneline Giriş Yap'}
            </button>
          </form>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
              <div>
                <p className="font-semibold text-slate-800">Demo Yönetici Bilgileri</p>
                <p className="mt-0.5 font-mono">Kullanıcı: admin · Parola: anb2026</p>
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="shrink-0 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100"
              >
                Doldur
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onBackToSite}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>anbplastik.com Sitesine Dön</span>
          </button>
        </div>
      </div>
    </div>
  );
}
