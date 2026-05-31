import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import {
  authApi,
  setAccessToken,
  getAccessToken,
  ApiRequestError,
  type UserProfile,
  type SignupData,
  type LoginData,
} from '../lib/api';

// ========================
// Auth Context
// ========================
interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  signup: (data: SignupData) => Promise<{ success: boolean; message: string }>;
  login: (data: LoginData) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export type AuthContextValue = AuthState & AuthActions;

export const AuthContext = createContext<AuthContextValue | null>(null);

// ========================
// useAuth Hook
// ========================
export function useAuth(): AuthContextValue {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Load user on mount (from stored token or cookie)
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('roadsos_access_token');
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    setAccessToken(token);

    try {
      const res = await authApi.getMe();
      setState({
        user: res.data,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (err) {
      // Try refresh
      try {
        const refreshRes = await authApi.refreshToken();
        const newToken = refreshRes.data.accessToken;
        localStorage.setItem('roadsos_access_token', newToken);
        setAccessToken(newToken);
        const meRes = await authApi.getMe();
        setState({
          user: meRes.data,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } catch {
        localStorage.removeItem('roadsos_access_token');
        setAccessToken(null);
        setState({ user: null, isLoading: false, isAuthenticated: false, error: null });
      }
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signup = useCallback(async (data: SignupData) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await authApi.signup(data);
      const { user, accessToken } = res.data;
      localStorage.setItem('roadsos_access_token', accessToken);
      setAccessToken(accessToken);
      setState({ user, isLoading: false, isAuthenticated: true, error: null });
      return { success: true, message: res.message };
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Signup failed';
      setState((s) => ({ ...s, isLoading: false, error: message }));
      return { success: false, message };
    }
  }, []);

  const login = useCallback(async (data: LoginData) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await authApi.login(data);
      const { user, accessToken } = res.data;
      localStorage.setItem('roadsos_access_token', accessToken);
      setAccessToken(accessToken);
      setState({ user, isLoading: false, isAuthenticated: true, error: null });
      return { success: true, message: res.message, user };
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Login failed';
      setState((s) => ({ ...s, isLoading: false, error: message }));
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('roadsos_access_token');
    setAccessToken(null);
    setState({ user: null, isLoading: false, isAuthenticated: false, error: null });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      setState((s) => ({ ...s, user: res.data }));
    } catch {
      // ignore
    }
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return {
    ...state,
    signup,
    login,
    logout,
    refreshUser,
    clearError,
  };
}

// ========================
// useAuthContext helper
// ========================
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
