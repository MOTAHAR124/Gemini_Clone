import { request } from './request';
import { ChatMessage, Conversation, SharedConversation } from '../types';
import { ChatModelProfile } from '../chat-models';

export const chatApi = {
  listConversations: (token: string) => request<Conversation[]>('/chat/conversations', { method: 'GET' }, token),
  createConversation: (token: string, title?: string) =>
    request<Conversation>(
      '/chat/conversations',
      {
        method: 'POST',
        body: JSON.stringify(title ? { title } : {}),
      },
      token,
    ),
  renameConversation: (token: string, id: string, title: string) =>
    request<Conversation>(
      `/chat/conversations/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      },
      token,
    ),
  deleteConversation: (token: string, id: string) =>
    request<{ success: boolean }>(`/chat/conversations/${id}`, { method: 'DELETE' }, token),
  shareConversation: (token: string, id: string) =>
    request<{ shareToken: string }>(`/chat/conversations/${id}/share`, { method: 'POST' }, token),
  getSharedConversation: (token: string) =>
    request<SharedConversation>(`/chat/shared/${token}`, { method: 'GET' }),
  listMessages: (token: string, conversationId: string) =>
    request<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`, { method: 'GET' }, token),
  sendWithAttachments: async (
    token: string,
    conversationId: string,
    payload: {
      message?: string;
      files: File[];
      temperature?: number;
      maxOutputTokens?: number;
      modelProfile?: ChatModelProfile;
      signal?: AbortSignal;
    },
  ) => {
    const formData = new FormData();
    payload.files.forEach((file) => formData.append('files', file));
    if (payload.message?.trim()) {
      formData.append('message', payload.message.trim());
    }
    if (typeof payload.temperature === 'number') {
      formData.append('temperature', String(payload.temperature));
    }
    if (typeof payload.maxOutputTokens === 'number') {
      formData.append('maxOutputTokens', String(payload.maxOutputTokens));
    }
    if (payload.modelProfile) {
      formData.append('modelProfile', payload.modelProfile);
    }

    return request<{ message: string }>(
      `/chat/conversations/${conversationId}/attachments`,
      {
        method: 'POST',
        body: formData,
        signal: payload.signal,
      },
      token,
    );
  },
};
