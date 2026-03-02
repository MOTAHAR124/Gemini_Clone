import { request } from './request';
import { DocumentRecord, RagAnswer } from '../types';

export const ragApi = {
  uploadPdf: (token: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<DocumentRecord>('/pdf-rag/upload', { method: 'POST', body: formData }, token);
  },
  listDocuments: (token: string) => request<DocumentRecord[]>('/pdf-rag/documents', { method: 'GET' }, token),
  ask: (token: string, payload: { documentId: string; question: string }) =>
    request<RagAnswer>(
      '/pdf-rag/ask',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    ),
  deleteDocument: (token: string, id: string) =>
    request<{ success: boolean }>(`/pdf-rag/documents/${id}`, { method: 'DELETE' }, token),
};
