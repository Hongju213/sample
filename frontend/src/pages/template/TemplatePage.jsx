import React from 'react';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Space, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import dayjs from 'dayjs';
import { useCallback, useMemo, useRef, useState } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { fetchSampleItems } from '../../apis/sampleItemApi.js';
import { statusLabels } from '../../utils/format.js';
import './TemplatePage.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const { Title } = Typography;
const { RangePicker } = DatePicker;
const PAGE_SIZE = 20;

export default function TemplatePage() {
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({ page: 0, size: PAGE_SIZE });
  const gridRef = useRef(null);

  const { data: pageData, isLoading, isFetching } = useQuery({
    queryKey: ['sampleItems', searchParams],
    queryFn: () => fetchSampleItems(searchParams),
    staleTime: 30_000
  });

  const rows = pageData?.content ?? [];
  const totalElements = pageData?.totalElements ?? 0;
  const totalPages = pageData?.totalPages ?? 0;
  const currentPage = pageData?.number ?? 0;

  // columnDefs는 값이 바뀌지 않으므로 memo로 고정한다.
  // 렌더 때마다 새 배열이 만들어지면 AG Grid가 불필요하게 컬럼 상태를 다시 계산한다.
  const columnDefs = useMemo(
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
          params.value
            ? `<span class="status-tag status-${params.value.toLowerCase()}">${statusLabels[params.value]}</span>`
            : ''
      },
      {
        field: 'createdAt',
        headerName: '생성일',
        width: 150,
        valueFormatter: params => (params.value ? dayjs(params.value).format('YYYY-MM-DD HH:mm') : '-')
      },
      {
        field: 'updatedAt',
        headerName: '수정일',
        width: 150,
        valueFormatter: params => (params.value ? dayjs(params.value).format('YYYY-MM-DD HH:mm') : '-')
      }
    ],
    []
  );

  const handleSearch = useCallback(() => {
    const values = form.getFieldsValue();
    setSearchParams({
      keyword: values.keyword || undefined,
      status: values.status || undefined,
      page: 0,
      size: PAGE_SIZE
    });
  }, [form]);

  const handleReset = useCallback(() => {
    form.resetFields();
    setSearchParams({ page: 0, size: PAGE_SIZE });
  }, [form]);

  const handlePageChange = useCallback(page => {
    setSearchParams(prev => ({ ...prev, page }));
  }, []);

  const handleGridReady = useCallback(event => {
    event.api.sizeColumnsToFit();
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
                <Select
                  placeholder="전체"
                  allowClear
                  className="template-status"
                  options={[
                    { value: 'TODO', label: '대기' },
                    { value: 'DOING', label: '진행' },
                    { value: 'DONE', label: '완료' }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="dateRange" label="기간" className="search-item">
                <RangePicker className="template-range" />
              </Form.Item>
            </Col>
            <Col flex="auto">
              <Space>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit" loading={isFetching}>
                  검색
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
            <Tag color="blue">총 {totalElements}건</Tag>
            {totalPages > 1 && <Tag>{currentPage + 1} / {totalPages} 페이지</Tag>}
          </Space>
        }
        extra={
          <Button size="small" onClick={handleExportCsv}>
            CSV
          </Button>
        }
      >
        <div className="ag-theme-quartz template-grid">
          <AgGridReact
            ref={gridRef}
            rowData={rows}
            loading={isLoading && rows.length === 0}
            columnDefs={columnDefs}
            defaultColDef={{ sortable: true, resizable: true, filter: true }}
            rowSelection={{ mode: 'singleRow' }}
            onGridReady={handleGridReady}
            overlayNoRowsTemplate="<span style='color:#999'>데이터가 없습니다.</span>"
          />
        </div>

        {totalPages > 1 && (
          <div className="template-pagination">
            <button className="pg-btn" disabled={currentPage === 0} onClick={() => handlePageChange(currentPage - 1)}>
              이전
            </button>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, index) => index).map(page => (
              <button
                key={page}
                className={`pg-btn${page === currentPage ? ' pg-btn--active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page + 1}
              </button>
            ))}
            <button
              className="pg-btn"
              disabled={currentPage >= totalPages - 1}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              다음
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
