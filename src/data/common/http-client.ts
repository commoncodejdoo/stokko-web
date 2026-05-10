import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/view/common/store/auth-store';
import { toast } from '@/view/common/components/toast.component';

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

class ReadOnlySessionAbort extends Error {
  readonly code = 'READ_ONLY_SESSION';
  constructor() {
    super('Read-only impersonation session — mutations blocked client-side.');
  }
}

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken, readOnly } = useAuthStore.getState();
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    // A3 — short-circuit write requests on a read-only impersonation
    // session. The backend `ReadOnlySessionInterceptor` enforces the same
    // rule server-side; this gives instant client feedback.
    const method = (config.method ?? 'get').toLowerCase();
    if (readOnly && method !== 'get' && !config._isRefreshCall) {
      toast.error('Read-only sesija', 'Izmjene su onemogućene tijekom admin pregleda.');
      throw new ReadOnlySessionAbort();
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
