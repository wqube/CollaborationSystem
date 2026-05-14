import apiClient from './client';
import type {
  DraftDTO,
  SaveSuggestionDraftRequest,
  SaveCommentDraftRequest,
  CommentDraft,
} from '../../types/api';

export interface GetDraftsParams {
  type?: 'Suggestion' | 'Comment';
  page?: number;
  pageSize?: number;
}

export interface DraftsResponse {
  items: DraftDTO[];
  page: number;
  pageSize: number;
  total: number;
}

// Получить список черновиков проекта
export const getProjectDrafts = async (
  projectId: string,
  params?: GetDraftsParams,
): Promise<DraftsResponse> => {
  const response = await apiClient.get<DraftsResponse>(
    `/projects/${projectId}/drafts`,
    { params },
  );
  return response.data;
};

// Получить черновик комментария
export const findCommentDraft = (
  drafts: DraftDTO[],
  suggestionId: string,
  parentCommentId: string | null,
): CommentDraft | undefined => {
  return drafts.find(
    (d): d is CommentDraft =>
      d.type === 'Comment' &&
      d.payload.suggestionId === suggestionId &&
      d.payload.parentCommentId === parentCommentId,
  );
};

// Сохранить черновик предложения
export const saveSuggestionDraft = async (
  projectId: string,
  draftId: string,
  payload: SaveSuggestionDraftRequest,
): Promise<DraftDTO> => {
  const response = await apiClient.put<DraftDTO>(
    `/projects/${projectId}/drafts/suggestion/${draftId}`,
    payload,
  );
  return response.data;
};

// Сохранить черновик комментария
export const saveCommentDraft = async (
  projectId: string,
  draftId: string,
  payload: SaveCommentDraftRequest,
): Promise<DraftDTO> => {
  const response = await apiClient.put<DraftDTO>(
    `/projects/${projectId}/drafts/comment/${draftId}`,
    payload,
  );
  return response.data;
};

// Удалить черновик
export const deleteDraft = async (
  projectId: string,
  draftId: string,
): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}/drafts/${draftId}`);
};

// Найти черновик по ID в списке
export const findDraftById = (
  drafts: DraftDTO[],
  draftId: string,
): DraftDTO | undefined => {
  return drafts.find((d) => d.id === draftId);
};
