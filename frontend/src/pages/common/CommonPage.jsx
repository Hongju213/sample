import React from 'react';
import { CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Alert, Card, Col, Empty, Result, Row, Skeleton, Typography } from 'antd';
import './CommonPage.css';

export default function CommonPage() {
  return (
    <>
      <div className="page-title">
        <h1>공통 화면</h1>
        <p>알림, 빈 상태, 로딩, 결과 화면처럼 여러 업무 화면에서 반복되는 패턴입니다.</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="알림">
            <Alert
              showIcon
              type="info"
              icon={<InfoCircleOutlined />}
              message="공통 Alert"
              description="업무 화면에서 재사용할 수 있는 안내 메시지 패턴입니다."
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="빈 상태">
            <Empty description="데이터가 없습니다" />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="로딩">
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        </Col>
        <Col span={24}>
          <Card>
            <Result
              icon={<CheckCircleOutlined className="common-success-icon" />}
              title="공통 처리 완료"
              subTitle="결과, 오류, 권한 없음 화면은 이 페이지를 기준으로 확장하면 됩니다."
            />
            <Typography.Text type="secondary">src/pages/common</Typography.Text>
          </Card>
        </Col>
      </Row>
    </>
  );
}
