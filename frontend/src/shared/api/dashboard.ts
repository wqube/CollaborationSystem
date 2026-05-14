import apiClient from './client';
import type {
  ProjectSummary,
  SuggestionSummary,
  SuggestionStatus,
} from '../../types/api';

export interface DashboardResponse {
  project: ProjectSummary;
  membersPreview: {
    userId: string;
    displayName: string;
    role: 'Member' | 'Admin';
  }[];
  suggestions: {
    items: SuggestionSummary[];
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface GetDashboardParams {
  status?: SuggestionStatus;
  page?: number;
  pageSize?: number;
}

export const getDashboard = async (
  projectId: string,
  params?: GetDashboardParams,
): Promise<DashboardResponse> => {
  const response = await apiClient.get<DashboardResponse>(
    `/projects/${projectId}/dashboard`,
    {
      params,
    },
  );

  return response.data;
};
