'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { useAuth } from '@/components/ui/auth-provider';
import { MarkdownView } from '@/components/ui/markdown-view';
import { RequireAuth } from '@/components/ui/require-auth';
import { ToolsFrame } from '@/components/ui/tools-frame';
import { api } from '@/lib/api';

const promptSamples = [
  'Create a professional one-page software engineer resume for a candidate with 5 years experience.',
  'Generate an invoice template for a freelance UI/UX project with subtotal, tax, and total sections.',
  'Write a quarterly business report with executive summary, KPI table, and action plan.',
];

export default function PdfGeneratorPage() {
  const { token } = useAuth();
  const [prompt, setPrompt] = useState(promptSamples[0]);
  const [fileName, setFileName] = useState('ai-document');
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = async () => {
    if (!token || !prompt.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.pdf.preview(token, { prompt: prompt.trim() });
      setMarkdown(response.markdown);
      setHtml(response.html);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!token || (!html && !markdown)) {
      return;
    }

    setDownloading(true);
    setError(null);

    try {
      const blob = await api.pdf.download(token, {
        html,
        markdown,
        fileName,
      });

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `${fileName || 'document'}.pdf`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <RequireAuth>
      <ToolsFrame title="AI PDF Generator" subtitle="Generate structured documents, preview, and export to A4 PDFs.">
        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <section className="rounded-2xl border border-white/70 bg-white/85 p-5">
            <h2 className="[font-family:var(--font-heading)] text-xl font-semibold text-ink">Prompt</h2>
            <p className="mt-1 text-sm text-slate">Choose a sample or write your own brief.</p>

            <div className="mt-3 space-y-2">
              {promptSamples.map((sample) => (
                <button
                  key={sample}
                  onClick={() => setPrompt(sample)}
                  className="w-full rounded-lg border border-slate/20 bg-mist/50 px-3 py-2 text-left text-xs text-slate hover:bg-mist"
                >
                  {sample}
                </button>
              ))}
            </div>

            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="mt-4 min-h-42.5 w-full rounded-xl border border-slate/25 bg-white px-3 py-2"
            />

            <label className="mt-3 block">
              <span className="mb-1 block text-sm text-slate">File name</span>
              <input
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                className="w-full rounded-xl border border-slate/25 bg-white px-3 py-2"
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => void generatePreview()}
                disabled={loading || !prompt.trim()}
                className="rounded-xl bg-ink px-4 py-2 text-sm text-white hover:bg-[#0d1817] disabled:opacity-60"
              >
                {loading ? 'Generating...' : 'Generate preview'}
              </button>

              <button
                onClick={() => void downloadPdf()}
                disabled={downloading || (!html && !markdown)}
                className="rounded-xl bg-coral px-4 py-2 text-sm text-white hover:bg-[#db5f43] disabled:opacity-60"
              >
                {downloading ? 'Building PDF...' : 'Download PDF'}
              </button>
            </div>

            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-white/70 bg-white/85 p-5">
              <h3 className="[font-family:var(--font-heading)] text-lg font-semibold text-ink">Markdown output</h3>
              {loading ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate">
                  <Loader2 className="h-4 w-4 animate-spin" /> Rendering...
                </div>
              ) : markdown ? (
                <div className="mt-4 max-h-90 overflow-y-auto rounded-xl border border-slate/15 bg-white p-4">
                  <MarkdownView content={markdown} />
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate">No generated content yet.</p>
              )}
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 p-5">
              <h3 className="[font-family:var(--font-heading)] text-lg font-semibold text-ink">A4 preview</h3>
              {html ? (
                <iframe title="A4 preview" srcDoc={html} className="mt-4 h-120 w-full rounded-xl border border-slate/15 bg-white" />
              ) : (
                <p className="mt-4 text-sm text-slate">Generate preview to see final document layout.</p>
              )}
            </div>
          </section>
        </div>
      </ToolsFrame>
    </RequireAuth>
  );
}
