import { describe, expect, it } from 'vitest';
import {
  canManageProjectMembers,
  canManageProjectRoles,
  canManageProjectSettings,
  getProjectRoleBadgeVariant,
} from '../shared/utils/projectRole';
import {
  DRAFTS_TAB_LABEL,
  ROLE_LABELS,
  STATUS_LABELS,
} from '../shared/utils/statusLabels';
import { findCommentDraft, findDraftById } from '../shared/api/drafts';
import {
  getApiProblem,
  getProjectCreateErrorMessage,
  getSuggestionCreateErrorMessage,
  isConflictError,
} from '../shared/api/errors';
import {
  getVoteQuotaFromError,
  isVoteLimitExceededError,
} from '../shared/api/suggestions';
import type { DraftDTO } from '../types/api';

describe('project role helpers and labels', () => {
  it('recognizes admin-only permissions and badge variants', () => {
    expect(getProjectRoleBadgeVariant('Admin')).toBe('admin');
    expect(getProjectRoleBadgeVariant('Member')).toBe('member');

    expect(canManageProjectSettings('Admin')).toBe(true);
    expect(canManageProjectMembers('Admin')).toBe(true);
    expect(canManageProjectRoles('Admin')).toBe(true);

    expect(canManageProjectSettings('Member')).toBe(false);
    expect(canManageProjectMembers(null)).toBe(false);
    expect(canManageProjectRoles(undefined)).toBe(false);
  });

  it('exports labels for all statuses, roles and drafts tab', () => {
    expect(Object.keys(STATUS_LABELS)).toEqual([
      'New',
      'InProgress',
      'Accepted',
      'Rejected',
    ]);
    expect(Object.keys(ROLE_LABELS)).toEqual(['Admin', 'Member']);
    expect(DRAFTS_TAB_LABEL).toBeTruthy();
  });
});

describe('draft helpers', () => {
  const drafts: DraftDTO[] = [
    {
      id: 'suggestion-draft',
      projectId: 'p1',
      type: 'Suggestion',
      updatedAt: '2026-05-01T10:00:00Z',
      payload: { text: 'Improve planning' },
    },
    {
      id: 'comment-draft',
      projectId: 'p1',
      type: 'Comment',
      updatedAt: '2026-05-01T11:00:00Z',
      payload: {
        suggestionId: 's1',
        parentCommentId: null,
        text: 'Looks useful',
      },
    },
    {
      id: 'reply-draft',
      projectId: 'p1',
      type: 'Comment',
      updatedAt: '2026-05-01T12:00:00Z',
      payload: {
        suggestionId: 's1',
        parentCommentId: 'c1',
        text: 'Reply text',
      },
    },
  ];

  it('finds drafts by id and comment context', () => {
    expect(findDraftById(drafts, 'suggestion-draft')?.type).toBe('Suggestion');
    expect(findDraftById(drafts, 'missing')).toBeUndefined();

    expect(findCommentDraft(drafts, 's1', null)?.id).toBe('comment-draft');
    expect(findCommentDraft(drafts, 's1', 'c1')?.id).toBe('reply-draft');
    expect(findCommentDraft(drafts, 's2', null)).toBeUndefined();
  });
});

describe('api error helpers', () => {
  it('extracts problem details and maps conflicts to user messages', () => {
    const conflict = { response: { status: 409, data: { title: 'Conflict' } } };
    const serverError = { response: { status: 500, data: { title: 'Oops' } } };

    expect(getApiProblem(conflict)).toEqual({ status: 409, title: 'Conflict' });
    expect(isConflictError(conflict)).toBe(true);
    expect(isConflictError(serverError)).toBe(false);
    expect(getProjectCreateErrorMessage(conflict)).not.toBe(
      getProjectCreateErrorMessage(serverError),
    );
    expect(getSuggestionCreateErrorMessage(conflict)).not.toBe(
      getSuggestionCreateErrorMessage(serverError),
    );
  });

  it('detects vote limit errors and exposes quota from problem details', () => {
    const quota = {
      votesLimit: 3,
      votesRemaining: 0,
      nextResetAt: '2026-05-15T00:00:00Z',
    };
    const byCode = {
      response: {
        status: 409,
        data: { code: 'VoteLimitExceeded', voteQuota: quota },
      },
    };
    const byTitle = {
      response: {
        status: 409,
        data: { title: 'Vote limit exceeded.' },
      },
    };

    expect(isVoteLimitExceededError(byCode)).toBe(true);
    expect(isVoteLimitExceededError(byTitle)).toBe(true);
    expect(isVoteLimitExceededError({ response: { status: 400 } })).toBe(false);
    expect(getVoteQuotaFromError(byCode)).toBe(quota);
    expect(getVoteQuotaFromError(new Error('network'))).toBeNull();
  });
});
