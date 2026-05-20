import React from 'react';
import { GithubOutlined, KeyOutlined } from '@ant-design/icons';
import { Button, Form, Input, Layout, Menu, Space, Typography } from 'antd';
import { useLocation } from 'react-router-dom';
import { menuItems } from '../constants/menu.jsx';
import { useAuthStore } from '../store/authStore.js';
import './AppShell.css';

const { Header, Sider, Content } = Layout;

export function AppShell({ children }) {
  const location = useLocation();
  const { username, password, setCredentials } = useAuthStore();
  const [form] = Form.useForm();

  return (
    <Layout className="app-shell">
      <Sider breakpoint="lg" collapsedWidth={0} width={230}>
        <div className="app-logo">
          <span className="app-logo-mark">S</span>
          <span>Sample</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="app-menu"
        />
      </Sider>

      <Layout>
        <Header className="app-header">
          <Typography.Text strong>Java 21 + React 18 + Oracle + MyBatis</Typography.Text>
          <Form
            form={form}
            layout="inline"
            initialValues={{ username, password }}
            onFinish={values => setCredentials(values.username, values.password)}
            className="app-auth-form"
          >
            <Form.Item name="username" className="app-auth-field">
              <Input prefix={<KeyOutlined />} placeholder="ID" className="app-auth-id" />
            </Form.Item>
            <Form.Item name="password" className="app-auth-field">
              <Input.Password placeholder="Password" className="app-auth-password" />
            </Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                인증 저장
              </Button>
              <Button
                icon={<GithubOutlined />}
                href="https://github.com/Hongju213/sample"
                target="_blank"
              />
            </Space>
          </Form>
        </Header>

        <Content className="app-content">{children}</Content>
      </Layout>
    </Layout>
  );
}
