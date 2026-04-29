import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatcher, userAppSelector } from '../shared/store/hooks';
import { fetchProjects } from '../shared/store/projectsSlice';
import { ProjectCard } from '../components/ProjectCard/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal/CreateProjectModal';
import { Button } from '../components/ui/Button/Button';

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
    <div className="page">
      <div className="header">
        <h1 className="title">Мои проекты</h1>
        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          Новый проект
        </Button>
      </div>

      {loading && <div className="loading">Загрузка...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && projects.length === 0 && (
        <div className="empty">Нет доступных проектов</div>
      )}

      <div className="grid">
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
