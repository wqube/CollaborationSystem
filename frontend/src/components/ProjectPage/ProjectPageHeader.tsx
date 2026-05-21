import { Button } from '../ui/Button/Button';
import { Tabs, type TabItem } from '../ui/Tabs/Tabs';
import {
  STATUS_LABELS,
  DRAFTS_TAB_LABEL,
} from '../../shared/utils/statusLabels';
import type { StatusFilter } from '../../hooks/useProjectSuggestions';
import styles from '../../assets/ProjectPage.module.css';

const TABS: TabItem[] = [
  { id: '', label: 'Все' },
  { id: 'New', label: STATUS_LABELS.New },
  { id: 'InProgress', label: STATUS_LABELS.InProgress },
  { id: 'Accepted', label: STATUS_LABELS.Accepted },
  { id: 'Rejected', label: STATUS_LABELS.Rejected },
  { id: 'drafts', label: DRAFTS_TAB_LABEL },
];

interface ProjectPageHeaderProps {
  activeTab: StatusFilter;
  isDraftsTab: boolean;
  canManageSettings: boolean;
  onTabChange: (tab: string) => void;
  onOpenMembers: () => void;
  onOpenSettings: () => void;
  onOpenSuggestion: () => void;
}

export function ProjectPageHeader({
  activeTab,
  isDraftsTab,
  canManageSettings,
  onTabChange,
  onOpenMembers,
  onOpenSettings,
  onOpenSuggestion,
}: ProjectPageHeaderProps) {
  return (
    <div className={styles.header}>
      <Tabs tabs={TABS} activeTab={activeTab} onChange={onTabChange} />
      <div className={styles.actions}>
        {!isDraftsTab && (
          <>
            <Button variant="outline" onClick={onOpenMembers}>
              Участники
            </Button>
            {canManageSettings && (
              <Button variant="outline" onClick={onOpenSettings}>
                Настройки
              </Button>
            )}
            <Button variant="primary" onClick={onOpenSuggestion}>
              Предложить идею
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
