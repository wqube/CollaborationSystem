import apiClient from './client';
import type { ProjectSummary, CreateProjectRequest } from '../../types/api';

export const getProjects = async (): Promise<ProjectSummary[]> => {
  const response = await apiClient.get<{ items: ProjectSummary[] }>(
    '/projects',
  );
  return response.data.items;
};

export const createProjectApi = async (
  data: CreateProjectRequest,
): Promise<ProjectSummary> => {
  const response = await apiClient.post<ProjectSummary>('/projects', data);
  return response.data;
};
