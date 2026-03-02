'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/ui/auth-provider';

export default function LoginPage() {
  const router = useRouter();
  const { login, token } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      router.replace('/chat?new=1');
    }
  }, [token, router]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      router.replace('/chat?new=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/90 p-8 shadow-panel backdrop-blur">
      <h1 className="font-(--font-heading) text-3xl text-ink">Sign in</h1>
      <p className="mt-2 text-sm text-slate">Continue to your Gemini-Clone workspace.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-slate">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate/25 bg-white px-3 py-2 text-ink caret-ink outline-none focus:border-tide"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate">Password</span>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate/25 bg-white px-3 py-2 pr-10 text-ink caret-ink outline-none focus:border-tide"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-slate transition hover:text-ink"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-xl bg-ink px-4 py-2 text-white transition hover:bg-[#0d1817] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          window.location.href = api.auth.googleUrl;
        }}
        className="mt-3 w-full cursor-pointer rounded-xl border border-slate/20 bg-white px-4 py-2 text-ink transition hover:bg-mist"
      >
        Continue with Google
      </button>

      <p className="mt-5 text-sm text-slate">
        New here?{' '}
        <Link className="cursor-pointer font-semibold text-tide" href="/register">
          Create account
        </Link>
      </p>
    </div>
  );
}
