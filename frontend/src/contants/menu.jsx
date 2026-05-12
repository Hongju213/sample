import React from 'react';
import {
  ApartmentOutlined,
  AppstoreOutlined,
  HomeOutlined,
  SettingOutlined,
  TableOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

// Ant Design Menu가 요구하는 item 배열이다.
// 라우터 경로를 key로 사용하면 현재 URL과 selectedKeys를 바로 비교할 수 있다.
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
    label: <Link to="/tree-grid">트리+그리드</Link>
  }
];
