import axios from 'axios';
import { store } from '../store';
import { clearAuth, setAuth } from '../store/authSlice';

const apiClient = axios.create({
  baseURL: 'http://localhost:5227/api/v1',
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

    const isSessionRestore =
      typeof originalRequest?.url === 'string' &&
      originalRequest.url.includes('users/me');

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthEndpoint &&
      !isSessionRestore
    ) {
      originalRequest._retry = true;

      try {
        console.log('Attempting refresh...');
        const refreshResponse = await apiClient.post('auth/refresh');
        console.log('Refresh success, user:', refreshResponse.data.user);
        console.log(
          'Refresh success, token:',
          refreshResponse.data.accessToken,
        );

        const newToken = refreshResponse.data.accessToken;

        store.dispatch(
          setAuth({
            token: newToken,
            user: refreshResponse.data.user,
          }),
        );
        console.log('Redux state after setAuth:', store.getState().auth);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        delete originalRequest.headers?.['Authorization'];
        originalRequest._retry = true;

        return apiClient(originalRequest);
      } catch (e) {
        store.dispatch(clearAuth());
        window.location.href = '/auth/login';
        console.log('Refresh failed:', e);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
