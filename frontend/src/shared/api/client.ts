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
    if (error.responce?.status === 401) {
      try {
        const refreshResponce = await apiClient.post('auth/refresh');
        const newToken = refreshResponce.data.accessToken;

        store.dispatch(
          setAuth({
            token: newToken,
            user: store.getState().auth.user!,
          }),
        );

        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(error.config);
      } catch {
        store.dispatch(clearAuth());
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
