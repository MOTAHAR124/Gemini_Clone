'use client';

import { useEffect, useMemo, useState } from 'react';

import { RagDocumentsPanel, RagQuestionPanel, RagCitation } from '@/components/tools/rag';
import { RequireAuth } from '@/components/ui/require-auth';
import { ToolsFrame } from '@/components/ui/tools-frame';
import { api } from '@/lib/api';
import { useAuth } from '@/components/ui/auth-provider';
import { DocumentRecord } from '@/lib/types';

export default function RagToolPage() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string>('');
  const [citations, setCitations] = useState<RagCitation[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readyDocuments = useMemo(() => documents.filter((doc) => doc.status === 'ready'), [documents]);

  const refreshDocuments = async () => {
    if (!token) {
      return;
    }

    setLoadingDocs(true);
    try {
      const data = await api.rag.listDocuments(token);
      setDocuments(data);
      if (!selectedDocumentId && data.length > 0) {
        setSelectedDocumentId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    void refreshDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleUpload = async (files: File[]) => {
    if (!token || files.length === 0) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const created = await api.rag.uploadPdf(token, files[0]);
      await refreshDocuments();
      setSelectedDocumentId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const askQuestion = async () => {
    if (!token || !selectedDocumentId || !question.trim()) {
      return;
    }

    setAsking(true);
    setError(null);
    setAnswer('');

    try {
      const response = await api.rag.ask(token, {
        documentId: selectedDocumentId,
        question: question.trim(),
      });
      setAnswer(response.answer);
      setCitations(response.citations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Question failed');
    } finally {
      setAsking(false);
    }
  };

  const removeDocument = async (id: string) => {
    if (!token) {
      return;
    }

    try {
      await api.rag.deleteDocument(token, id);
      await refreshDocuments();
      if (selectedDocumentId === id) {
        setSelectedDocumentId('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <RequireAuth>
      <ToolsFrame title="PDF RAG" subtitle="Upload a PDF and get answers grounded only in retrieved chunks.">
        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <RagDocumentsPanel
            documents={documents}
            selectedDocumentId={selectedDocumentId}
            loadingDocs={loadingDocs}
            uploading={uploading}
            onSelectDocument={setSelectedDocumentId}
            onDeleteDocument={removeDocument}
            onUploadFiles={handleUpload}
          />

          <RagQuestionPanel
            readyDocuments={readyDocuments}
            selectedDocumentId={selectedDocumentId}
            question={question}
            asking={asking}
            answer={answer}
            citations={citations}
            error={error}
            onSelectDocument={setSelectedDocumentId}
            onQuestionChange={setQuestion}
            onAsk={askQuestion}
          />
        </div>
      </ToolsFrame>
    </RequireAuth>
  );
}
