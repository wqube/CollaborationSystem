import apiClient from './client';
import type { UserListItem } from '../../types/api';

export interface GetUsersParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface UsersResponse {
  items: UserListItem[];
  page: number;
  pageSize: number;
  total: number;
}

export const getUsers = async (
  params?: GetUsersParams,
): Promise<UsersResponse> => {
  const response = await apiClient.get<UsersResponse>('/users', { params });

  return response.data;
};
