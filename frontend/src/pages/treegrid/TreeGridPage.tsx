import { useState, useCallback, useRef, useMemo } from 'react';
import { Card, Tree, Tag, Typography, Space, Spin, Alert } from 'antd';
import type { TreeProps } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, ColDef, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { fetchTreeNodes, fetchGridItems } from '../../apis/treeGridApi';
import { GridItemDto, TreeNodeDto } from '../../common/types';
import './TreeGridPage.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const { Title } = Typography;

// TreeNodeDto → Ant Design Tree 형식으로 변환
function toAntTreeData(nodes: TreeNodeDto[]): any[] {
  return nodes.map(node => ({
    key: node.nodeKey,
    title: node.nodeName,
    children: node.children?.length ? toAntTreeData(node.children) : undefined
  }));
}

const COLUMN_DEFS: ColDef<GridItemDto>[] = [
  {
    headerName: 'No',
    valueGetter: p => (p.node?.rowIndex ?? 0) + 1,
    width: 65,
    sortable: false,
    filter: false,
    pinned: 'left'
  },
  { field: 'id',      headerName: 'ID',      width: 80,  filter: 'agNumberColumnFilter' },
  { field: 'nodeKey', headerName: 'Node Key', width: 120, filter: 'agTextColumnFilter' },
  { field: 'col1',    headerName: 'Col1',     flex: 1,    filter: 'agTextColumnFilter' },
  { field: 'col2',    headerName: 'Col2',     flex: 1,    filter: 'agTextColumnFilter' },
  { field: 'col3',    headerName: 'Col3',     width: 100, filter: 'agTextColumnFilter' },
  { field: 'col4',    headerName: 'Col4',     width: 100, filter: 'agTextColumnFilter' },
  { field: 'col5',    headerName: 'Col5',     width: 100, filter: 'agTextColumnFilter' }
];

const PAGE_SIZE = 10;

export default function TreeGridPage() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const gridRef = useRef<AgGridReact<GridItemDto>>(null);

  // 트리 노드 조회
  const {
    data: treeNodes = [],
    isLoading: treeLoading,
    error: treeError
  } = useQuery({
    queryKey: ['treeNodes'],
    queryFn: fetchTreeNodes,
    staleTime: 300_000
  });

  const treeData = useMemo(() => toAntTreeData(treeNodes), [treeNodes]);

  // 선택된 노드의 그리드 데이터 조회
  const {
    data: gridPage,
    isLoading: gridLoading,
    isFetching: gridFetching
  } = useQuery({
    queryKey: ['gridItems', selectedKey, currentPage],
    queryFn: () => fetchGridItems({ nodeKey: selectedKey!, page: currentPage, size: PAGE_SIZE }),
    enabled: !!selectedKey,
    staleTime: 60_000
  });

  const handleSelect: TreeProps['onSelect'] = useCallback((keys: React.Key[]) => {
    if (keys.length > 0) {
      setSelectedKey(String(keys[0]));
      setCurrentPage(0);
    }
  }, []);

  const handleGridReady = useCallback((e: GridReadyEvent) => {
    e.api.sizeColumnsToFit();
  }, []);

  const gridRows = gridPage?.content ?? [];
  const totalElements = gridPage?.totalElements ?? 0;
  const totalPages = gridPage?.totalPages ?? 0;

  return (
    <div className="tree-grid-page">
      <Title level={4} style={{ marginBottom: 16 }}>트리 + 그리드</Title>

      <div className="tree-grid-layout">
        {/* 좌측: 트리 패널 */}
        <Card title="트리" size="small" className="tree-panel">
          {treeError && <Alert type="error" message="트리 데이터 조회 실패" showIcon />}
          {treeLoading ? (
            <Spin style={{ display: 'block', marginTop: 24 }} />
          ) : (
            <Tree
              treeData={treeData}
              defaultExpandAll
              selectedKeys={selectedKey ? [selectedKey] : []}
              onSelect={handleSelect}
              blockNode
              className="node-tree"
            />
          )}
        </Card>

        {/* 우측: 그리드 패널 */}
        <Card
          size="small"
          className="grid-panel"
          title={
            <Space>
              <span>{selectedKey ? `[${selectedKey}] 데이터` : '노드를 선택하세요'}</span>
              {selectedKey && !gridLoading && (
                <Tag color="blue">총 {totalElements}건</Tag>
              )}
              {gridFetching && <Spin size="small" />}
            </Space>
          }
        >
          {!selectedKey ? (
            <div className="grid-empty">
              <span>좌측 트리에서 노드를 클릭하면 데이터가 조회됩니다.</span>
            </div>
          ) : (
            <>
              <div className="ag-theme-quartz treegrid-grid">
                <AgGridReact<GridItemDto>
                  ref={gridRef}
                  rowData={gridLoading ? undefined : gridRows}
                  loading={gridLoading}
                  columnDefs={COLUMN_DEFS}
                  defaultColDef={{ sortable: true, resizable: true }}
                  rowSelection={{ mode: 'singleRow' }}
                  onGridReady={handleGridReady}
                  overlayNoRowsTemplate="<span style='color:#999'>해당 노드의 데이터가 없습니다</span>"
                />
              </div>
              {/* 서버 사이드 페이지네이션 */}
              {totalPages > 1 && (
                <div className="grid-pagination">
                  <button
                    className="pg-btn"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    이전
                  </button>
                  <span className="pg-info">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    className="pg-btn"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
