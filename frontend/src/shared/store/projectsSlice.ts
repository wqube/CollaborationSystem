import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';

import { getProjects, createProjectApi } from '../../shared/api/project';

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

export const fetchProjects = createAsyncThunk('projects/fetchAll', async () => {
  return await getProjects();
});

export const createProject = createAsyncThunk<
  ProjectSummary,
  CreateProjectRequest
>('projects/create', async (newProject) => {
  return await createProjectApi(newProject);
});

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjects: (state) => {
      state.list = [];
      state.loading = false;
      state.error = null;
    },
  },

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

export const { clearProjects } = projectsSlice.actions;
export const projectsReducer = projectsSlice.reducer;
