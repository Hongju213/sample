import React from 'react';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Space, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Grid from '../../components/Grid.jsx';
import { fetchSampleItems } from '../../apis/sampleItemApi.js';
import { formatDateTime, statusLabels, statusOptions } from '../../utils/format.js';
import './TemplatePage.css';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const DEFAULT_PAGE_SIZE = 20;

export default function TemplatePage() {
  const [form] = Form.useForm();
  const gridRef = useRef(null);
  const [queryParams, setQueryParams] = useState({ page: 1, size: DEFAULT_PAGE_SIZE });
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
    queryKey: ['templateSampleItems', queryParams],
    queryFn: () => fetchSampleItems({ ...queryParams, page: queryParams.page - 1 }),
    staleTime: 30_000
  });

  useEffect(() => {
    if (!gridData) {
      return;
    }

    setList(prev => ({
      ...prev,
      content: gridData.content || [],
      currentPage: (gridData.number ?? 0) + 1,
      pages: gridData.totalPages || 0,
      totalCount: gridData.totalElements || 0,
      pageSize: gridData.size || DEFAULT_PAGE_SIZE
    }));
  }, [gridData]);

  const gridColumnDefs = useMemo(
    () => [
      {
        headerName: 'No',
        valueGetter: params => (params.node?.rowIndex ?? 0) + 1,
        width: 65,
        pinned: 'left',
        sortable: false,
        filter: false
      },
      { field: 'id', headerName: 'ID', width: 80, filter: 'agNumberColumnFilter' },
      { field: 'title', headerName: '제목', flex: 2, filter: 'agTextColumnFilter', tooltipField: 'title' },
      {
        field: 'description',
        headerName: '설명',
        flex: 3,
        filter: 'agTextColumnFilter',
        valueFormatter: params => params.value ?? '-'
      },
      {
        field: 'status',
        headerName: '상태',
        width: 110,
        filter: 'agTextColumnFilter',
        cellRenderer: params =>
          params.value ? `<span class="status-tag status-${params.value.toLowerCase()}">${statusLabels[params.value]}</span>` : ''
      },
      {
        field: 'createdAt',
        headerName: '생성일',
        width: 150,
        valueFormatter: params => formatDateTime(params.value)
      },
      {
        field: 'updatedAt',
        headerName: '수정일',
        width: 150,
        valueFormatter: params => formatDateTime(params.value)
      }
    ],
    []
  );

  const handleSearch = useCallback(() => {
    const values = form.getFieldsValue();
    setQueryParams(prev => ({
      ...prev,
      keyword: values.keyword || undefined,
      status: values.status || undefined,
      page: 1
    }));
  }, [form]);

  const handleReset = useCallback(() => {
    form.resetFields();
    setQueryParams({ page: 1, size: DEFAULT_PAGE_SIZE });
  }, [form]);

  const handleChangePaging = useCallback(next => {
    setQueryParams(prev => ({
      ...prev,
      page: next.page ?? 1,
      size: next.size ?? prev.size
    }));
  }, []);

  const handleExportCsv = useCallback(() => {
    gridRef.current?.api?.exportDataAsCsv({ fileName: 'sample-items.csv' });
  }, []);

  return (
    <div className="template-page">
      <Title level={4} className="template-title">
        샘플 아이템 목록
      </Title>

      <Card className="search-card" size="small">
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Row gutter={[12, 8]} className="search-row" align="middle">
            <Col>
              <Form.Item name="keyword" label="검색어" className="search-item">
                <Input
                  placeholder="제목 / 설명 검색"
                  allowClear
                  className="template-keyword"
                  prefix={<SearchOutlined className="template-search-icon" />}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="status" label="상태" className="search-item">
                <Select placeholder="전체" allowClear className="template-status" options={statusOptions} />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="dateRange" label="기간" className="search-item">
                <RangePicker className="template-range" />
              </Form.Item>
            </Col>
            <Col flex="auto">
              <Space>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit" loading={isGridFetching}>
                  조회
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  초기화
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        size="small"
        className="grid-card"
        title={
          <Space>
            <span>조회 결과</span>
            <Tag color="blue">총 {list.totalCount}건</Tag>
            {list.pages > 1 && <Tag>{list.currentPage} / {list.pages} 페이지</Tag>}
          </Space>
        }
        extra={
          <Button size="small" onClick={handleExportCsv}>
            CSV
          </Button>
        }
      >
        <Grid
          ref={gridRef}
          list={list.content}
          columnDefs={gridColumnDefs}
          loading={(isGridLoading || isGridFetching) && list.content.length === 0}
          error={isGridError}
          currentPage={list.currentPage}
          pages={list.pages}
          totalCount={list.totalCount}
          pageSize={list.pageSize}
          onChangePageSize={size => handleChangePaging({ size })}
          onChangeCurrentPage={page => handleChangePaging({ page })}
        />
      </Card>
    </div>
  );
}
