import {
  AppstoreOutlined,
  HomeOutlined,
  SettingOutlined,
  ToolOutlined,
  TableOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import { MenuProps } from 'antd';
import { Link } from 'react-router-dom';

export const menuItems: MenuProps['items'] = [
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
