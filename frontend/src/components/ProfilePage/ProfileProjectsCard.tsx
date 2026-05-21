import { Badge } from '../ui/Badge/Badge';
import { getProjectRoleBadgeVariant } from '../../shared/utils/projectRole';
import type { ProjectSummary } from '../../types/api';
import styles from '../../assets/ProfilePage.module.css';

interface ProfileProjectsCardProps {
  projects: ProjectSummary[];
  loading: boolean;
  onOpenProject: (projectId: string) => void;
}

export function ProfileProjectsCard({
  projects,
  loading,
  onOpenProject,
}: ProfileProjectsCardProps) {
  return (
    <div className={styles.card}>
      <h3>Мои проекты</h3>
      {loading && <p className={styles.loading}>Загрузка...</p>}
      {!loading && projects.length === 0 && (
        <p className={styles.empty}>Нет проектов</p>
      )}
      <div className={styles.projectList}>
        {projects.map((project) => (
          <div
            key={project.id}
            className={styles.projectItem}
            onClick={() => onOpenProject(project.id)}
          >
            <div>
              <strong className={styles.projectName}>{project.name}</strong>
              <span className={styles.projectDesc}>{project.description}</span>
            </div>
            <Badge variant={getProjectRoleBadgeVariant(project.role)} />
          </div>
        ))}
      </div>
    </div>
  );
}
