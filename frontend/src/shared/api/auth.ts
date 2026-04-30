import apiClient from './client';

export interface loginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: {
    id: string;
    displayName: string;
    email: string;
  };
}

export const login = async (data: loginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('auth/login', data);
  return response.data;
};
