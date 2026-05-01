import apiClient from './client';
import type {
  SuggestionSummary,
  SuggestionDetails,
  SuggestionStatus,
  SuggestionSort,
  OrderSort,
} from '../../types/api';

export interface GetSuggestionsParams {
  status?: SuggestionStatus;
  search?: string;
  sort?: SuggestionSort;
  order?: OrderSort;
  page?: number;
  pageSize?: number;
}

export interface SuggestionResponce {
  item: SuggestionSummary[];
  page: number;
  pageSize: number;
  total: number;
}

export const getSuggestions = async (
  projectId: string,
  params?: GetSuggestionsParams,
): Promise<SuggestionResponce> => {
  const responce = await apiClient.get<SuggestionResponce>(
    `/projects/${projectId}/suggestions`,
    { params },
  );
  return responce.data;
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
