import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import { Badge } from '../ui/Badge/Badge';
import apiClient from '../../shared/api/client';
import type {
  ProjectDetails,
  ProjectMemberDto,
  ProjectRole,
} from '../../types/api';
import { getProjectRoleBadgeVariant } from '../../shared/utils/projectRole';
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
  const [error, setError] = useState<string | null>(null);
  const [searchUser, setSearchUser] = useState('');
  const [newRole, setNewRole] = useState<ProjectRole>('Member');

  useEffect(() => {
    if (!open || !projectId) return;

    setLoading(true);
    setError(null);

    apiClient
      .get<ProjectDetails>(`/projects/${projectId}`)
      .then((res) => {
        setMembers(res.data.members || []);
      })
      .catch(() => setError('Не удалось загрузить участников'))
      .finally(() => setLoading(false));
  }, [open, projectId]);

  const handleAddMember = async () => {
    if (!canManageMembers || !searchUser.trim()) return;

    try {
      setError(null);
      await apiClient.post(`/projects/${projectId}/members`, {
        userId: searchUser,
        role: newRole,
      });
      const res = await apiClient.get(`/projects/${projectId}`);
      setMembers(res.data.members || []);
      setSearchUser('');
    } catch {
      setError('Не удалось добавить участника');
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
              <input
                type="text"
                placeholder="Поиск по имени или email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className={styles.searchInput}
              />
              <select
                className={styles.roleSelect}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as ProjectRole)}
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
              <Button variant="primary" onClick={handleAddMember}>
                Добавить
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
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
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
