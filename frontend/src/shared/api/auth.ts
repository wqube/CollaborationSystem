import apiClient from './client';

export interface loginRequest {
  email: string;
  password: string;
}

export interface LoginResponce {
  accessToken: string;
  expiresIn: number;
  user: {
    id: string;
    displayName: string;
    email: string;
  };
}

export const login = async (data: loginRequest): Promise<LoginResponce> => {
  const responce = await apiClient.post<LoginResponce>('auth/login', data);
  return responce.data;
};
