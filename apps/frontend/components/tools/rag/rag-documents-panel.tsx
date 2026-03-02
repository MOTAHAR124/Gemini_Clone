import { Loader2, Trash2 } from 'lucide-react';

import { DropzonePanel } from '@/components/ui/dropzone-panel';

import { RagDocumentsPanelProps } from './rag.types';

export function RagDocumentsPanel({
  documents,
  selectedDocumentId,
  loadingDocs,
  uploading,
  onSelectDocument,
  onDeleteDocument,
  onUploadFiles,
}: RagDocumentsPanelProps) {
  return (
    <section className="space-y-4">
      <DropzonePanel
        accept={{ 'application/pdf': ['.pdf'] }}
        onFiles={(files) => {
          void onUploadFiles(files);
        }}
        title="Upload PDF"
        description="Text is extracted server-side, chunked, embedded, and indexed in vector storage."
        disabled={uploading}
      />

      <div className="rounded-2xl border border-white/70 bg-white/85 p-4">
        <h2 className="[font-family:var(--font-heading)] text-lg font-semibold text-ink">Documents</h2>
        {loadingDocs ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : documents.length === 0 ? (
          <p className="mt-3 text-sm text-slate">No files yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={[
                  'rounded-xl border px-3 py-2',
                  selectedDocumentId === doc.id ? 'border-tide bg-tide/5' : 'border-slate/20 bg-white',
                ].join(' ')}
              >
                <button type="button" className="w-full text-left" onClick={() => onSelectDocument(doc.id)}>
                  <p className="truncate text-sm font-medium text-ink">{doc.fileName}</p>
                  <p className="mt-0.5 text-xs text-slate">
                    {doc.status} | {doc.pageCount} pages | {doc.chunkCount} chunks
                  </p>
                  {doc.errorMessage ? <p className="mt-1 text-xs text-red-600">{doc.errorMessage}</p> : null}
                </button>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void onDeleteDocument(doc.id)}
                    className="rounded p-1 text-slate hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {uploading ? <p className="mt-3 text-sm text-tide">Processing PDF and generating embeddings...</p> : null}
      </div>
    </section>
  );
}
