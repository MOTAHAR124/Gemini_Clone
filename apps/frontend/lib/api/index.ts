import { authApi } from './auth';
import { chatApi } from './chat';
import { imageApi } from './image';
import { pdfApi } from './pdf';
import { ragApi } from './rag';

export const api = {
  auth: authApi,
  chat: chatApi,
  rag: ragApi,
  pdf: pdfApi,
  image: imageApi,
};

export { streamConversationMessage } from './stream';
export { ApiError } from './errors';
