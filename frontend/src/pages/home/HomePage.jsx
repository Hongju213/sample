import React from 'react';
import { ApiOutlined, DatabaseOutlined, DesktopOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Card, Col, Descriptions, Row, Statistic, Steps, Tag, Typography } from 'antd';
import './HomePage.css';

export default function HomePage() {
  return (
    <>
      <div className="page-title">
        <h1>프로젝트 샘플</h1>
        <p>Spring Boot, Oracle, React 화면을 빠르게 확인하기 위한 기준 프로젝트입니다.</p>
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
            <Statistic title="Oracle" value="19c / XE" prefix={<DatabaseOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="home-detail-row">
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
              <Descriptions.Item label="샘플 사용자">root / root</Descriptions.Item>
              <Descriptions.Item label="상태">
                <Tag color="green">READY</Tag>
              </Descriptions.Item>
            </Descriptions>
            <Typography.Paragraph className="home-note">
              Sample과 Tree Grid 화면은 백엔드 API와 DB 데이터를 기준으로 조회합니다.
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </>
  );
}
