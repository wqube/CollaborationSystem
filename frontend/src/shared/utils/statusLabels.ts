import type { SuggestionStatus, ProjectRole } from '../../types/api';

export const STATUS_LABELS: Record<SuggestionStatus, string> = {
  New: 'Новые',
  InProgress: 'В работе',
  Accepted: 'Принятые',
  Rejected: 'Отклонённые',
};

export const ROLE_LABELS: Record<ProjectRole, string> = {
  Admin: 'Администратор',
  Member: 'Участник',
};
