import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { ProjectListPage } from '../pages/ProjectListPage';
import { SuggestionDetailPage } from '../pages/SuggestionDetailPage';
import { ProjectPage } from '../pages/ProjectPage';
import { ProjectSettingsPage } from '../pages/ProjectSettingsPage';
import { Layout } from '../components/layout/Layout';
import { ProfilePage } from '../pages/ProfilePage';
import { SuggestionListPage } from '../pages/SuggestionListPage';
import { ProtectedRoute } from '../components/ProtectedRoute/ProtectedRoute';

export function AppRouter() {
  return (
    <Routes>
      {/* Публичная страница */}
      <Route path="/auth/login" element={<LoginPage />} />

      {/* Защищенные страницы */}
      {/* <Route element={<ProtectedRoute />}> */}
      {/* Основное приложение внутри Layout */}
      <Route element={<Layout />}>
        <Route path="/profile" element={<ProfilePage />} />

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
      {/* </Route> */}

      {/* Редирект с корня */}
      <Route path="/" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}
