'use client';

import { LogOut, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from './auth-provider';

interface ToolsFrameProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function ToolsFrame({ title, subtitle, children }: ToolsFrameProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen px-4 py-6 lg:px-10">
      <header className="mb-6 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-panel backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-tide/10 px-3 py-1 text-xs font-medium text-tide">
              <Sparkles className="h-3.5 w-3.5" />
              Gemini-Clone Tools
            </div>
            <h1 className="[font-family:var(--font-heading)] text-3xl font-semibold text-ink">{title}</h1>
            <p className="mt-1 text-sm text-slate">{subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/chat" className="rounded-xl border border-slate/20 bg-white px-3 py-2 text-sm text-slate hover:bg-mist">
              Chat Workspace
            </Link>
            <Link href="/tools/rag" className="rounded-xl border border-slate/20 bg-white px-3 py-2 text-sm text-slate hover:bg-mist">
              PDF RAG
            </Link>
            <Link
              href="/tools/pdf-generator"
              className="rounded-xl border border-slate/20 bg-white px-3 py-2 text-sm text-slate hover:bg-mist"
            >
              PDF Generator
            </Link>
            <Link
              href="/tools/image-reader"
              className="rounded-xl border border-slate/20 bg-white px-3 py-2 text-sm text-slate hover:bg-mist"
            >
              Image Reader
            </Link>
            <button
              onClick={() => {
                logout();
                router.replace('/login');
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate/20 bg-white px-3 py-2 text-sm text-slate hover:bg-mist"
            >
              <LogOut className="h-4 w-4" />
              {user?.name}
            </button>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
