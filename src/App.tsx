import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { Files } from './pages/Files';
import { Shared } from './pages/Shared';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ShareView } from './pages/ShareView';
import { ProtectedRoute } from './components/ProtectedRoute';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/share/:linkId" element={<ShareView />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload" element={<Upload />} />
          <Route path="files" element={<Files />} />
          <Route path="shared" element={<Shared />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
