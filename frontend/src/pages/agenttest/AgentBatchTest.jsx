import React, { useEffect } from 'react';
import { Alert, App, Button, Card, Space } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAgentBatchStatus,
  requestAgentBatch,
  subscribeAgentBatchStatus
} from '../../apis/agentTestApi.js';

export default function AgentBatchTest() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const { data: status } = useQuery({
    queryKey: ['agentBatchStatus'],
    queryFn: fetchAgentBatchStatus,
    retry: false
  });

  useEffect(() => {
    return subscribeAgentBatchStatus(nextStatus => {
      queryClient.setQueryData(['agentBatchStatus'], nextStatus);
    });
  }, [queryClient]);

  const requestMutation = useMutation({
    mutationFn: requestAgentBatch,
    onSuccess: data => {
      const requestedStatus = {
        jobId: data?.job_id,
        status: 'requested',
        message: data?.message ?? '요청되었습니다.',
        method: data?.method,
        payload: data,
        updatedAt: new Date().toISOString()
      };

      queryClient.setQueryData(['agentBatchStatus'], requestedStatus);
      message.info(requestedStatus.message);
    },
    onError: () => {
      message.error('에이전트 요청에 실패했습니다.');
    }
  });

  const label = status?.message ?? '대기 중입니다.';
  const type = status?.status === 'completed' ? 'success' : status?.status === 'requested' ? 'info' : 'warning';

  return (
    <Card size="small" className="agent-batch-card">
      <div className="agent-batch-card__content">
        <Alert
          className="agent-batch-card__status"
          type={type}
          showIcon
          message={label}
          description={status?.jobId ? `Job ID: ${status.jobId}` : '에이전트 배치 콜백 테스트 대기 중'}
        />
        <Space>
          <Button loading={requestMutation.isPending} onClick={() => requestMutation.mutate('GET')}>
            GET 요청
          </Button>
          <Button type="primary" loading={requestMutation.isPending} onClick={() => requestMutation.mutate('POST')}>
            POST 요청
          </Button>
        </Space>
      </div>
    </Card>
  );
}
