import Link from 'next/link';

import { RequireAuth } from '@/components/ui/require-auth';
import { ToolsFrame } from '@/components/ui/tools-frame';

export default function ToolsHomePage() {
  return (
    <RequireAuth>
      <ToolsFrame title="AI Productivity Suite" subtitle="Document QA, PDF drafting, and vision reasoning in one workspace.">
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/tools/rag" className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-panel transition hover:-translate-y-0.5">
            <h2 className="[font-family:var(--font-heading)] text-xl font-semibold text-ink">PDF RAG</h2>
            <p className="mt-2 text-sm text-slate">Upload PDFs, index chunks, and ask context-grounded questions.</p>
          </Link>

          <Link
            href="/tools/pdf-generator"
            className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-panel transition hover:-translate-y-0.5"
          >
            <h2 className="[font-family:var(--font-heading)] text-xl font-semibold text-ink">AI PDF Generator</h2>
            <p className="mt-2 text-sm text-slate">Generate structured markdown, preview HTML, and download A4 PDFs.</p>
          </Link>

          <Link
            href="/tools/image-reader"
            className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-panel transition hover:-translate-y-0.5"
          >
            <h2 className="[font-family:var(--font-heading)] text-xl font-semibold text-ink">Image Reader</h2>
            <p className="mt-2 text-sm text-slate">Extract text and answer questions from charts, scans, and diagrams.</p>
          </Link>
        </div>
      </ToolsFrame>
    </RequireAuth>
  );
}
