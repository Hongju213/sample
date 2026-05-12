import { GithubOutlined, KeyOutlined } from '@ant-design/icons';
import { Button, Form, Input, Layout, Menu, Space, Typography } from 'antd';
import { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { menuItems } from '../contants/menu';
import { useAuthStore } from '../store/authStore';

const { Header, Sider, Content } = Layout;

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const { username, password, setCredentials } = useAuthStore();
  const [form] = Form.useForm();

  return (
    <Layout style={{ minHeight: '100vh' }}>
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
          style={{ background: 'transparent' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            borderBottom: '1px solid #edf0f5'
          }}
        >
          <Typography.Text strong>Java 21 + React 18 + Oracle + MyBatis</Typography.Text>
          <Form
            form={form}
            layout="inline"
            initialValues={{ username, password }}
            onFinish={(values) => setCredentials(values.username, values.password)}
          >
            <Form.Item name="username" style={{ marginInlineEnd: 8 }}>
              <Input prefix={<KeyOutlined />} placeholder="ID" style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="password" style={{ marginInlineEnd: 8 }}>
              <Input.Password placeholder="Password" style={{ width: 140 }} />
            </Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                인증 저장
              </Button>
              <Button icon={<GithubOutlined />} href="https://github.com/Hongju213/sample" target="_blank" />
            </Space>
          </Form>
        </Header>
        <Content className="app-content">{children}</Content>
      </Layout>
    </Layout>
  );
}
