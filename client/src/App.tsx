import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/app-layout';
import { ProtectedRoute } from './components/route-guards/protected-route';
import { AdminRoute } from './components/route-guards/admin-route';
import { LoginPage } from './pages/auth/login';
import { SignupPage } from './pages/auth/signup';
import { ProjectsPage } from './pages/projects';
import { ProjectBoardPage } from './pages/project-board';
import { CreateProjectPage } from './pages/create-project';
import { UsersPage } from './pages/users';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Redirect root to projects */}
        <Route path="/" element={<Navigate to="/projects" replace />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/project-board" element={<ProjectBoardPage />} />
          <Route path="/create-project" element={<CreateProjectPage />} />
          <Route
            path="/users"
            element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            }
          />
          <Route path="/settings" element={<div className="p-8">Settings Page (Coming Soon)</div>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
