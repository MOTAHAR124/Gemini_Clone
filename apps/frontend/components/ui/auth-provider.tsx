'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { api } from '@/lib/api';
import { UserProfile } from '@/lib/types';

interface AuthContextValue {
  token: string | null;
  user: UserProfile | null;
  recentAccounts: UserProfile[];
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { email: string; name: string; password: string }) => Promise<void>;
  setTokenFromOAuth: (token: string) => Promise<void>;
  switchAccount: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'aster_ai_token';
const RECENT_ACCOUNTS_KEY = 'aster_ai_recent_accounts';
const ACCOUNT_SESSIONS_KEY = 'aster_ai_account_sessions';
const MAX_RECENT_ACCOUNTS = 5;

interface StoredAccountSession {
  email: string;
  accessToken: string;
  user: UserProfile;
  updatedAt: number;
}

function readRecentAccounts(): UserProfile[] {
  try {
    const raw = window.localStorage.getItem(RECENT_ACCOUNTS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as UserProfile[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item) => item && typeof item.email === 'string' && typeof item.name === 'string');
  } catch {
    return [];
  }
}

function readAccountSessions(): StoredAccountSession[] {
  try {
    const raw = window.localStorage.getItem(ACCOUNT_SESSIONS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as StoredAccountSession[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item) => item && typeof item.email === 'string' && typeof item.accessToken === 'string' && item.user);
  } catch {
    return [];
  }
}

function writeAccountSessions(sessions: StoredAccountSession[]) {
  window.localStorage.setItem(ACCOUNT_SESSIONS_KEY, JSON.stringify(sessions));
}

function readActiveToken(): string | null {
  return window.sessionStorage.getItem(TOKEN_KEY) ?? window.localStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [recentAccounts, setRecentAccounts] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const rememberRecentAccount = useCallback((profile: UserProfile) => {
    setRecentAccounts((current) => {
      const next = [profile, ...current.filter((item) => item.email !== profile.email)].slice(0, MAX_RECENT_ACCOUNTS);
      window.localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const saveAccountSession = useCallback((accessToken: string, profile: UserProfile) => {
    const current = readAccountSessions();
    const next: StoredAccountSession[] = [
      {
        email: profile.email,
        accessToken,
        user: profile,
        updatedAt: Date.now(),
      },
      ...current.filter((item) => item.email !== profile.email),
    ].slice(0, MAX_RECENT_ACCOUNTS);
    writeAccountSessions(next);
  }, []);

  useEffect(() => {
    setRecentAccounts(readRecentAccounts());

    const params = new URLSearchParams(window.location.search);
    const switchEmail = params.get('switchAccount');
    if (switchEmail) {
      const existing = readAccountSessions().find((item) => item.email === switchEmail);
      if (existing) {
        window.sessionStorage.setItem(TOKEN_KEY, existing.accessToken);
        setToken(existing.accessToken);
        api.auth
          .me(existing.accessToken)
          .then((profile) => {
            setUser(profile);
            rememberRecentAccount(profile);
            saveAccountSession(existing.accessToken, profile);
          })
          .catch(() => {
            const remainingSessions = readAccountSessions().filter((item) => item.email !== switchEmail);
            writeAccountSessions(remainingSessions);
            setRecentAccounts((current) => {
              const next = current.filter((item) => item.email !== switchEmail);
              window.localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(next));
              return next;
            });
            setToken(null);
            setUser(null);
          })
          .finally(() => {
            params.delete('switchAccount');
            const nextQuery = params.toString();
            const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;
            window.history.replaceState({}, '', nextUrl);
            setLoading(false);
          });
        return;
      }
    }

    const stored = readActiveToken();
    if (!stored) {
      setLoading(false);
      return;
    }

    setToken(stored);
    api.auth
      .me(stored)
      .then((profile) => {
        setUser(profile);
        rememberRecentAccount(profile);
        saveAccountSession(stored, profile);
      })
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [rememberRecentAccount, saveAccountSession]);

  const applyAuth = useCallback(async (accessToken: string, profile?: UserProfile) => {
    window.sessionStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);

    if (profile) {
      setUser(profile);
      rememberRecentAccount(profile);
      saveAccountSession(accessToken, profile);
      return;
    }

    const me = await api.auth.me(accessToken);
    setUser(me);
    rememberRecentAccount(me);
    saveAccountSession(accessToken, me);
  }, [rememberRecentAccount, saveAccountSession]);

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const response = await api.auth.login(payload);
      await applyAuth(response.accessToken, response.user);
    },
    [applyAuth],
  );

  const register = useCallback(
    async (payload: { email: string; name: string; password: string }) => {
      const response = await api.auth.register(payload);
      await applyAuth(response.accessToken, response.user);
    },
    [applyAuth],
  );

  const setTokenFromOAuth = useCallback(
    async (accessToken: string) => {
      await applyAuth(accessToken);
    },
    [applyAuth],
  );

  const switchAccount = useCallback(
    async (email: string) => {
      const existing = readAccountSessions().find((item) => item.email === email);
      if (!existing) {
        window.open(api.auth.googleUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      window.sessionStorage.setItem(TOKEN_KEY, existing.accessToken);
      setToken(existing.accessToken);
      try {
        const profile = await api.auth.me(existing.accessToken);
        setUser(profile);
        rememberRecentAccount(profile);
        saveAccountSession(existing.accessToken, profile);
      } catch {
        const remainingSessions = readAccountSessions().filter((item) => item.email !== email);
        writeAccountSessions(remainingSessions);
        setRecentAccounts((current) => {
          const next = current.filter((item) => item.email !== email);
          window.localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(next));
          return next;
        });
        window.open(api.auth.googleUrl, '_blank', 'noopener,noreferrer');
      }
    },
    [rememberRecentAccount, saveAccountSession],
  );

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, recentAccounts, loading, login, register, setTokenFromOAuth, switchAccount, logout }),
    [token, user, recentAccounts, loading, login, register, setTokenFromOAuth, switchAccount, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
