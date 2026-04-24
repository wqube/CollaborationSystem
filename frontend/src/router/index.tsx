import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { ProjectListPage } from '../pages/ProjectListPage';
import { SuggestionDetailPage } from '../pages/SuggestionDetailPage';
import { ProjectPage } from '../pages/ProjectPage';
import { ProjectSettingsPage } from '../pages/ProjectSettingsPage';
import { Layout } from '../components/layout/Layout';
import { ProfilePage } from '../pages/ProfilePage';
import { SuggestionListPage } from '../pages/SuggestionListPage';

export function AppRouter() {
  return (
    <Routes>
      {/* Публичные роуты без Layout */}
      <Route path="/auth/login" element={<LoginPage />} />

      {/* Основное приложение внутри Layout */}

      <Route element={<Layout />}>
        {/* Root redirect */}
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/" element={<Navigate to="/projects" replace />} />

        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/projects/:projectId" element={<ProjectPage />} />

        <Route
          path="/projects/:projectId/suggestions"
          element={<SuggestionListPage />}
        />

        <Route
          path="/projects/:projectId/suggestions/:suggestionId"
          element={<SuggestionDetailPage />}
        />

        <Route
          path="/projects/:projectId/settings"
          element={<ProjectSettingsPage />}
        />

        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
