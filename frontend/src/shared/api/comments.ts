import type {
  CommentDto,
  CreateCommentRequest,
  UpdateCommentRequest,
} from '../../types/api';
import apiClient from './client';

export const createComment = async (
  projectId: string,
  suggestionId: string,
  data: CreateCommentRequest,
): Promise<CommentDto> => {
  const responce = await apiClient.post<CommentDto>(
    `/projects/${projectId}/suggestions/${suggestionId}/comments`,
    data,
  );
  return responce.data;
};

export const getComments = async (
  projectId: string,
  suggestionId: string,
): Promise<CommentDto[]> => {
  const responce = await apiClient.get<CommentDto[]>(
    `/projects/${projectId}/suggestions/${suggestionId}/comments`,
  );
  return responce.data;
};

export const updateComment = async (
  projectId: string,
  commentId: string,
  data: UpdateCommentRequest,
): Promise<CommentDto> => {
  const responce = await apiClient.patch<CommentDto>(
    `/projects/${projectId}/comments/${commentId}`,
    data,
  );
  return responce.data;
};

export const deleteComment = async (
  projectId: string,
  commentId: string,
): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}/comments/${commentId}`);
};
