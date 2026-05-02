import apiClient from './client';
import type {
  SuggestionSummary,
  SuggestionDetails,
  SuggestionStatus,
  SuggestionSort,
  OrderSort,
  VoteType,
} from '../../types/api';

export interface GetSuggestionsParams {
  status?: SuggestionStatus;
  search?: string;
  sort?: SuggestionSort;
  order?: OrderSort;
  page?: number;
  pageSize?: number;
}

export interface SuggestionResponse {
  items: SuggestionSummary[];
  page: number;
  pageSize: number;
  total: number;
}

export interface UpdateSuggestionStatusRequest {
  status: SuggestionStatus;
}

export interface VoteRequest {
  voteType: VoteType;
}

export interface VoteResponse {
  suggestionId: string;
  currentUserVote: VoteType | null;
  score: number;
}

export const getSuggestions = async (
  projectId: string,
  params?: GetSuggestionsParams,
): Promise<SuggestionResponse> => {
  const response = await apiClient.get<SuggestionResponse>(
    `/projects/${projectId}/suggestions`,
    { params },
  );
  return response.data;
};

export const getSuggestionDetails = async (
  projectId: string,
  suggestionId: string,
): Promise<SuggestionDetails> => {
  const res = await apiClient.get<SuggestionDetails>(
    `/projects/${projectId}/suggestions/${suggestionId}`,
  );
  return res.data;
};

// изменить статус предложения (только для админов проекта)
export const updateSuggestionStatus = async (
  projectId: string,
  suggestionId: string,
  data: UpdateSuggestionStatusRequest,
): Promise<SuggestionDetails> => {
  const res = await apiClient.patch<SuggestionDetails>(
    `/projects/${projectId}/suggestions/${suggestionId}/status`,
    data,
  );
  return res.data;
};

// Создать или заменить голос за предложение
export const voteSuggestion = async (
  projectId: string,
  suggestionId: string,
  data: VoteRequest,
): Promise<VoteResponse> => {
  const res = await apiClient.put<VoteResponse>(
    `/projects/${projectId}/suggestions/${suggestionId}/vote`,
    data,
  );
  return res.data;
};

// Отменить текущий голос пользователя
export const deleteVote = async (
  projectId: string,
  suggestionId: string,
): Promise<VoteResponse> => {
  const res = await apiClient.delete<VoteResponse>(
    `/projects/${projectId}/suggestions/${suggestionId}/vote`,
  );
  return res.data;
};
