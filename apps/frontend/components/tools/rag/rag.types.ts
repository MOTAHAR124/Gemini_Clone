import { DocumentRecord } from '@/lib/types';

export interface RagCitation {
  chunkIndex: number;
  score: number;
  preview: string;
}

export interface RagDocumentsPanelProps {
  documents: DocumentRecord[];
  selectedDocumentId: string;
  loadingDocs: boolean;
  uploading: boolean;
  onSelectDocument: (id: string) => void;
  onDeleteDocument: (id: string) => void | Promise<void>;
  onUploadFiles: (files: File[]) => void | Promise<void>;
}

export interface RagQuestionPanelProps {
  readyDocuments: DocumentRecord[];
  selectedDocumentId: string;
  question: string;
  asking: boolean;
  answer: string;
  citations: RagCitation[];
  error: string | null;
  onSelectDocument: (id: string) => void;
  onQuestionChange: (value: string) => void;
  onAsk: () => void | Promise<void>;
}
