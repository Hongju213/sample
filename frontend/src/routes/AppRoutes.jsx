import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/AppShell.jsx';
import AdminPage from '../pages/admin/AdminPage.jsx';
import AgentTest from '../pages/agenttest/AgentTest.jsx';
import CommonPage from '../pages/common/CommonPage.jsx';
import HomePage from '../pages/home/HomePage.jsx';
import SamplePage from '../pages/SamplePage/index.jsx';
import TemplatePage from '../pages/template/TemplatePage.jsx';
import TreeGridPage from '../pages/TreeGridPage/index.jsx';

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
        <Route path="/agent-test" element={<AgentTest />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
