import {
  createSlice,
  type PayloadAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import apiClient from '../api/client';
import type { ProjectSummary, CreateProjectRequest } from '../../types/api';

interface ProjectsState {
  list: ProjectSummary[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk<ProjectSummary[]>(
  'projects/fetchAll',
  async () => {
    const response = await apiClient.get<{ items: ProjectSummary[] }>(
      '/projects',
    );
    return response.data.items;
  },
);

export const createProject = createAsyncThunk<
  ProjectSummary,
  CreateProjectRequest
>('projects/create', async (newProject) => {
  const response = await apiClient.post<ProjectSummary>(
    '/projects',
    newProject,
  );
  return response.data;
});

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProjects.fulfilled,
        (state, action: PayloadAction<ProjectSummary[]>) => {
          state.list = action.payload;
          state.loading = false;
        },
      )
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки проектов';
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.list.push(action.payload);
      });
  },
});

export const projectsReducer = projectsSlice.reducer;
