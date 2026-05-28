import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MembersModal } from '../components/MembersModal/MembersModal';

vi.mock('../shared/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../shared/api/users', () => ({
  getUsers: vi.fn().mockResolvedValue({
    items: [],
    page: 1,
    pageSize: 20,
    total: 0,
  }),
}));

const dispatchMock = vi.fn();

vi.mock('../shared/store/hooks', () => ({
  useAppDispatcher: () => dispatchMock,
  userAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { user: { id: 'current-user' } } }),
}));

vi.mock('../shared/store/projectsSlice', () => ({
  fetchProjects: vi.fn(() => ({ type: 'projects/fetch' })),
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

import apiClient from '../shared/api/client';

const mockedApi = vi.mocked(apiClient);

const projectDetails = {
  id: 'p1',
  name: 'Platform Team',
  description: 'Process improvements',
  createdByUserId: 'owner-id',
  createdAtUtc: '2026-05-01T10:00:00Z',
  updatedAtUtc: '2026-05-01T10:00:00Z',
  voteSettings: { votesPerUser: 3, voteResetPeriodDays: 14 },
  currentUserVoteQuota: {
    votesLimit: 3,
    votesRemaining: 3,
    nextResetAt: '2026-05-15T00:00:00Z',
  },
  members: [
    {
      projectId: 'p1',
      userId: 'member-1',
      displayName: 'Test User',
      email: 'test@test.local',
      role: 'Admin',
      joinedAt: '2026-05-03T00:00:00Z',
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedApi.get.mockResolvedValue({ data: projectDetails });
  mockedApi.patch.mockResolvedValue({
    data: {
      ...projectDetails.members[0],
      role: 'Member',
    },
  });
});

describe('MembersModal role change confirmation', () => {
  it('asks for confirmation before changing the member role and patches only after approve', async () => {
    render(
      <MembersModal
        open
        onClose={vi.fn()}
        projectId="p1"
        canManageMembers={false}
        canManageRoles
      />,
    );

    await screen.findByText('Test User');

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Member');

    expect(
      await screen.findByText('Подтверждение смены роли'),
    ).toBeInTheDocument();
    expect(mockedApi.patch).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Да' }));

    await waitFor(() => {
      expect(mockedApi.patch).toHaveBeenCalledWith(
        '/projects/p1/members/member-1',
        { role: 'Member' },
      );
    });
  });

  it('allows cancelling role change without sending the patch request', async () => {
    render(
      <MembersModal
        open
        onClose={vi.fn()}
        projectId="p1"
        canManageMembers={false}
        canManageRoles
      />,
    );

    await screen.findByText('Test User');

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Member');
    expect(
      await screen.findByText('Подтверждение смены роли'),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Нет' }));

    await waitFor(() => {
      expect(
        screen.queryByText('Подтверждение смены роли'),
      ).not.toBeInTheDocument();
    });
    expect(mockedApi.patch).not.toHaveBeenCalled();
  });
});
