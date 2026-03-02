import { request } from './request';

export const imageApi = {
  analyze: (token: string, file: File, question?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (question?.trim()) {
      formData.append('question', question);
    }

    return request<{ answer: string }>(
      '/image-reader/analyze',
      {
        method: 'POST',
        body: formData,
      },
      token,
    );
  },
};
