import { useState } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import styles from '../MembersModal/MembersModal.module.css';
import { Badge } from '../ui/Badge/Badge';

interface Member {
  userId: string;
  displayName: string;
  email: string;
  role: 'Admin' | 'Member';
  joinedAt: string;
}

interface MembersModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

const mockMembers: Member[] = [
  {
    userId: '1',
    displayName: 'Иван Петров',
    email: 'ivan@example.local',
    role: 'Admin',
    joinedAt: '2026-04-01',
  },
  {
    userId: '2',
    displayName: 'Мария Сидорова',
    email: 'maria@example.local',
    role: 'Member',
    joinedAt: '2026-03-15',
  },
  {
    userId: '3',
    displayName: 'Анна Соколова',
    email: 'anna@example.local',
    role: 'Member',
    joinedAt: '2026-04-09',
  },
];

export function MembersModal({ open, onClose, projectId }: MembersModalProps) {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchUser, setSearchUser] = useState('');

  const handleAddMember = () => {
    // TODO: POST /api/v1/projects/{projectId}/members
    alert('Add member: ' + searchUser);
  };

  const handleChangeRole = (userId: string, newRole: 'Admin' | 'Member') => {
    setMembers((prev) =>
      prev.map((m) => (m.userId === userId ? { ...m, role: newRole } : m)),
    );
  };

  const handleRemoveMember = (userId: string) => {
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Участники проекта" size="lg">
      <div className={styles.content}>
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
            <select className={styles.roleSelect}>
              <option>Member</option>
              <option>Admin</option>
            </select>
            <Button variant="primary" onClick={handleAddMember}>
              Добавить
            </Button>
          </div>
        </div>

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
                    Присоединился: {member.joinedAt}
                  </span>
                </div>
              </div>
              <div className={styles.memberActions}>
                <Badge variant={member.role === 'Admin' ? 'admin' : 'member'} />
                <select
                  value={member.role}
                  onChange={(e) =>
                    handleChangeRole(
                      member.userId,
                      e.target.value as 'Admin' | 'Member',
                    )
                  }
                  className={styles.roleSelectSm}
                >
                  <option>Admin</option>
                  <option>Member</option>
                </select>
                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemoveMember(member.userId)}
                >
                  [X]
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
