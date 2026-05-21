import apiClient from './client';
import type {
  ProjectSummary,
  CreateProjectRequest,
  ProjectVoteSettings,
  UpdateProjectSettingsRequest,
  UpdateProjectRequest,
} from '../../types/api';

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

export const deleteProjectApi = async (projectId: string): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}`);
};

export const updateProjectApi = async (
  projectId: string,
  data: UpdateProjectRequest,
): Promise<ProjectSummary> => {
  const response = await apiClient.patch<ProjectSummary>(
    `/projects/${projectId}`,
    data,
  );

  return response.data;
};

export const updateProjectSettingsApi = async (
  projectId: string,
  data: UpdateProjectSettingsRequest,
): Promise<ProjectVoteSettings> => {
  const response = await apiClient.patch<ProjectVoteSettings>(
    `/projects/${projectId}/settings`,
    data,
  );

  return response.data;
};
