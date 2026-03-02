import { MarkdownView } from '@/components/ui/markdown-view';

import { RagQuestionPanelProps } from './rag.types';

export function RagQuestionPanel({
  readyDocuments,
  selectedDocumentId,
  question,
  asking,
  answer,
  citations,
  error,
  onSelectDocument,
  onQuestionChange,
  onAsk,
}: RagQuestionPanelProps) {
  return (
    <section className="rounded-2xl border border-white/70 bg-white/85 p-5">
      <h2 className="[font-family:var(--font-heading)] text-xl font-semibold text-ink">Ask Document</h2>
      <p className="mt-1 text-sm text-slate">
        If relevant content is missing, model should return exactly: <strong>Not found in document</strong>
      </p>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm text-slate">Select indexed PDF</span>
          <select
            value={selectedDocumentId}
            onChange={(event) => onSelectDocument(event.target.value)}
            className="w-full rounded-xl border border-slate/25 bg-white px-3 py-2"
          >
            <option value="">Choose document</option>
            {readyDocuments.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.fileName}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate">Question</span>
          <textarea
            value={question}
            onChange={(event) => onQuestionChange(event.target.value)}
            className="min-h-30 w-full rounded-xl border border-slate/25 bg-white px-3 py-2"
            placeholder="Summarize section 2 on payment terms"
          />
        </label>

        <button
          type="button"
          onClick={() => void onAsk()}
          disabled={asking || !selectedDocumentId || !question.trim()}
          className="rounded-xl bg-ink px-4 py-2 text-sm text-white transition hover:bg-[#0d1817] disabled:opacity-60"
        >
          {asking ? 'Searching + generating...' : 'Ask'}
        </button>
      </div>

      {answer ? (
        <div className="mt-6 rounded-xl border border-slate/15 bg-white p-4">
          <p className="mb-2 text-xs uppercase tracking-[0.12em] text-slate">Answer</p>
          <MarkdownView content={answer} />
        </div>
      ) : null}

      {citations.length > 0 ? (
        <div className="mt-4 rounded-xl border border-slate/15 bg-white p-4">
          <p className="mb-2 text-xs uppercase tracking-[0.12em] text-slate">Retrieved chunks</p>
          <div className="space-y-2">
            {citations.map((citation) => (
              <div key={`${citation.chunkIndex}-${citation.score}`} className="rounded-lg border border-slate/15 bg-mist/40 p-2">
                <p className="text-xs text-slate">
                  Chunk {citation.chunkIndex} | score {citation.score.toFixed(3)}
                </p>
                <p className="mt-1 text-sm text-ink">{citation.preview}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
