import { LockOutlined, TeamOutlined } from '@ant-design/icons';
import { Avatar, Card, Col, List, Row, Switch, Table, Tag } from 'antd';

const users = [
  { key: 1, name: '관리자', role: 'ADMIN', enabled: true },
  { key: 2, name: '사용자', role: 'USER', enabled: true },
  { key: 3, name: '비활성 계정', role: 'USER', enabled: false }
];

export default function AdminPage() {
  return (
    <>
      <div className="page-title">
        <h1>관리 샘플</h1>
        <p>권한, 사용자, 설정 화면을 붙일 수 있는 기본 레이아웃입니다.</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="사용자">
            <Table
              rowKey="key"
              dataSource={users}
              pagination={false}
              columns={[
                { title: '이름', dataIndex: 'name' },
                {
                  title: '권한',
                  dataIndex: 'role',
                  render: (role) => <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role}</Tag>
                },
                {
                  title: '사용',
                  dataIndex: 'enabled',
                  render: (enabled) => <Switch checked={enabled} />
                }
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="권한 그룹">
            <List
              dataSource={['메뉴 관리', '사용자 관리', '시스템 설정']}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={index === 0 ? <TeamOutlined /> : <LockOutlined />} />}
                    title={item}
                    description="관리 화면 샘플 항목"
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
