export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens: number;
  createdAt: string;
}

export interface SharedChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface SharedConversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: SharedChatMessage[];
}

export interface DocumentRecord {
  id: string;
  fileName: string;
  status: 'processing' | 'ready' | 'failed';
  pageCount: number;
  chunkCount: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RagAnswer {
  answer: string;
  citations: Array<{
    chunkIndex: number;
    score: number;
    preview: string;
  }>;
}
