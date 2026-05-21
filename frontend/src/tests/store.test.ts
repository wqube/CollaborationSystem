import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it, vi } from 'vitest';
import authReducer, { clearAuth, setAuth } from '../shared/store/authSlice';
import {
  clearProjects,
  createProject,
  fetchProjects,
  projectsReducer,
} from '../shared/store/projectsSlice';
import type { ProjectSummary } from '../types/api';

vi.mock('../shared/api/project', () => ({
  getProjects: vi.fn(),
  createProjectApi: vi.fn(),
}));

import { createProjectApi, getProjects } from '../shared/api/project';

const user = {
  id: 'u1',
  displayName: 'Jane Smith',
  email: 'jane@example.com',
};

const project: ProjectSummary = {
  id: 'p1',
  name: 'Platform Team',
  description: 'Process improvements',
  role: 'Admin',
  lastAccessedAt: '2026-05-10T10:00:00Z',
};

describe('authSlice', () => {
  it('sets and clears current auth state', () => {
    const authenticated = authReducer(
      undefined,
      setAuth({ token: 'jwt', user }),
    );
    expect(authenticated).toEqual({
      accessToken: 'jwt',
      user,
      initialized: true,
    });

    expect(authReducer(authenticated, clearAuth())).toEqual({
      accessToken: null,
      user: null,
      initialized: true,
    });
  });
});

describe('projectsSlice', () => {
  it('loads projects and clears the list', async () => {
    vi.mocked(getProjects).mockResolvedValueOnce([project]);
    const store = configureStore({ reducer: { projects: projectsReducer } });

    await store.dispatch(fetchProjects());
    expect(store.getState().projects).toMatchObject({
      list: [project],
      loading: false,
      error: null,
    });

    store.dispatch(clearProjects());
    expect(store.getState().projects).toEqual({
      list: [],
      loading: false,
      error: null,
    });
  });

  it('stores load errors and appends newly created projects', async () => {
    vi.mocked(getProjects).mockRejectedValueOnce(new Error('offline'));
    vi.mocked(createProjectApi).mockResolvedValueOnce(project);
    const store = configureStore({ reducer: { projects: projectsReducer } });

    const failed = store.dispatch(fetchProjects());
    expect(store.getState().projects.loading).toBe(true);

    await failed;
    expect(store.getState().projects).toMatchObject({
      list: [],
      loading: false,
      error: 'offline',
    });

    await store.dispatch(createProject({ name: project.name }));
    expect(store.getState().projects.list).toEqual([project]);
  });
});
