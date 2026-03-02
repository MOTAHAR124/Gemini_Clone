'use client';

import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { useAuth } from '@/components/ui/auth-provider';
import { MarkdownView } from '@/components/ui/markdown-view';
import { DropzonePanel } from '@/components/ui/dropzone-panel';
import { RequireAuth } from '@/components/ui/require-auth';
import { ToolsFrame } from '@/components/ui/tools-frame';
import { api } from '@/lib/api';

export default function ImageReaderPage() {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('Extract all visible text and summarize this image.');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const handleAnalyze = async () => {
    if (!token || !file) {
      return;
    }

    setLoading(true);
    setError(null);
    setAnswer('');

    try {
      const response = await api.image.analyze(token, file, question);
      setAnswer(response.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
      <ToolsFrame title="Image Reader" subtitle="Upload PNG/JPG and ask visual questions with Gemini vision.">
        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          <section className="space-y-4">
            <DropzonePanel
              accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }}
              onFiles={(files) => {
                if (files.length > 0) {
                  setFile(files[0]);
                }
              }}
              title="Upload Image"
              description="Works with screenshots, charts, documents, and diagrams."
              disabled={loading}
            />

            <div className="rounded-2xl border border-white/70 bg-white/85 p-4">
              <label className="block">
                <span className="mb-1 block text-sm text-slate">Question</span>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  className="min-h-30 w-full rounded-xl border border-slate/25 bg-white px-3 py-2"
                />
              </label>

              <button
                onClick={() => void handleAnalyze()}
                disabled={!file || loading}
                className="mt-3 rounded-xl bg-ink px-4 py-2 text-sm text-white hover:bg-[#0d1817] disabled:opacity-60"
              >
                {loading ? 'Analyzing...' : 'Analyze image'}
              </button>

              {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-white/70 bg-white/85 p-5">
              <h2 className="[font-family:var(--font-heading)] text-lg font-semibold text-ink">Image preview</h2>
              {imagePreview ? (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate/20 bg-white p-2">
                  <Image
                    src={imagePreview}
                    alt="Uploaded"
                    width={980}
                    height={640}
                    className="h-auto max-h-105 w-full rounded-lg object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate">Upload an image to preview it here.</p>
              )}
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 p-5">
              <h2 className="[font-family:var(--font-heading)] text-lg font-semibold text-ink">Model response</h2>
              {loading ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate">
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing visual input...
                </div>
              ) : answer ? (
                <div className="mt-3 rounded-xl border border-slate/15 bg-white p-4">
                  <MarkdownView content={answer} />
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate">No result yet.</p>
              )}
            </div>
          </section>
        </div>
      </ToolsFrame>
    </RequireAuth>
  );
}
