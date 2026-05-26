import apiClient from './client';
import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
} from '../../types/api';

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('auth/login', data);
  return response.data;
};

export const refresh = async (): Promise<RefreshResponse> => {
  const response = await apiClient.post<RefreshResponse>('auth/refresh');
  return response.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post('auth/logout');
};
