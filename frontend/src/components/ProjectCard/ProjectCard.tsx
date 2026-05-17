import type { ProjectSummary } from '../../types/api';
import { getProjectRoleBadgeVariant } from '../../shared/utils/projectRole';
import { Badge } from '../ui/Badge/Badge';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: ProjectSummary;
  onClick: (projectId: string) => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const firstLetter = project.name.charAt(0).toUpperCase();
  const roleVariant = getProjectRoleBadgeVariant(project.role);

  const formattedDate = new Date(project.lastAccessedAt).toLocaleDateString(
    'ru-RU',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  );

  return (
    <div className={styles.card} onClick={() => onClick(project.id)}>
      <div className={styles.top}>
        <div
          className={styles.icon}
          style={{ background: getColorForIndex(project.name.charCodeAt(0)) }}
        >
          {firstLetter}
        </div>
        <Badge variant={roleVariant}>{project.role}</Badge>
      </div>
      <h3 className={styles.name}>{project.name}</h3>
      <p className={styles.description}>{project.description}</p>
      <div className={styles.footer}>
        <span className={styles.date}>lastAccess: {formattedDate}</span>
      </div>
    </div>
  );
}

function getColorForIndex(code: number): string {
  const colors = ['#FFDD2D', '#1A1A1A', '#1976D2', '#00A86B', '#E31C3D'];
  return colors[code % colors.length];
}
