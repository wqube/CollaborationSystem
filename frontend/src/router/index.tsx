import { Routes, Route } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { ProjectListPage } from '../pages/ProjectListPage';
import { SuggestionDetailPage } from '../pages/SuggestionDetailPage';
import { ProjectPage } from '../pages/ProjectPage';
import { ProjectSettingsPage } from '../pages/ProjectSettingsPage';
import { Layout } from '../components/layout/Layout';

export function AppRouter() {
  return (
    <Routes>
      {/* Публичные роуты без Layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />

      {/* Основное приложение внутри Layout */}
      <Route element={<Layout />}>
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/projects/:projectId" element={<ProjectPage />} />
        <Route
          path="/projects/:projectId/settings"
          element={<ProjectSettingsPage />}
        />

        <Route
          path="/projects/:projectId/suggestion/:suggestionId"
          element={<SuggestionDetailPage />}
        />
      </Route>
    </Routes>
  );
}
