import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs';
import { CreateSuggestionModal } from '../components/CreateSuggestionModal/CreateSuggestionModal';
import { DraftsTab } from '../components/DraftsTab/DraftsTab';
import { MembersModal } from '../components/MembersModal/MembersModal';
import { ProjectPageHeader } from '../components/ProjectPage/ProjectPageHeader';
import { ProjectSuggestionsPanel } from '../components/ProjectPage/ProjectSuggestionsPanel';
import { SettingsModal } from '../components/SettingsModal/SettingsModal';
import styles from '../assets/ProjectPage.module.css';
import { useProjectDashboard } from '../hooks/useProjectDashboard';
import { useProjectSuggestionModal } from '../hooks/useProjectSuggestionModal';
import { useProjectSuggestions } from '../hooks/useProjectSuggestions';
import { useAppDispatcher, userAppSelector } from '../shared/store/hooks';
import { fetchProjects } from '../shared/store/projectsSlice';
import {
  canManageProjectMembers,
  canManageProjectRoles,
  canManageProjectSettings,
} from '../shared/utils/projectRole';
import type {
  ProjectRole,
  ProjectSummary,
  ProjectVoteSettings,
} from '../types/api';

const PAGE_SIZE = 5;

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatcher();
  const { list: projects } = userAppSelector((state) => state.projects);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);

  const {
    project,
    voteSettings,
    voteQuota,
    loading: projectLoading,
    error: projectError,
    setProject,
    setVoteSettings,
    setVoteQuota,
    refreshProject,
  } = useProjectDashboard(projectId);

  const suggestionsState = useProjectSuggestions({
    projectId,
    pageSize: PAGE_SIZE,
    onVoteQuotaChange: setVoteQuota,
  });

  const suggestionModal = useProjectSuggestionModal({
    isDraftsTab: suggestionsState.isDraftsTab,
    refreshSuggestions: suggestionsState.refreshSuggestions,
  });

  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length]);

  const openSuggestionDetails = useCallback(
    (suggestionId: string, userRole?: ProjectRole) => {
      navigate(`/projects/${projectId}/suggestions/${suggestionId}`, {
        state: { userRole },
      });
    },
    [navigate, projectId],
  );

  const handleProjectSaved = useCallback(
    async (updatedProject: ProjectSummary) => {
      setProject(updatedProject);
      await dispatch(fetchProjects());
    },
    [dispatch, setProject],
  );

  const handleProjectDeleted = useCallback(async () => {
    setSettingsModalOpen(false);
    await dispatch(fetchProjects());
    navigate('/projects');
  }, [dispatch, navigate]);

  const handleProjectSettingsSaved = useCallback(
    async (settings: ProjectVoteSettings) => {
      setVoteSettings(settings);
      await refreshProject();
      await dispatch(fetchProjects());
    },
    [dispatch, refreshProject, setVoteSettings],
  );

  if (!projectId) {
    return <p className={styles.error}>Проект не найден</p>;
  }

  const canManageSettings = canManageProjectSettings(project?.role);
  const canManageMembers = canManageProjectMembers(project?.role);
  const canManageRoles = canManageProjectRoles(project?.role);

  return (
    <div className={styles.page}>
      <Breadcrumbs />
      <ProjectPageHeader
        activeTab={suggestionsState.statusFilter}
        isDraftsTab={suggestionsState.isDraftsTab}
        canManageSettings={canManageSettings}
        onTabChange={suggestionsState.handleTabChange}
        onOpenMembers={() => setMembersModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenSuggestion={suggestionModal.openNewSuggestion}
      />

      {projectError && <p className={styles.error}>{projectError}</p>}

      {suggestionsState.isDraftsTab ? (
        <DraftsTab
          projectId={projectId}
          onContinue={suggestionModal.continueDraft}
          refreshTrigger={suggestionModal.draftsRefreshKey}
        />
      ) : (
        <ProjectSuggestionsPanel
          projectId={projectId}
          projectRole={project?.role}
          projectLoading={projectLoading}
          voteQuota={voteQuota}
          suggestionsState={suggestionsState}
          onVoteQuotaChange={setVoteQuota}
          onOpenSuggestion={openSuggestionDetails}
        />
      )}

      <CreateSuggestionModal
        open={suggestionModal.open}
        onClose={suggestionModal.close}
        onSuccess={suggestionModal.handleSuccess}
        projectId={projectId}
        draftId={suggestionModal.draftId}
      />

      {canManageSettings && (
        <SettingsModal
          open={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          projectId={projectId}
          projectName={project?.name ?? ''}
          projectDescription={project?.description ?? ''}
          voteSettings={voteSettings}
          onDeleted={handleProjectDeleted}
          onProjectSaved={handleProjectSaved}
          onSettingsSaved={handleProjectSettingsSaved}
        />
      )}

      <MembersModal
        open={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        projectId={projectId}
        canManageMembers={canManageMembers}
        canManageRoles={canManageRoles}
      />
    </div>
  );
}
