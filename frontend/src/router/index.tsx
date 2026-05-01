import { Routes, Route } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { ProjectListPage } from '../pages/ProjectListPage';
import { SuggestionDetailPage } from '../pages/SuggestionDetailPage';
import { ProjectPage } from '../pages/ProjectPage';
import { DraftsPage } from '../pages/DraftsPage';
import { Layout } from '../components/layout/Layout';
import { ProfilePage } from '../pages/ProfilePage';
import { SuggestionListPage } from '../pages/SuggestionListPage';
import { ProtectedRoute } from '../components/ProtectedRoute/ProtectedRoute';
import { SmartRedirect } from '../components/SmartRedirect/SmartRedirect';

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

        <Route path="/drafts" element={<DraftsPage />} />

        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      {/* </Route> */}

      {/* Редирект с корня */}
      <Route path="/" element={<SmartRedirect />} />
    </Routes>
  );
}
