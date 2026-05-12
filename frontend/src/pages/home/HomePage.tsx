import { ApiOutlined, DatabaseOutlined, DesktopOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Card, Col, Descriptions, Row, Statistic, Steps, Tag, Typography } from 'antd';

export default function HomePage() {
  return (
    <>
      <div className="page-title">
        <h1>프로젝트 템플릿</h1>
        <p>내부망에서 바로 복제해 기본 업무 화면과 API를 붙여 나가는 샘플입니다.</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <Card>
            <Statistic title="Java" value="21" prefix={<SafetyCertificateOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card>
            <Statistic title="React" value="18.2.0" prefix={<DesktopOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card>
            <Statistic title="Node" value="20.20.2" prefix={<ApiOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card>
            <Statistic title="Oracle" value="XE Dev" prefix={<DatabaseOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="실행 순서">
            <Steps
              current={1}
              items={[
                { title: 'DB', description: 'docker compose up -d oracle' },
                { title: 'Backend', description: 'mvn spring-boot:run' },
                { title: 'Frontend', description: 'pnpm dev' }
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="기본 설정">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="DB 계정">root / root</Descriptions.Item>
              <Descriptions.Item label="API 인증">root / root</Descriptions.Item>
              <Descriptions.Item label="상태">
                <Tag color="green">READY</Tag>
              </Descriptions.Item>
            </Descriptions>
            <Typography.Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
              `/sample` 화면에서 CRUD API와 Ant Design 컴포넌트 샘플을 함께 확인할 수 있습니다.
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </>
  );
}
