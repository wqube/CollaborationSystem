import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import { Badge } from '../ui/Badge/Badge';
import apiClient from '../../shared/api/client';
import { getUsers } from '../../shared/api/users';
import type {
  ProjectDetails,
  ProjectMemberDto,
  ProjectRole,
  UserListItem,
} from '../../types/api';
import { getProjectRoleBadgeVariant } from '../../shared/utils/projectRole';
import { ROLE_LABELS } from '../../shared/utils/statusLabels';
import styles from '../MembersModal/MembersModal.module.css';

interface MembersModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  canManageMembers: boolean;
  canManageRoles: boolean;
}

export function MembersModal({
  open,
  onClose,
  projectId,
  canManageMembers,
  canManageRoles,
}: MembersModalProps) {
  const [members, setMembers] = useState<ProjectMemberDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newRole, setNewRole] = useState<ProjectRole>('Member');

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<ProjectDetails>(`/projects/${projectId}`);
      setMembers(res.data.members || []);
    } catch {
      setError('Не удалось загрузить участников');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!open || !projectId) return;
    loadMembers();
  }, [open, projectId, loadMembers]);

  useEffect(() => {
    if (open) return;
    setUserSearch('');
    setUsers([]);
    setSelectedUserId('');
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open || !canManageMembers) return;
    let ignore = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        setUsersLoading(true);
        const search = userSearch.trim();
        const response = await getUsers({
          search: search || undefined,
          page: 1,
          pageSize: 20,
        });
        if (!ignore) {
          setUsers(response.items);
        }
      } catch {
        if (!ignore) {
          setError('Не удалось загрузить пользователей');
        }
      } finally {
        if (!ignore) {
          setUsersLoading(false);
        }
      }
    }, 300);
    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [open, canManageMembers, userSearch]);

  const memberIds = useMemo(
    () => new Set(members.map((member) => member.userId)),
    [members],
  );

  const availableUsers = useMemo(
    () => users.filter((user) => !memberIds.has(user.id)),
    [users, memberIds],
  );

  useEffect(() => {
    if (
      selectedUserId &&
      !availableUsers.some((user) => user.id === selectedUserId)
    ) {
      setSelectedUserId('');
    }
  }, [availableUsers, selectedUserId]);

  const handleAddMember = async () => {
    if (!canManageMembers) return;
    if (!selectedUserId) {
      setError('Выберите пользователя из списка');
      return;
    }
    try {
      setAdding(true);
      setError(null);
      await apiClient.post(`/projects/${projectId}/members`, {
        userId: selectedUserId,
        role: newRole,
      });
      await loadMembers();
      setUserSearch('');
      setSelectedUserId('');
      setUsers([]);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      setError(
        status === 409
          ? 'Этот пользователь уже добавлен в проект'
          : 'Не удалось добавить участника',
      );
    } finally {
      setAdding(false);
    }
  };

  const handleChangeRole = async (userId: string, role: ProjectRole) => {
    if (!canManageRoles) return;
    try {
      await apiClient.patch(`/projects/${projectId}/members/${userId}`, {
        role,
      });
      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, role } : m)),
      );
    } catch {
      setError('Не удалось изменить роль');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!canManageMembers) return;
    try {
      await apiClient.delete(`/projects/${projectId}/members/${userId}`);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch {
      setError('Не удалось удалить участника');
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  return (
    <Modal isOpen={open} onClose={onClose} title="Участники проекта" size="lg">
      <div className={styles.content}>
        {canManageMembers && (
          <div className={styles.addSection}>
            <h4>Добавить участника</h4>
            <div className={styles.addForm}>
              <div className={styles.userPicker}>
                <input
                  type="text"
                  placeholder="Поиск по имени или email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setError(null);
                  }}
                  className={styles.searchInput}
                />
                <select
                  className={styles.userSelect}
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value);
                    setError(null);
                  }}
                  disabled={usersLoading || availableUsers.length === 0}
                >
                  <option value="">
                    {usersLoading ? 'Поиск...' : 'Выберите пользователя'}
                  </option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName} · {user.email}
                    </option>
                  ))}
                </select>
                {!usersLoading &&
                  users.length > 0 &&
                  availableUsers.length === 0 && (
                    <span className={styles.helperText}>
                      Все найденные пользователи уже в проекте
                    </span>
                  )}
              </div>
              <select
                className={styles.roleSelect}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as ProjectRole)}
              >
                <option value="Member">{ROLE_LABELS.Member}</option>
                <option value="Admin">{ROLE_LABELS.Admin}</option>
              </select>
              <Button
                variant="primary"
                onClick={handleAddMember}
                disabled={adding || !selectedUserId}
              >
                {adding ? 'Добавление...' : 'Добавить'}
              </Button>
            </div>
          </div>
        )}

        {error && <p className={styles.errorText}>{error}</p>}
        {loading && <p>Загрузка...</p>}

        <hr />

        <h4>Текущие участники ({members.length})</h4>
        <div className={styles.membersList}>
          {members.map((member) => (
            <div key={member.userId} className={styles.memberItem}>
              <div className={styles.memberInfo}>
                <div className={styles.avatar}>
                  {member.displayName
                    .split(' ')
                    .map((w) => w[0])
                    .join('')}
                </div>
                <div>
                  <strong>{member.displayName}</strong>
                  <span className={styles.email}>{member.email}</span>
                  <span className={styles.joined}>
                    Присоединился: {formatDate(member.joinedAt)}
                  </span>
                </div>
              </div>
              <div className={styles.memberActions}>
                <Badge variant={getProjectRoleBadgeVariant(member.role)} />
                {canManageRoles && (
                  <>
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleChangeRole(
                          member.userId,
                          e.target.value as ProjectRole,
                        )
                      }
                      className={styles.roleSelectSm}
                    >
                      <option value="Admin">{ROLE_LABELS.Admin}</option>
                      <option value="Member">{ROLE_LABELS.Member}</option>
                    </select>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemoveMember(member.userId)}
                    >
                      X
                    </button>
                  </>
                )}
                {!canManageRoles && canManageMembers && (
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemoveMember(member.userId)}
                  >
                    X
                  </button>
                )}
              </div>
            </div>
          ))}
          {!loading && members.length === 0 && (
            <p className={styles.emptyText}>Нет участников</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
