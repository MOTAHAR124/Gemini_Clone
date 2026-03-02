import { API_URL } from './config';
import { request } from './request';
import { AuthResponse, UserProfile } from '../types';

export const authApi = {
  register: (payload: { email: string; name: string; password: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: (token: string) => request<UserProfile>('/auth/me', { method: 'GET' }, token),
  googleUrl: `${API_URL}/auth/google`,
};
