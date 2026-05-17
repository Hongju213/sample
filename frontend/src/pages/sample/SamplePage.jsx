import React from 'react';
import { Typography } from 'antd';
import AgentBatchTest from '../agenttest/AgentBatchTest.jsx';
import TreeGridPage from '../treegrid/TreeGridPage.jsx';
import './SamplePage.css';

const { Title } = Typography;

export default function SamplePage() {
  return (
    <div className="sample-page">
      <Title level={4} className="sample-page__title">
        샘플 페이지
      </Title>

      <AgentBatchTest />
      <TreeGridPage embedded />
    </div>
  );
}
