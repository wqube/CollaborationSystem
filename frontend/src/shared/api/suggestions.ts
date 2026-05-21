import apiClient from './client';
import type {
  SuggestionSummary,
  SuggestionDetails,
  SuggestionStatus,
  SuggestionSort,
  OrderSort,
  VoteType,
  CurrentUserVoteQuota,
  CreateSuggestionRequest,
  UpdateSuggestionRequest,
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
  voteQuota: CurrentUserVoteQuota;
}

interface VoteLimitProblemDetails {
  status?: number;
  code?: string;
  title?: string;
  voteQuota?: CurrentUserVoteQuota;
}

export const getVoteQuotaFromError = (
  error: unknown,
): CurrentUserVoteQuota | null => {
  const data = (error as { response?: { data?: VoteLimitProblemDetails } })
    ?.response?.data;

  return data?.voteQuota ?? null;
};

export const isVoteLimitExceededError = (error: unknown): boolean => {
  const response = (
    error as { response?: { status?: number; data?: VoteLimitProblemDetails } }
  )?.response;

  return (
    response?.status === 409 &&
    (response.data?.code === 'VoteLimitExceeded' ||
      response.data?.title === 'Vote limit exceeded.')
  );
};

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

export const createSuggestion = async (
  projectId: string,
  payload: CreateSuggestionRequest,
): Promise<SuggestionSummary> => {
  const response = await apiClient.post<SuggestionSummary>(
    `/projects/${projectId}/suggestions`,
    payload,
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

export const updateSuggestionText = async (
  projectId: string,
  suggestionId: string,
  data: UpdateSuggestionRequest,
): Promise<SuggestionSummary> => {
  const res = await apiClient.patch<SuggestionSummary>(
    `/projects/${projectId}/suggestions/${suggestionId}`,
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
