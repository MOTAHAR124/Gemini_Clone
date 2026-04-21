'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

import { AuthIllustration } from '@/components/ui/auth-illustration';
import { useAuth } from '@/components/ui/auth-provider';
import { registerSchema, type RegisterInput } from '@/lib/validation/auth';

type RegisterFormErrors = Partial<Record<keyof RegisterInput, string>>;

export default function RegisterPage() {
  const router = useRouter();
  const { register, token } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegisterFormErrors>({});

  useEffect(() => {
    if (token) {
      router.replace('/chat?new=1');
    }
  }, [token, router]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = registerSchema.safeParse({
      name,
      email: email.trim(),
      password,
    });

    if (!validation.success) {
      const nextErrors: RegisterFormErrors = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string' && !nextErrors[field as keyof RegisterFormErrors]) {
          nextErrors[field as keyof RegisterFormErrors] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      await register(validation.data);
      router.replace('/chat?new=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-10 rounded-xl bg-white px-6 py-10 shadow-2xl sm:px-10 md:px-14 md:py-14">
      <AuthIllustration alt="Register illustration" />

        <form onSubmit={onSubmit} className="w-full max-w-90 flex-1">
          <h1 className="text-center text-3xl font-bold text-zinc-800">Create your Account</h1>

          <label className="mt-10 block">
            <span className="sr-only">Full name</span>
            <div className="relative">
              <User className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                type="text"
                required
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setFieldErrors((current) => ({ ...current, name: undefined }));
                }}
                placeholder="Full name"
                className="h-12 w-full rounded-full bg-zinc-100 pr-5 pl-12 text-sm text-zinc-700 outline-none ring-0 transition focus:bg-zinc-50 focus:shadow-[0_0_0_2px_rgba(87,184,70,0.35)]"
              />
            </div>
            {fieldErrors.name ? <p className="mt-2 text-xs text-red-600">{fieldErrors.name}</p> : null}
          </label>

          <label className="mt-3 block">
            <span className="sr-only">Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFieldErrors((current) => ({ ...current, email: undefined }));
                }}
                placeholder="Email"
                className="h-12 w-full rounded-full bg-zinc-100 pr-5 pl-12 text-sm text-zinc-700 outline-none ring-0 transition focus:bg-zinc-50 focus:shadow-[0_0_0_2px_rgba(87,184,70,0.35)]"
              />
            </div>
            {fieldErrors.email ? <p className="mt-2 text-xs text-red-600">{fieldErrors.email}</p> : null}
          </label>

          <label className="mt-3 block">
            <span className="sr-only">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setFieldErrors((current) => ({ ...current, password: undefined }));
                }}
                placeholder="Password"
                className="h-12 w-full rounded-full bg-zinc-100 pr-12 pl-12 text-sm text-zinc-700 outline-none ring-0 transition focus:bg-zinc-50 focus:shadow-[0_0_0_2px_rgba(87,184,70,0.35)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password ? <p className="mt-2 text-xs text-red-600">{fieldErrors.password}</p> : null}
          </label>

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 h-12 w-full rounded-full bg-[#57b846] text-sm font-semibold tracking-wide text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>

          <p className="mt-12 text-center text-sm text-zinc-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-zinc-800 hover:text-[#57b846]">
              Sign in
            </Link>
          </p>
      </form>
    </div>
  );
}

