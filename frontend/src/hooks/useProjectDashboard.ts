import { useCallback, useEffect, useState } from 'react';
import { getDashboard } from '../shared/api/dashboard';
import type {
  CurrentUserVoteQuota,
  ProjectSummary,
  ProjectVoteSettings,
} from '../types/api';

export function useProjectDashboard(projectId: string | undefined) {
  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [voteSettings, setVoteSettings] = useState<ProjectVoteSettings | null>(
    null,
  );
  const [voteQuota, setVoteQuota] = useState<CurrentUserVoteQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProject = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getDashboard(projectId, { pageSize: 1 });
      setProject(data.project);
      setVoteSettings(data.voteSettings);
      setVoteQuota(data.currentUserVoteQuota);
    } catch {
      setError('Не удалось загрузить данные проекта');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void refreshProject();
  }, [refreshProject]);

  return {
    project,
    voteSettings,
    voteQuota,
    loading,
    error,
    setProject,
    setVoteSettings,
    setVoteQuota,
    refreshProject,
  };
}
