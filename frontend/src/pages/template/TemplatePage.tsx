import { useState, useCallback, useRef } from 'react';
import { Card, Form, Input, Select, Button, Space, Tag, Typography, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, ColDef, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import dayjs from 'dayjs';
import { fetchSampleItems } from '../../apis/sampleItemApi';
import { SampleItemDto, SampleItemStatus } from '../../common/types';
import './TemplatePage.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const { Title } = Typography;

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<SampleItemStatus, string> = {
  TODO: '예정', DOING: '진행중', DONE: '완료',
};

// ─── Column Definitions ───────────────────────────────────────────────────────

const COL_DEFS: ColDef<SampleItemDto>[] = [
  {
    headerName: 'No',
    valueGetter: p => (p.node?.rowIndex ?? 0) + 1,
    width: 65, pinned: 'left', sortable: false, filter: false,
  },
  { field: 'id',    headerName: 'ID',   width: 80,  filter: 'agNumberColumnFilter' },
  { field: 'title', headerName: '제목', flex: 2,    filter: 'agTextColumnFilter', tooltipField: 'title' },
  {
    field: 'description', headerName: '설명', flex: 3, filter: 'agTextColumnFilter',
    valueFormatter: p => p.value ?? '-',
  },
  {
    field: 'status', headerName: '상태', width: 110, filter: 'agTextColumnFilter',
    cellRenderer: (p: { value: SampleItemStatus }) =>
      p.value
        ? `<span class="status-tag status-${p.value.toLowerCase()}">${STATUS_LABEL[p.value]}</span>`
        : '',
  },
  {
    field: 'createdAt', headerName: '생성일', width: 150,
    valueFormatter: p => p.value ? dayjs(p.value).format('YYYY-MM-DD HH:mm') : '-',
  },
  {
    field: 'updatedAt', headerName: '수정일', width: 150,
    valueFormatter: p => p.value ? dayjs(p.value).format('YYYY-MM-DD HH:mm') : '-',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function TemplatePage() {
  const [form] = Form.useForm();
  const [quickFilter, setQuickFilter] = useState('');
  const gridRef = useRef<AgGridReact<SampleItemDto>>(null);

  // 전체 데이터 한 번만 조회 → ag-Grid 클라이언트 페이징/필터링
  const { data: pageData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['sampleItems', 'all'],
    queryFn: () => fetchSampleItems({ page: 0, size: 500 }),
    staleTime: 60_000,
  });

  const rows = pageData?.content ?? [];

  const handleSearch = useCallback(() => {
    const { keyword = '', status = '' } = form.getFieldsValue();
    // ag-Grid 퀵 필터 적용 (키워드)
    gridRef.current?.api?.setGridOption('quickFilterText', keyword);
    // 상태 컬럼 필터 적용
    if (status) {
      gridRef.current?.api?.setColumnFilterModel('status', {
        filterType: 'text',
        type: 'equals',
        filter: status,
      });
    } else {
      gridRef.current?.api?.setColumnFilterModel('status', null);
    }
    gridRef.current?.api?.onFilterChanged();
  }, [form]);

  const handleReset = useCallback(() => {
    form.resetFields();
    gridRef.current?.api?.setGridOption('quickFilterText', '');
    gridRef.current?.api?.setFilterModel(null);
  }, [form]);

  const handleGridReady = useCallback((e: GridReadyEvent) => {
    e.api.sizeColumnsToFit();
  }, []);

  const handleExportCsv = useCallback(() => {
    gridRef.current?.api?.exportDataAsCsv({ fileName: 'sample-items.csv' });
  }, []);

  return (
    <div className="template-page">
      <Title level={4} style={{ marginBottom: 16 }}>샘플 아이템 목록</Title>

      {/* 검색 영역 */}
      <Card className="search-card" size="small">
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Row gutter={[12, 8]} style={{ width: '100%' }} align="middle">
            <Col>
              <Form.Item name="keyword" label="검색어" style={{ marginBottom: 0 }}>
                <Input
                  placeholder="제목 / 설명 검색"
                  allowClear
                  style={{ width: 220 }}
                  prefix={<SearchOutlined style={{ color: '#bbb' }} />}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="status" label="상태" style={{ marginBottom: 0 }}>
                <Select
                  placeholder="전체"
                  allowClear
                  style={{ width: 120 }}
                  options={[
                    { value: 'TODO',  label: '예정' },
                    { value: 'DOING', label: '진행중' },
                    { value: 'DONE',  label: '완료' },
                  ]}
                />
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

      {/* 그리드 영역 */}
      <Card
        size="small"
        className="grid-card"
        title={
          <Space>
            <span>조회 결과</span>
            <Tag color="blue">{rows.length}건</Tag>
          </Space>
        }
        extra={
          <Button size="small" onClick={handleExportCsv}>CSV</Button>
        }
      >
        <div className="ag-theme-quartz template-grid">
          <AgGridReact<SampleItemDto>
            ref={gridRef}
            rowData={isLoading ? undefined : rows}
            loading={isLoading}
            columnDefs={COL_DEFS}
            defaultColDef={{ sortable: true, resizable: true }}
            rowSelection={{ mode: 'singleRow' }}
            pagination
            paginationPageSize={20}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            onGridReady={handleGridReady}
            overlayNoRowsTemplate="<span style='color:#999'>데이터가 없습니다</span>"
          />
        </div>
      </Card>
    </div>
  );
}
