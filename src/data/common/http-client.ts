import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/view/common/store/auth-store';

declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
    _isRefreshCall?: boolean;
  }
}

const DEFAULT_API_URL = 'http://localhost:3000/api/v1';

const apiUrl: string = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;

export const getApiUrl = (): string => apiUrl;

export const httpClient: AxiosInstance = axios.create({
  baseURL: apiUrl,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _isRefreshCall?: boolean;
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;

    if (
      !original ||
      original._retry ||
      original._isRefreshCall ||
      error.response?.status !== 401
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    const newAccessToken = await attemptRefresh();
    if (!newAccessToken) {
      useAuthStore.getState().clearSession();
      return Promise.reject(error);
    }

    original.headers.set('Authorization', `Bearer ${newAccessToken}`);
    return httpClient.request(original);
  },
);

/**
 * Calls `/auth/refresh` through the same client so it inherits `baseURL`,
 * timeout, and headers. The `_isRefreshCall` flag tells the response
 * interceptor to skip its own refresh-on-401 path (preventing recursion).
 */
async function attemptRefresh(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return null;

  try {
    const { data } = await httpClient.post<{
      accessToken: string;
      refreshToken: string;
    }>('/auth/refresh', { refreshToken }, { _isRefreshCall: true });
    useAuthStore.getState().updateTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}
