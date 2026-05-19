import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  CommentDto,
  ProjectSummary,
  SuggestionDetails,
  SuggestionSummary,
} from '../types/api';

vi.mock('../shared/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '../shared/api/client';
import { login, logout, refresh } from '../shared/api/auth';
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from '../shared/api/comments';
import {
  deleteDraft,
  getProjectDrafts,
  saveCommentDraft,
  saveSuggestionDraft,
} from '../shared/api/drafts';
import { getDashboard } from '../shared/api/dashboard';
import {
  createProjectApi,
  deleteProjectApi,
  getProjects,
  updateProjectApi,
  updateProjectSettingsApi,
} from '../shared/api/project';
import {
  createSuggestion,
  deleteVote,
  getSuggestionDetails,
  getSuggestions,
  updateSuggestionStatus,
  updateSuggestionText,
  voteSuggestion,
} from '../shared/api/suggestions';
import { getUsers } from '../shared/api/users';

const mockedApi = vi.mocked(apiClient);

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

const suggestion: SuggestionSummary = {
  id: 's1',
  projectId: 'p1',
  text: 'Add retro action tracking',
  status: 'New',
  author: { id: 'u1', displayName: 'Jane Smith' },
  score: 5,
  currentUserVote: 'Up',
  createdAt: '2026-05-01T10:00:00Z',
  updatedAt: '2026-05-01T10:00:00Z',
};

const suggestionDetails: SuggestionDetails = {
  ...suggestion,
  votes: [],
};

const comment: CommentDto = {
  id: 'c1',
  suggestionId: 's1',
  parentCommentId: null,
  text: 'Important for the team',
  author: { id: 'u1', displayName: 'Jane Smith' },
  createdAt: '2026-05-01T11:00:00Z',
  updatedAt: '2026-05-01T11:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('auth api', () => {
  it('returns login and refresh payloads and calls logout endpoint', async () => {
    mockedApi.post
      .mockResolvedValueOnce({
        data: { accessToken: 'token-1', expiresIn: 3600, user },
      })
      .mockResolvedValueOnce({
        data: { accessToken: 'token-2', expiresIn: 3600, user },
      })
      .mockResolvedValueOnce({ data: undefined });

    await expect(
      login({ email: user.email, password: 'pass' }),
    ).resolves.toMatchObject({ accessToken: 'token-1' });
    await expect(refresh()).resolves.toMatchObject({ accessToken: 'token-2' });
    await expect(logout()).resolves.toBeUndefined();

    expect(mockedApi.post).toHaveBeenNthCalledWith(1, 'auth/login', {
      email: user.email,
      password: 'pass',
    });
    expect(mockedApi.post).toHaveBeenNthCalledWith(2, 'auth/refresh');
    expect(mockedApi.post).toHaveBeenNthCalledWith(3, 'auth/logout');
  });
});

describe('project and dashboard api', () => {
  it('maps project endpoints to response data', async () => {
    mockedApi.get
      .mockResolvedValueOnce({ data: { items: [project] } })
      .mockResolvedValueOnce({
        data: { items: [user], page: 1, pageSize: 10, total: 1 },
      });
    mockedApi.post.mockResolvedValueOnce({ data: project });
    mockedApi.patch
      .mockResolvedValueOnce({ data: { ...project, name: 'Updated' } })
      .mockResolvedValueOnce({
        data: { votesPerUser: 5, voteResetPeriodDays: 14 },
      });
    mockedApi.delete.mockResolvedValueOnce({ data: undefined });

    await expect(getProjects()).resolves.toEqual([project]);
    await expect(createProjectApi({ name: project.name })).resolves.toBe(
      project,
    );
    await expect(
      updateProjectApi(project.id, { name: 'Updated' }),
    ).resolves.toMatchObject({ name: 'Updated' });
    await expect(
      updateProjectSettingsApi(project.id, {
        votesPerUser: 5,
        voteResetPeriodDays: 14,
      }),
    ).resolves.toEqual({ votesPerUser: 5, voteResetPeriodDays: 14 });
    await expect(deleteProjectApi(project.id)).resolves.toBeUndefined();
    await expect(getUsers({ search: 'Jane' })).resolves.toMatchObject({
      items: [user],
    });

    expect(mockedApi.get).toHaveBeenNthCalledWith(1, '/projects');
    expect(mockedApi.post).toHaveBeenCalledWith('/projects', {
      name: project.name,
    });
    expect(mockedApi.patch).toHaveBeenNthCalledWith(1, '/projects/p1', {
      name: 'Updated',
    });
    expect(mockedApi.patch).toHaveBeenNthCalledWith(
      2,
      '/projects/p1/settings',
      { votesPerUser: 5, voteResetPeriodDays: 14 },
    );
    expect(mockedApi.delete).toHaveBeenCalledWith('/projects/p1');
    expect(mockedApi.get).toHaveBeenNthCalledWith(2, '/users', {
      params: { search: 'Jane' },
    });
  });

  it('requests dashboard with params', async () => {
    const dashboard = {
      project,
      voteSettings: { votesPerUser: 3, voteResetPeriodDays: 14 },
      currentUserVoteQuota: {
        votesLimit: 3,
        votesRemaining: 2,
        nextResetAt: '2026-05-15T00:00:00Z',
      },
      membersPreview: [],
      suggestions: { items: [suggestion], page: 1, pageSize: 20, total: 1 },
    };
    mockedApi.get.mockResolvedValueOnce({ data: dashboard });

    await expect(getDashboard('p1', { status: 'New' })).resolves.toBe(
      dashboard,
    );
    expect(mockedApi.get).toHaveBeenCalledWith('/projects/p1/dashboard', {
      params: { status: 'New' },
    });
  });
});

describe('suggestion api', () => {
  it('maps list, details, create, update, status and vote calls', async () => {
    mockedApi.get
      .mockResolvedValueOnce({
        data: { items: [suggestion], page: 1, pageSize: 10, total: 1 },
      })
      .mockResolvedValueOnce({ data: suggestionDetails });
    mockedApi.post.mockResolvedValueOnce({ data: suggestion });
    mockedApi.patch
      .mockResolvedValueOnce({ data: suggestionDetails })
      .mockResolvedValueOnce({ data: { ...suggestion, text: 'Updated' } });
    mockedApi.put.mockResolvedValueOnce({
      data: {
        suggestionId: 's1',
        currentUserVote: 'Down',
        score: 4,
        voteQuota: {
          votesLimit: 3,
          votesRemaining: 1,
          nextResetAt: '2026-05-15T00:00:00Z',
        },
      },
    });
    mockedApi.delete.mockResolvedValueOnce({
      data: { suggestionId: 's1', currentUserVote: null, score: 5 },
    });

    await expect(
      getSuggestions('p1', { status: 'New', sort: 'score' }),
    ).resolves.toMatchObject({ items: [suggestion] });
    await expect(
      createSuggestion('p1', { text: suggestion.text }),
    ).resolves.toBe(suggestion);
    await expect(getSuggestionDetails('p1', 's1')).resolves.toBe(
      suggestionDetails,
    );
    await expect(
      updateSuggestionStatus('p1', 's1', { status: 'InProgress' }),
    ).resolves.toBe(suggestionDetails);
    await expect(
      updateSuggestionText('p1', 's1', { text: 'Updated' }),
    ).resolves.toMatchObject({ text: 'Updated' });
    await expect(
      voteSuggestion('p1', 's1', { voteType: 'Down' }),
    ).resolves.toMatchObject({ currentUserVote: 'Down' });
    await expect(deleteVote('p1', 's1')).resolves.toMatchObject({
      currentUserVote: null,
    });

    expect(mockedApi.get).toHaveBeenNthCalledWith(
      1,
      '/projects/p1/suggestions',
      { params: { status: 'New', sort: 'score' } },
    );
    expect(mockedApi.post).toHaveBeenCalledWith('/projects/p1/suggestions', {
      text: suggestion.text,
    });
    expect(mockedApi.get).toHaveBeenNthCalledWith(
      2,
      '/projects/p1/suggestions/s1',
    );
    expect(mockedApi.patch).toHaveBeenNthCalledWith(
      1,
      '/projects/p1/suggestions/s1/status',
      { status: 'InProgress' },
    );
    expect(mockedApi.patch).toHaveBeenNthCalledWith(
      2,
      '/projects/p1/suggestions/s1',
      { text: 'Updated' },
    );
    expect(mockedApi.put).toHaveBeenCalledWith(
      '/projects/p1/suggestions/s1/vote',
      { voteType: 'Down' },
    );
    expect(mockedApi.delete).toHaveBeenCalledWith(
      '/projects/p1/suggestions/s1/vote',
    );
  });
});

describe('comments and drafts api', () => {
  it('maps comment endpoints', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: comment });
    mockedApi.get.mockResolvedValueOnce({ data: [comment] });
    mockedApi.patch.mockResolvedValueOnce({
      data: { ...comment, text: 'Updated comment' },
    });
    mockedApi.delete.mockResolvedValueOnce({ data: undefined });

    await expect(
      createComment('p1', 's1', { text: comment.text, parentCommentId: null }),
    ).resolves.toBe(comment);
    await expect(getComments('p1', 's1')).resolves.toEqual([comment]);
    await expect(
      updateComment('p1', 'c1', { text: 'Updated comment' }),
    ).resolves.toMatchObject({ text: 'Updated comment' });
    await expect(deleteComment('p1', 'c1')).resolves.toBeUndefined();

    expect(mockedApi.post).toHaveBeenCalledWith(
      '/projects/p1/suggestions/s1/comments',
      { text: comment.text, parentCommentId: null },
    );
    expect(mockedApi.get).toHaveBeenCalledWith(
      '/projects/p1/suggestions/s1/comments',
    );
    expect(mockedApi.patch).toHaveBeenCalledWith('/projects/p1/comments/c1', {
      text: 'Updated comment',
    });
    expect(mockedApi.delete).toHaveBeenCalledWith('/projects/p1/comments/c1');
  });

  it('maps draft endpoints', async () => {
    const draft = {
      id: 'd1',
      projectId: 'p1',
      type: 'Suggestion' as const,
      updatedAt: '2026-05-01T10:00:00Z',
      payload: { text: 'Draft text' },
    };
    mockedApi.get.mockResolvedValueOnce({
      data: { items: [draft], page: 1, pageSize: 10, total: 1 },
    });
    mockedApi.put.mockResolvedValueOnce({ data: draft }).mockResolvedValueOnce({
      data: {
        ...draft,
        type: 'Comment',
        payload: {
          suggestionId: 's1',
          parentCommentId: null,
          text: 'Draft comment',
        },
      },
    });
    mockedApi.delete.mockResolvedValueOnce({ data: undefined });

    await expect(
      getProjectDrafts('p1', { type: 'Suggestion' }),
    ).resolves.toMatchObject({ items: [draft] });
    await expect(
      saveSuggestionDraft('p1', 'd1', { text: 'Draft text' }),
    ).resolves.toBe(draft);
    await expect(
      saveCommentDraft('p1', 'd2', {
        suggestionId: 's1',
        parentCommentId: null,
        text: 'Draft comment',
      }),
    ).resolves.toMatchObject({ type: 'Comment' });
    await expect(deleteDraft('p1', 'd1')).resolves.toBeUndefined();

    expect(mockedApi.get).toHaveBeenCalledWith('/projects/p1/drafts', {
      params: { type: 'Suggestion' },
    });
    expect(mockedApi.put).toHaveBeenNthCalledWith(
      1,
      '/projects/p1/drafts/suggestion/d1',
      { text: 'Draft text' },
    );
    expect(mockedApi.put).toHaveBeenNthCalledWith(
      2,
      '/projects/p1/drafts/comment/d2',
      { suggestionId: 's1', parentCommentId: null, text: 'Draft comment' },
    );
    expect(mockedApi.delete).toHaveBeenCalledWith('/projects/p1/drafts/d1');
  });
});
