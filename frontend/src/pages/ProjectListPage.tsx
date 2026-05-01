import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatcher, userAppSelector } from '../shared/store/hooks';
import { fetchProjects } from '../shared/store/projectsSlice';
import { ProjectCard } from '../components/ProjectCard/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal/CreateProjectModal';
import { Button } from '../components/ui/Button/Button';
import styles from '../assets/ProjectListPage.module.css';

export function ProjectListPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatcher();
  const {
    list: projects,
    loading,
    error,
  } = userAppSelector((state) => state.projects);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleCreateSuccess = (projectId: string) => {
    setModalOpen(false);
    dispatch(fetchProjects());
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Мои проекты</h1>
        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          Новый проект
        </Button>
      </div>

      {loading && <div className={styles.loading}>Загрузка...</div>}
      {error && <div className={styles.error}>{error}</div>}

      {!loading && !error && projects.length === 0 && (
        <div className={styles.empty}>Нет доступных проектов</div>
      )}

      <div className={styles.grid}>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={handleProjectClick}
          />
        ))}
      </div>

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
