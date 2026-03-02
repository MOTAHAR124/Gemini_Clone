import { API_URL } from './config';
import { ApiError } from './errors';
import { ChatModelProfile } from '../chat-models';

export async function streamConversationMessage(input: {
  token: string;
  conversationId: string;
  message: string;
  modelProfile?: ChatModelProfile;
  temperature?: number;
  maxOutputTokens?: number;
  signal?: AbortSignal;
  onChunk: (chunk: string) => void;
  onDone: (fullText: string) => void;
}) {
  const response = await fetch(`${API_URL}/chat/conversations/${input.conversationId}/stream`, {
    method: 'POST',
    signal: input.signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.token}`,
    },
    body: JSON.stringify({
      message: input.message,
      modelProfile: input.modelProfile,
      temperature: input.temperature,
      maxOutputTokens: input.maxOutputTokens,
    }),
  });

  if (!response.ok || !response.body) {
    throw new ApiError('Streaming request failed', response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let finalMessage = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const event of events) {
      const line = event
        .split('\n')
        .find((candidate) => candidate.startsWith('data:'));

      if (!line) {
        continue;
      }

      const payload = line.slice(5).trim();
      if (!payload) {
        continue;
      }

      const parsed = JSON.parse(payload) as {
        type: 'chunk' | 'done' | 'error';
        content?: string;
        message?: string;
      };

      if (parsed.type === 'chunk' && parsed.content) {
        finalMessage += parsed.content;
        input.onChunk(parsed.content);
      }

      if (parsed.type === 'error') {
        throw new ApiError(parsed.message ?? 'Streaming error', 500);
      }

      if (parsed.type === 'done') {
        input.onDone(parsed.message ?? finalMessage);
      }
    }
  }
}
