import React from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { App, Alert, Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Tag, Typography } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Grid from '../../components/Grid.jsx';
import {
  createSampleItem,
  deleteSampleItem,
  fetchAgentBatchStatus,
  fetchSampleItems,
  requestAgentBatch,
  subscribeAgentBatchStatus,
  updateSampleItem
} from '../../apis/sampleItemApi.js';
import { formatDateTime, statusColor, statusLabels, statusOptions } from '../../utils/format.js';
import './SamplePage.css';

const { Title } = Typography;
const DEFAULT_PAGE_SIZE = 10;

function CodeRenderer(params) {
  const value = params.value;

  if (!value) {
    return null;
  }

  return <Tag color={statusColor(value)}>{statusLabels[value] ?? value}</Tag>;
}

function SampleSearch({ onSearch, onReset, refreshKey }) {
  const [form] = Form.useForm();
  void refreshKey;

  return (
    <Card size="small" className="sample-search-card">
      <Form form={form} layout="inline" onFinish={onSearch}>
        <Form.Item name="keyword" label="검색어">
          <Input
            allowClear
            className="sample-keyword"
            placeholder="제목 / 설명"
            prefix={<SearchOutlined className="sample-search-icon" />}
          />
        </Form.Item>
        <Form.Item name="status" label="상태">
          <Select allowClear className="sample-status" placeholder="전체" options={statusOptions} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              조회
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => onReset(form)}>
              초기화
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}

function AgentBatchTest({ status, loading, onRequestGet, onRequestPost }) {
  // agent 테스트 전용 패널입니다.
  // 요청 버튼은 긴 작업을 기다리지 않고 즉시 반환되는 sample API를 호출합니다.
  // 상태 문구는 fetchAgentBatchStatus()의 polling 결과로 갱신됩니다.
  const label = status?.message ?? '대기 중입니다.';
  const type = status?.status === 'completed' ? 'success' : status?.status === 'requested' ? 'info' : 'warning';

  return (
    <Card size="small" className="sample-agent-card">
      <div className="sample-agent-card__content">
        <Alert
          className="sample-agent-card__status"
          type={type}
          showIcon
          message={label}
          description={status?.jobId ? `Job ID: ${status.jobId}` : '에이전트 배치 콜백 테스트 대기 중'}
        />
        <Space>
          <Button loading={loading} onClick={onRequestGet}>
            GET 요청
          </Button>
          <Button type="primary" loading={loading} onClick={onRequestPost}>
            POST 요청
          </Button>
        </Space>
      </div>
    </Card>
  );
}

function SampleGrid({
  gridRef,
  list,
  loading,
  error,
  onEditItem,
  onDeleteItem,
  onChangePaging,
  refreshKey
}) {
  const gridColumnDefs = useMemo(
    () => [
      {
        headerName: 'No',
        valueGetter: params => (params.node?.rowIndex ?? 0) + 1,
        width: 70,
        pinned: 'left',
        sortable: false,
        filter: false
      },
      { field: 'id', headerName: 'ID', width: 90, filter: 'agNumberColumnFilter' },
      { field: 'title', headerName: '제목', flex: 1.4, minWidth: 180, tooltipField: 'title' },
      {
        field: 'description',
        headerName: '설명',
        flex: 2,
        minWidth: 220,
        valueFormatter: params => params.value || '-'
      },
      {
        field: 'status',
        headerName: '상태',
        width: 110,
        cellRenderer: 'codeRenderer'
      },
      {
        field: 'updatedAt',
        headerName: '수정일',
        width: 160,
        valueFormatter: params => formatDateTime(params.value)
      },
      {
        headerName: '작업',
        width: 132,
        sortable: false,
        filter: false,
        cellRenderer: params => (
          <Space size={4}>
            <Button size="small" icon={<EditOutlined />} onClick={() => onEditItem(params.data, 'edit')} />
            <Popconfirm title="삭제하시겠습니까?" onConfirm={() => onDeleteItem(params.data.id)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        )
      }
    ],
    [onDeleteItem, onEditItem]
  );

  const handleClickRow = useCallback(event => {
    event.api.deselectAll();
    event.node.setSelected(true);
  }, []);

  const handleDoubleClickedRow = useCallback(
    event => {
      onEditItem(event.data, 'edit');
    },
    [onEditItem]
  );

  useEffect(() => {
    gridRef.current?.api?.deselectAll();
  }, [gridRef, refreshKey]);

  return (
    <Card
      size="small"
      className="sample-grid-card"
      title="조회 결과"
      extra={
        <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => onEditItem(null, 'create')}>
          신규
        </Button>
      }
    >
      <Grid
        ref={gridRef}
        list={list.content}
        columnDefs={gridColumnDefs}
        gridOptions={{ components: { codeRenderer: CodeRenderer } }}
        loading={loading}
        error={error}
        onClicked={handleClickRow}
        onDoubleClicked={handleDoubleClickedRow}
        currentPage={list.currentPage}
        pages={list.pages}
        totalCount={list.totalCount}
        pageSize={list.pageSize}
        onChangePageSize={size => onChangePaging({ size })}
        onChangeCurrentPage={page => onChangePaging({ page })}
      />
    </Card>
  );
}

function SampleItemModal({ open, mode, data, confirmLoading, onClose, onSubmit }) {
  const [form] = Form.useForm();
  const title = mode === 'create' ? '샘플 등록' : '샘플 수정';

  useEffect(() => {
    if (!open) {
      return;
    }

    form.setFieldsValue({
      title: data?.title ?? '',
      description: data?.description ?? '',
      status: data?.status ?? 'TODO'
    });
  }, [data, form, open]);

  return (
    <Modal
      open={open}
      title={title}
      okText="저장"
      cancelText="닫기"
      confirmLoading={confirmLoading}
      onCancel={onClose}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} preserve={false}>
        <Form.Item name="title" label="제목" rules={[{ required: true, message: '제목을 입력하세요.' }]}>
          <Input placeholder="샘플 제목" />
        </Form.Item>
        <Form.Item name="description" label="설명">
          <Input.TextArea rows={4} placeholder="설명" />
        </Form.Item>
        <Form.Item name="status" label="상태" rules={[{ required: true, message: '상태를 선택하세요.' }]}>
          <Select options={statusOptions} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default function SamplePage(props) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const gridRef = useRef(null);
  const [queryParams, setQueryParams] = useState({
    page: 1,
    size: DEFAULT_PAGE_SIZE
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [itemModalState, setItemModalState] = useState({
    open: false,
    mode: 'create',
    data: null
  });
  const [list, setList] = useState({
    content: [],
    currentPage: 1,
    pages: 0,
    totalCount: 0,
    pageSize: DEFAULT_PAGE_SIZE
  });

  const {
    data: gridData,
    isLoading: isGridLoading,
    isFetching: isGridFetching,
    error: isGridError
  } = useQuery({
    queryKey: ['sampleItems', queryParams, refreshKey],
    queryFn: () => fetchSampleItems({ ...queryParams, page: queryParams.page - 1 }),
    enabled: true
  });

  const {
    data: agentStatus,
    refetch: refetchAgentStatus
  } = useQuery({
    queryKey: ['agentBatchStatus'],
    queryFn: fetchAgentBatchStatus,
    // 테스트 단계에서는 버튼 요청이 실패하거나 외부에서 callback이 직접 들어와도
    // 화면이 backend의 최신 상태를 따라가도록 상태 API를 계속 확인합니다.
    retry: false
  });

  useEffect(() => {
    return subscribeAgentBatchStatus(status => {
      queryClient.setQueryData(['agentBatchStatus'], status);
    });
  }, [queryClient]);

  useEffect(() => {
    if (!gridData) {
      return;
    }

    setList(prev => ({
      ...prev,
      content: gridData?.content || [],
      currentPage: (gridData?.number ?? 0) + 1,
      pages: gridData?.totalPages || 0,
      totalCount: gridData?.totalElements || 0,
      pageSize: gridData?.size || DEFAULT_PAGE_SIZE
    }));
  }, [gridData]);

  useEffect(() => {
    if (props?.pageInfo?.refresh) {
      setRefreshKey(prev => prev + 1);
    }
  }, [props?.pageInfo?.refresh]);

  const saveMutation = useMutation({
    mutationFn: values => {
      if (itemModalState.mode === 'edit' && itemModalState.data?.id) {
        return updateSampleItem(itemModalState.data.id, values);
      }

      return createSampleItem(values);
    },
    onSuccess: () => {
      message.success(itemModalState.mode === 'edit' ? '수정되었습니다.' : '등록되었습니다.');
      setItemModalState({ open: false, mode: 'create', data: null });
      setRefreshKey(prev => prev + 1);
    },
    onError: () => {
      message.error('저장에 실패했습니다.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSampleItem,
    onSuccess: () => {
      message.success('삭제되었습니다.');
      setRefreshKey(prev => prev + 1);
    },
    onError: () => {
      message.error('삭제에 실패했습니다.');
    }
  });

  const agentMutation = useMutation({
    mutationFn: requestAgentBatch,
    onSuccess: async data => {
      // agent는 긴 작업 결과가 아니라 "접수됨"만 반환합니다.
      // 완료 여부는 아래 refetch/polling 흐름으로 별도 확인합니다.
      message.info(data?.message ?? '요청되었습니다.');
      await refetchAgentStatus();
    },
    onError: () => {
      message.error('에이전트 요청에 실패했습니다.');
    }
  });

  const handleReset = useCallback(form => {
    form?.resetFields();
    setQueryParams({ page: 1, size: DEFAULT_PAGE_SIZE });
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleSearch = useCallback(values => {
    setQueryParams(prev => ({
      ...prev,
      keyword: values.keyword || undefined,
      status: values.status || undefined,
      page: 1
    }));
  }, []);

  const handleChangePaging = useCallback(next => {
    setQueryParams(prev => ({
      ...prev,
      page: next.page ?? 1,
      size: next.size ?? prev.size
    }));
  }, []);

  const handleEditItem = useCallback((item, mode = 'edit') => {
    setItemModalState({
      open: true,
      mode,
      data: item
    });
  }, []);

  const handleItemModalClose = useCallback(() => {
    setItemModalState({ open: false, mode: 'create', data: null });
  }, []);

  return (
    <div className="sample-page">
      <div className="sample-page__header">
        <Title level={4} className="sample-page__title">
          샘플 목록
        </Title>
        <Button icon={<ReloadOutlined />} onClick={() => setRefreshKey(prev => prev + 1)}>
          새로고침
        </Button>
      </div>

      <SampleSearch onSearch={handleSearch} onReset={handleReset} refreshKey={refreshKey} />

      <AgentBatchTest
        status={agentStatus}
        loading={agentMutation.isPending}
        onRequestGet={() => agentMutation.mutate('GET')}
        onRequestPost={() => agentMutation.mutate('POST')}
      />

      <SampleGrid
        gridRef={gridRef}
        list={list}
        loading={(isGridLoading || isGridFetching) && list.content.length === 0}
        error={isGridError}
        onEditItem={handleEditItem}
        onDeleteItem={id => deleteMutation.mutate(id)}
        onChangePaging={handleChangePaging}
        refreshKey={refreshKey}
      />

      <SampleItemModal
        open={itemModalState.open}
        mode={itemModalState.mode}
        data={itemModalState.data}
        confirmLoading={saveMutation.isPending}
        onClose={handleItemModalClose}
        onSubmit={values => saveMutation.mutate(values)}
      />
    </div>
  );
}
