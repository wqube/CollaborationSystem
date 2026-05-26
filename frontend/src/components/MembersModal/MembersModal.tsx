import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import { Badge } from '../ui/Badge/Badge';
import apiClient from '../../shared/api/client';
import { getUsers } from '../../shared/api/users';
import { useAppDispatcher } from '../../shared/store/hooks';
import { fetchProjects } from '../../shared/store/projectsSlice';
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
  const dispatch = useAppDispatcher();
  const navigate = useNavigate();
  const [members, setMembers] = useState<ProjectMemberDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newRole, setNewRole] = useState<ProjectRole>('Member');
  const [roleChangeConfirmation, setRoleChangeConfirmation] = useState<{
    userId: string;
    displayName: string;
    role: ProjectRole;
  } | null>(null);
  const [roleChanging, setRoleChanging] = useState(false);
  const [removeMemberConfirmation, setRemoveMemberConfirmation] = useState<{
    userId: string;
    displayName: string;
  } | null>(null);
  const [memberRemoving, setMemberRemoving] = useState(false);
  const [leaveConfirmationOpen, setLeaveConfirmationOpen] = useState(false);
  const [leavingProject, setLeavingProject] = useState(false);
  const canLeaveProject = !canManageMembers;

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
    setRoleChangeConfirmation(null);
    setRemoveMemberConfirmation(null);
    setLeaveConfirmationOpen(false);
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

  const handleChangeRoleRequest = (userId: string, role: ProjectRole) => {
    if (!canManageRoles) return;
    const member = members.find((item) => item.userId === userId);
    if (member?.role === role) return;

    setError(null);
    setRoleChangeConfirmation({
      userId,
      displayName: member?.displayName ?? 'пользователя',
      role,
    });
  };

  const handleConfirmRoleChange = async () => {
    if (!roleChangeConfirmation) return;

    try {
      setRoleChanging(true);
      setError(null);
      const { userId, role } = roleChangeConfirmation;
      await apiClient.patch(`/projects/${projectId}/members/${userId}`, {
        role,
      });
      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, role } : m)),
      );
      setRoleChangeConfirmation(null);
    } catch {
      setRoleChangeConfirmation(null);
      setError('Не удалось изменить роль');
    } finally {
      setRoleChanging(false);
    }
  };

  const handleCancelRoleChange = () => {
    if (roleChanging) return;
    setRoleChangeConfirmation(null);
  };

  const handleRemoveMemberRequest = (userId: string) => {
    if (!canManageMembers) return;
    const member = members.find((item) => item.userId === userId);

    setError(null);
    setRemoveMemberConfirmation({
      userId,
      displayName: member?.displayName ?? 'пользователя',
    });
  };

  const handleConfirmRemoveMember = async () => {
    if (!removeMemberConfirmation) return;

    try {
      setMemberRemoving(true);
      setError(null);
      const { userId } = removeMemberConfirmation;
      await apiClient.delete(`/projects/${projectId}/members/${userId}`);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      setRemoveMemberConfirmation(null);
    } catch {
      setRemoveMemberConfirmation(null);
      setError('Не удалось удалить участника');
    } finally {
      setMemberRemoving(false);
    }
  };

  const handleCancelRemoveMember = () => {
    if (memberRemoving) return;
    setRemoveMemberConfirmation(null);
  };

  const handleLeaveProjectRequest = () => {
    setError(null);
    setLeaveConfirmationOpen(true);
  };

  const handleCancelLeaveProject = () => {
    if (leavingProject) return;
    setLeaveConfirmationOpen(false);
  };

  const handleConfirmLeaveProject = async () => {
    try {
      setLeavingProject(true);
      setError(null);
      await apiClient.delete(`/projects/${projectId}/members/me`);
      setLeaveConfirmationOpen(false);
      onClose();
      await dispatch(fetchProjects());
      navigate('/projects');
    } catch {
      setLeaveConfirmationOpen(false);
      setError('Не удалось выйти из проекта');
    } finally {
      setLeavingProject(false);
    }
  };

  const handleMembersModalClose = () => {
    if (roleChangeConfirmation) {
      handleCancelRoleChange();
      return;
    }

    if (removeMemberConfirmation) {
      handleCancelRemoveMember();
      return;
    }

    if (leaveConfirmationOpen) {
      handleCancelLeaveProject();
      return;
    }

    onClose();
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  return (
    <>
      <Modal
        isOpen={open}
        onClose={handleMembersModalClose}
        title="Участники проекта"
        size="lg"
      >
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
                  {(canManageRoles && (
                    <>
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleChangeRoleRequest(
                            member.userId,
                            e.target.value as ProjectRole,
                          )
                        }
                        className={styles.roleSelectSm}
                        disabled={roleChanging}
                      >
                        <option value="Admin">{ROLE_LABELS.Admin}</option>
                        <option value="Member">{ROLE_LABELS.Member}</option>
                      </select>
                      <button
                        className={styles.removeBtn}
                        onClick={() => handleRemoveMemberRequest(member.userId)}
                        disabled={memberRemoving}
                      >
                        X
                      </button>
                    </>
                  )) || (
                    <Badge variant={getProjectRoleBadgeVariant(member.role)} />
                  )}
                  {!canManageRoles && canManageMembers && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemoveMemberRequest(member.userId)}
                      disabled={memberRemoving}
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

          {canLeaveProject && (
            <div className={styles.leaveSection}>
              <div>
                <h4>Выход из проекта</h4>
                <p>Вы перестанете видеть проект и участвовать в обсуждениях.</p>
              </div>
              <Button
                variant="danger"
                onClick={handleLeaveProjectRequest}
                disabled={leavingProject}
              >
                Выйти из проекта
              </Button>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(roleChangeConfirmation)}
        onClose={handleCancelRoleChange}
        title="Подтверждение смены роли"
        size="sm"
        closeOnOverlayClick={!roleChanging}
      >
        {roleChangeConfirmation && (
          <div className={styles.confirmationContent}>
            <p className={styles.confirmationText}>
              Вы точно хотите сменить роль пользователя{' '}
              <strong>{roleChangeConfirmation.displayName}</strong> на{' '}
              <strong>{ROLE_LABELS[roleChangeConfirmation.role]}</strong>?
            </p>
            <div className={styles.confirmationActions}>
              <Button
                variant="outline"
                onClick={handleCancelRoleChange}
                disabled={roleChanging}
              >
                Нет
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmRoleChange}
                disabled={roleChanging}
              >
                {roleChanging ? 'Сохранение...' : 'Да'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(removeMemberConfirmation)}
        onClose={handleCancelRemoveMember}
        title="Подтверждение удаления"
        size="sm"
        closeOnOverlayClick={!memberRemoving}
      >
        {removeMemberConfirmation && (
          <div className={styles.confirmationContent}>
            <p className={styles.confirmationText}>
              Вы точно хотите удалить пользователя{' '}
              <strong>{removeMemberConfirmation.displayName}</strong> из
              проекта?
            </p>
            <div className={styles.confirmationActions}>
              <Button
                variant="outline"
                onClick={handleCancelRemoveMember}
                disabled={memberRemoving}
              >
                Нет
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmRemoveMember}
                disabled={memberRemoving}
              >
                {memberRemoving ? 'Удаление...' : 'Да'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={leaveConfirmationOpen}
        onClose={handleCancelLeaveProject}
        title="Подтверждение выхода"
        size="sm"
        closeOnOverlayClick={!leavingProject}
      >
        <div className={styles.confirmationContent}>
          <p className={styles.confirmationText}>
            Вы точно хотите выйти из проекта?
          </p>
          <div className={styles.confirmationActions}>
            <Button
              variant="outline"
              onClick={handleCancelLeaveProject}
              disabled={leavingProject}
            >
              Нет
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmLeaveProject}
              disabled={leavingProject}
            >
              {leavingProject ? 'Выход...' : 'Да'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
