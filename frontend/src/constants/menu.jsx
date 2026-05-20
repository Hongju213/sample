import React from 'react';
import {
  ApartmentOutlined,
  AppstoreOutlined,
  ExperimentOutlined,
  HomeOutlined,
  SettingOutlined,
  TableOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

export const menuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: <Link to="/">홈</Link>
  },
  {
    key: '/sample',
    icon: <AppstoreOutlined />,
    label: <Link to="/sample">샘플</Link>
  },
  {
    key: '/admin',
    icon: <SettingOutlined />,
    label: <Link to="/admin">관리</Link>
  },
  {
    key: '/common',
    icon: <ToolOutlined />,
    label: <Link to="/common">공통</Link>
  },
  {
    key: '/template',
    icon: <TableOutlined />,
    label: <Link to="/template">템플릿</Link>
  },
  {
    key: '/tree-grid',
    icon: <ApartmentOutlined />,
    label: <Link to="/tree-grid">Tree Grid</Link>
  },
  {
    key: '/agent-test',
    icon: <ExperimentOutlined />,
    label: <Link to="/agent-test">Agent Test</Link>
  }
];
