import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import AdminPage from '../pages/admin/AdminPage';
import CommonPage from '../pages/common/CommonPage';
import HomePage from '../pages/home/HomePage';
import SamplePage from '../pages/sample/SamplePage';
import TemplatePage from '../pages/template/TemplatePage';
import TreeGridPage from '../pages/treegrid/TreeGridPage';

export default function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sample" element={<SamplePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/common" element={<CommonPage />} />
        <Route path="/template" element={<TemplatePage />} />
        <Route path="/tree-grid" element={<TreeGridPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
