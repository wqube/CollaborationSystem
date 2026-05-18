import apiClient from './client';
import type { UserDto } from '../../types/api';

export interface loginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: UserDto;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
  user: UserDto;
}

export const login = async (data: loginRequest): Promise<LoginResponse> => {
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
