import axios from 'axios';
import { store } from '../store';
import { clearAuth, setAuth } from '../store/authSlice';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5227/api/v1',
  withCredentials: true,
});

// Interceptor 1 — на запрос
// Добавляет accessToken к каждому исходящему запросу
apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor 2 — на ответ
// Обрабатывает 401 — обновляет токен и повторяет запрос
apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config as {
      _retry?: boolean;
      url?: string;
      headers?: Record<string, string>;
    };
    const isAuthEndpoint =
      typeof originalRequest?.url === 'string' &&
      originalRequest.url.includes('auth/');

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await apiClient.post('auth/refresh');
        const newToken = refreshResponse.data.accessToken;

        store.dispatch(
          setAuth({
            token: newToken,
            user: refreshResponse.data.user,
          }),
        );

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return apiClient(originalRequest);
      } catch {
        store.dispatch(clearAuth());
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
