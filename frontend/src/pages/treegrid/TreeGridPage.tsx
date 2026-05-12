import { useState, useCallback, useRef } from 'react';
import { Card, Tree, Tag, Typography, Space, Spin, Empty } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, ColDef, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { fetchDepartmentEmployees, Employee } from '../../apis/treeGridApi';
import './TreeGridPage.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const { Title, Text } = Typography;

const TREE_DATA: TreeDataNode[] = [
  {
    key: 'root',
    title: '전체',
    children: [
      {
        key: 'dev',
        title: '개발본부',
        children: [
          { key: 'frontend', title: '프론트엔드팀' },
          { key: 'backend', title: '백엔드팀' },
          { key: 'devops', title: 'DevOps팀' }
        ]
      },
      {
        key: 'plan',
        title: '기획본부',
        children: [
          { key: 'product', title: '제품기획팀' },
          { key: 'ux', title: 'UX팀' }
        ]
      },
      {
        key: 'mgmt',
        title: '경영지원본부',
        children: [
          { key: 'hr', title: '인사팀' },
          { key: 'finance', title: '재무팀' }
        ]
      }
    ]
  }
];

const STATUS_COLOR: Record<Employee['status'], string> = {
  active: 'green',
  leave: 'orange',
  inactive: 'default'
};

const STATUS_LABEL: Record<Employee['status'], string> = {
  active: '재직',
  leave: '휴직',
  inactive: '퇴직'
};

const DEPT_LABEL: Record<string, string> = {
  root: '전체',
  dev: '개발본부',
  frontend: '프론트엔드팀',
  backend: '백엔드팀',
  devops: 'DevOps팀',
  plan: '기획본부',
  product: '제품기획팀',
  ux: 'UX팀',
  mgmt: '경영지원본부',
  hr: '인사팀',
  finance: '재무팀'
};

const columnDefs: ColDef<Employee>[] = [
  {
    headerName: 'No',
    valueGetter: params => (params.node?.rowIndex ?? 0) + 1,
    width: 65,
    sortable: false,
    filter: false,
    pinned: 'left'
  },
  {
    field: 'name',
    headerName: '이름',
    width: 100,
    filter: 'agTextColumnFilter'
  },
  {
    field: 'department',
    headerName: '소속',
    width: 140,
    filter: 'agTextColumnFilter'
  },
  {
    field: 'position',
    headerName: '직급',
    width: 130,
    filter: 'agTextColumnFilter'
  },
  {
    field: 'project',
    headerName: '담당 프로젝트',
    flex: 1,
    filter: 'agTextColumnFilter'
  },
  {
    field: 'email',
    headerName: '이메일',
    flex: 1,
    filter: 'agTextColumnFilter'
  },
  {
    field: 'joinDate',
    headerName: '입사일',
    width: 110,
    filter: 'agDateColumnFilter'
  },
  {
    field: 'status',
    headerName: '상태',
    width: 90,
    filter: 'agTextColumnFilter',
    cellRenderer: (params: { value: Employee['status'] }) => {
      if (!params.value) return null;
      const color = STATUS_COLOR[params.value];
      const label = STATUS_LABEL[params.value];
      return `<span class="emp-status emp-status--${params.value}">${label}</span>`;
    }
  }
];

export default function TreeGridPage() {
  const [selectedKey, setSelectedKey] = useState<string>('root');
  const gridRef = useRef<AgGridReact<Employee>>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['departmentEmployees', selectedKey],
    queryFn: () => fetchDepartmentEmployees(selectedKey),
    staleTime: 60_000
  });

  const handleSelect: TreeProps['onSelect'] = useCallback(
    (keys: React.Key[]) => {
      if (keys.length > 0) {
        setSelectedKey(String(keys[0]));
      }
    },
    []
  );

  const handleGridReady = useCallback((e: GridReadyEvent) => {
    e.api.sizeColumnsToFit();
  }, []);

  return (
    <div className="tree-grid-page">
      <Title level={4} style={{ marginBottom: 16 }}>부서별 직원 조회</Title>

      <div className="tree-grid-layout">
        {/* Left: Tree Panel */}
        <Card
          title="조직도"
          size="small"
          className="tree-panel"
        >
          <Tree
            treeData={TREE_DATA}
            defaultExpandAll
            selectedKeys={[selectedKey]}
            onSelect={handleSelect}
            blockNode
            className="dept-tree"
          />
        </Card>

        {/* Right: Grid Panel */}
        <Card
          size="small"
          className="grid-panel"
          title={
            <Space>
              <span>{DEPT_LABEL[selectedKey] ?? selectedKey}</span>
              {!isLoading && (
                <Tag color="blue">{data.length}명</Tag>
              )}
            </Space>
          }
        >
          {isLoading ? (
            <div className="grid-loading">
              <Spin tip="조회 중..." />
            </div>
          ) : (
            <div className="ag-theme-quartz treegrid-grid">
              <AgGridReact<Employee>
                ref={gridRef}
                rowData={data}
                columnDefs={columnDefs}
                defaultColDef={{
                  sortable: true,
                  resizable: true,
                  filter: true
                }}
                rowSelection={{ mode: 'singleRow' }}
                pagination
                paginationPageSize={15}
                paginationPageSizeSelector={[10, 15, 30, 50]}
                onGridReady={handleGridReady}
                overlayNoRowsTemplate="<span style='color:#999'>해당 부서에 직원이 없습니다</span>"
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
