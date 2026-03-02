import { API_URL } from './config';
import { ApiError } from './errors';
import { request } from './request';

export const pdfApi = {
  preview: (token: string, payload: { prompt: string }) =>
    request<{ markdown: string; html: string }>(
      '/pdf-generator/preview',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    ),
  download: async (token: string, payload: { markdown?: string; html?: string; fileName?: string }) => {
    const response = await fetch(`${API_URL}/pdf-generator/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new ApiError('PDF generation failed', response.status);
    }

    return response.blob();
  },
};
