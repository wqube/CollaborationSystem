import type { ProjectRole } from '../../types/api';

export const getProjectRoleBadgeVariant = (
  role: ProjectRole,
): 'admin' | 'member' => {
  if (role === 'Admin') return 'admin';
  return 'member';
};

export const canManageProjectSettings = (role?: ProjectRole | null) =>
  role === 'Admin';

export const canManageProjectMembers = (role?: ProjectRole | null) =>
  role === 'Admin';

export const canManageProjectRoles = (role?: ProjectRole | null) =>
  role === 'Admin';
