import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminImagesPage from './pages/admin/AdminImagesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminShowcasePage from './pages/admin/AdminShowcasePage';
import AppLayout from './layouts/AppLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>

      <Route path="/vijay/login" element={<AdminLoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/vijay" element={<AdminDashboardPage />} />
          <Route path="/vijay/products" element={<AdminProductsPage />} />
          <Route path="/vijay/categories" element={<AdminCategoriesPage />} />
          <Route path="/vijay/images" element={<AdminImagesPage />} />
          <Route path="/vijay/settings" element={<AdminSettingsPage />} />
          <Route path="/vijay/showcase" element={<AdminShowcasePage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
