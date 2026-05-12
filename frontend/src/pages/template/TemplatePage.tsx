import { useState, useCallback, useRef } from 'react';
import { Card, Form, Input, Select, Button, Space, Tag, DatePicker, Typography, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import dayjs from 'dayjs';
import { fetchSampleItems } from '../../apis/sampleItemApi';
import { SampleItem, SampleItemStatus } from '../../common/types';
import './TemplatePage.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const { Title } = Typography;
const { RangePicker } = DatePicker;

type SearchParams = {
  keyword: string;
  status: SampleItemStatus | '';
};

const STATUS_COLOR: Record<SampleItemStatus, string> = {
  TODO: 'default',
  DOING: 'blue',
  DONE: 'green'
};

const STATUS_LABEL: Record<SampleItemStatus, string> = {
  TODO: '예정',
  DOING: '진행중',
  DONE: '완료'
};

const columnDefs: ColDef<SampleItem>[] = [
  {
    headerName: 'No',
    valueGetter: params => (params.node?.rowIndex ?? 0) + 1,
    width: 70,
    pinned: 'left',
    sortable: false,
    filter: false
  },
  {
    field: 'id',
    headerName: 'ID',
    width: 80,
    filter: 'agNumberColumnFilter'
  },
  {
    field: 'title',
    headerName: '제목',
    flex: 2,
    filter: 'agTextColumnFilter',
    tooltipField: 'title'
  },
  {
    field: 'description',
    headerName: '설명',
    flex: 3,
    filter: 'agTextColumnFilter',
    cellRenderer: (params: { value: string }) => params.value || '-'
  },
  {
    field: 'status',
    headerName: '상태',
    width: 110,
    filter: 'agTextColumnFilter',
    cellRenderer: (params: { value: SampleItemStatus }) => {
      if (!params.value) return null;
      return `<span class="status-tag status-${params.value.toLowerCase()}">${STATUS_LABEL[params.value]}</span>`;
    }
  },
  {
    field: 'createdAt',
    headerName: '생성일',
    width: 150,
    valueFormatter: params => params.value ? dayjs(params.value).format('YYYY-MM-DD HH:mm') : '-'
  },
  {
    field: 'updatedAt',
    headerName: '수정일',
    width: 150,
    valueFormatter: params => params.value ? dayjs(params.value).format('YYYY-MM-DD HH:mm') : '-'
  }
];

export default function TemplatePage() {
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState<SearchParams>({ keyword: '', status: '' });
  const gridRef = useRef<AgGridReact<SampleItem>>(null);

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['sampleItems', searchParams.keyword],
    queryFn: () => fetchSampleItems(searchParams.keyword || undefined),
    staleTime: 30_000
  });

  // Client-side status filter
  const filteredData = searchParams.status
    ? data.filter(item => item.status === searchParams.status)
    : data;

  const handleSearch = useCallback(() => {
    const values = form.getFieldsValue();
    setSearchParams({ keyword: values.keyword ?? '', status: values.status ?? '' });
  }, [form]);

  const handleReset = useCallback(() => {
    form.resetFields();
    setSearchParams({ keyword: '', status: '' });
  }, [form]);

  const handleGridReady = useCallback((e: GridReadyEvent) => {
    e.api.sizeColumnsToFit();
  }, []);

  const handleExportCsv = useCallback(() => {
    gridRef.current?.api?.exportDataAsCsv({ fileName: 'template-export.csv' });
  }, []);

  return (
    <div className="template-page">
      <Title level={4} style={{ marginBottom: 16 }}>템플릿 목록</Title>

      {/* Search Panel */}
      <Card className="search-card" size="small">
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Row gutter={[12, 8]} style={{ width: '100%' }} align="middle">
            <Col>
              <Form.Item name="keyword" label="검색어" style={{ marginBottom: 0 }}>
                <Input
                  placeholder="제목으로 검색"
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
                  style={{ width: 130 }}
                  options={[
                    { value: 'TODO', label: '예정' },
                    { value: 'DOING', label: '진행중' },
                    { value: 'DONE', label: '완료' }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="dateRange" label="기간" style={{ marginBottom: 0 }}>
                <RangePicker style={{ width: 240 }} />
              </Form.Item>
            </Col>
            <Col flex="auto">
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  htmlType="submit"
                  loading={isFetching}
                >
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

      {/* Grid Panel */}
      <Card
        size="small"
        className="grid-card"
        title={
          <Space>
            <span>조회 결과</span>
            <Tag color="blue">{filteredData.length}건</Tag>
          </Space>
        }
        extra={
          <Button size="small" onClick={handleExportCsv}>
            CSV 다운로드
          </Button>
        }
      >
        <div className="ag-theme-quartz template-grid">
          <AgGridReact<SampleItem>
            ref={gridRef}
            rowData={filteredData}
            columnDefs={columnDefs}
            loading={isLoading}
            defaultColDef={{
              sortable: true,
              resizable: true,
              filter: true
            }}
            rowSelection={{ mode: 'singleRow' }}
            pagination
            paginationPageSize={20}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            onGridReady={handleGridReady}
            overlayNoRowsTemplate="<span style='color:#999'>데이터가 없습니다</span>"
            overlayLoadingTemplate="<span style='color:#999'>조회 중...</span>"
          />
        </div>
      </Card>
    </div>
  );
}
