import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/AppShell.jsx';
import AdminPage from '../pages/admin/AdminPage.jsx';
import CommonPage from '../pages/common/CommonPage.jsx';
import HomePage from '../pages/home/HomePage.jsx';
import SamplePage from '../pages/sample/SamplePage.jsx';
import TemplatePage from '../pages/template/TemplatePage.jsx';
import TreeGridPage from '../pages/treegrid/TreeGridPage.jsx';

// 라우팅은 한 곳에서만 관리한다. 메뉴 경로와 실제 화면 경로가 어긋나지 않게 유지하기 쉽다.
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
