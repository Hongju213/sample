import React from 'react';
import { Typography } from 'antd';
import AgentBatchTest from './AgentBatchTest.jsx';
import TreeGridPage from '../treegrid/TreeGridPage.jsx';
import './AgentTest.css';

const { Title } = Typography;

export default function AgentTest() {
  return (
    <div className="agent-test-page">
      <Title level={4} className="agent-test-page__title">
        Agent Test
      </Title>

      <AgentBatchTest />
      <TreeGridPage embedded />
    </div>
  );
}
