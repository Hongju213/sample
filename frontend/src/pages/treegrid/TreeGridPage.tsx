import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Card, Tree, Tag, Typography, Space, Spin, Button, Alert, Tooltip } from 'antd';
import { ReloadOutlined, DragOutlined } from '@ant-design/icons';
import type { TreeProps } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, ColDef, GridApi } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { fetchTreeNodes, fetchGridItems } from '../../apis/treeGridApi';
import { TreeNodeDto } from '../../common/types';
import './TreeGridPage.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const { Title, Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

type NodePayload = {
  nodeKey: string;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  path: string;
};

type EditableRow = {
  id: number;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  path: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DND_KEY        = 'application/x-node-payload';
const SEL_COL_ID     = 'ag-Grid-SelectionColumn';
const PATH_COL_ID    = 'path';
const DATA_COLS      = ['col1', 'col2', 'col3', 'col4', 'col5'] as const;
const INITIAL_ROWS   = 8;

// 각 트리 노드의 드래그 페이로드 (key 패턴 기반으로 자동 생성)
const makePayload = (key: string): NodePayload => ({
  nodeKey: key,
  col1: `${key}::c1`,
  col2: `${key}::c2`,
  col3: `${key}::c3`,
  col4: `${key}::c4`,
  col5: `${key}::c5`,
  path: key,
});

const NODE_PAYLOADS: Record<string, NodePayload> = Object.fromEntries(
  ['aaa', 'aaa-1', 'aaa-2', 'aaa-1-1', 'aaa-1-2', 'aaa-2-1',
   'bbb', 'bbb-1', 'bbb-2', 'bbb-1-1',
   'ccc', 'ccc-1', 'ccc-2', 'ccc-2-1', 'ccc-2-2']
    .map(k => [k, makePayload(k)])
);

// 경로 세그먼트 포맷: /${value}
const toPathSeg = (value: string) => '/${' + value + '}';

const makeEmptyRows = (): EditableRow[] =>
  Array.from({ length: INITIAL_ROWS }, (_, i) => ({
    id: i + 1,
    col1: '', col2: '', col3: '', col4: '', col5: '', path: '',
  }));

// ─── Column Definitions ───────────────────────────────────────────────────────

const COL_DEFS: ColDef<EditableRow>[] = [
  { field: 'col1', headerName: 'Col1', flex: 1 },
  { field: 'col2', headerName: 'Col2', flex: 1 },
  { field: 'col3', headerName: 'Col3', flex: 1 },
  { field: 'col4', headerName: 'Col4', flex: 1 },
  { field: 'col5', headerName: 'Col5', flex: 1 },
  {
    field: 'path',
    headerName: '경로',
    flex: 2,
    cellClass: 'path-cell',
    tooltipField: 'path',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toAntTree(nodes: TreeNodeDto[]): any[] {
  return nodes.map(n => ({
    key: n.nodeKey,
    title: n.nodeName,
    children: n.children?.length ? toAntTree(n.children) : undefined,
  }));
}

type DropZone = 'checkbox' | 'col' | 'path';

function getDropZone(colId: string): DropZone {
  if (colId === SEL_COL_ID) return 'checkbox';
  if (colId === PATH_COL_ID) return 'path';
  return 'col';
}

function getHighlightClass(zone: DropZone) {
  return { checkbox: 'dnd-over-checkbox', col: 'dnd-over-col', path: 'dnd-over-path' }[zone];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TreeGridPage() {
  const [selectedKey, setSelectedKey]   = useState<string | null>(null);
  const [rowData, setRowData]           = useState<EditableRow[]>(makeEmptyRows);

  const gridApiRef  = useRef<GridApi<EditableRow> | null>(null);
  const hlCellRef   = useRef<HTMLElement | null>(null);   // 현재 하이라이트 셀

  // ── Data Fetching ──────────────────────────────────────────────────────────

  const { data: treeNodes = [], isLoading: treeLoading, error: treeError } = useQuery({
    queryKey: ['treeNodes'],
    queryFn: fetchTreeNodes,
    staleTime: 300_000,
  });

  const { data: apiPage, isLoading: gridLoading } = useQuery({
    queryKey: ['gridItems', selectedKey],
    queryFn: () => fetchGridItems({ nodeKey: selectedKey!, page: 0, size: 200 }),
    enabled: !!selectedKey,
    staleTime: 60_000,
  });

  // 트리 노드 클릭 → API 데이터를 편집 가능한 행으로 복사
  useEffect(() => {
    if (apiPage?.content) {
      setRowData(
        apiPage.content.length
          ? apiPage.content.map((r, i) => ({
              id: i + 1,
              col1: r.col1, col2: r.col2, col3: r.col3,
              col4: r.col4, col5: r.col5, path: '',
            }))
          : makeEmptyRows()
      );
    }
  }, [apiPage]);

  // ── Highlight Helpers (DOM 직접 조작 - 리렌더 없이 시각 피드백) ──────────

  const clearHL = useCallback(() => {
    hlCellRef.current?.classList.remove('dnd-over-checkbox', 'dnd-over-col', 'dnd-over-path');
    hlCellRef.current = null;
  }, []);

  const applyHL = useCallback((cell: HTMLElement, zone: DropZone) => {
    if (cell === hlCellRef.current) return;
    clearHL();
    hlCellRef.current = cell;
    cell.classList.add(getHighlightClass(zone));
  }, [clearHL]);

  // ── Drop Target Resolution ─────────────────────────────────────────────────

  const resolveTarget = (e: React.DragEvent) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('.ag-cell');
    const row  = cell?.closest<HTMLElement>('[row-index]');
    if (!cell || !row) return null;
    const colId    = cell.getAttribute('col-id') ?? '';
    const rowIndex = parseInt(row.getAttribute('row-index') ?? '-1');
    if (rowIndex < 0) return null;
    return { cell, colId, rowIndex };
  };

  // ── Drag & Drop Handlers ───────────────────────────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.types.includes(DND_KEY)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const t = resolveTarget(e);
    if (t) applyHL(t.cell, getDropZone(t.colId));
  }, [applyHL]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) clearHL();
  }, [clearHL]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    clearHL();

    const raw = e.dataTransfer.getData(DND_KEY);
    if (!raw) return;

    let payload: NodePayload;
    try { payload = JSON.parse(raw); } catch { return; }

    const t = resolveTarget(e);
    if (!t) return;

    // 소트/필터 고려: GridApi로 실제 row 데이터 취득
    const rowNode = gridApiRef.current?.getDisplayedRowAtIndex(t.rowIndex);
    if (!rowNode?.data) return;
    const rowId = (rowNode.data as EditableRow).id;

    setRowData(prev => {
      const idx = prev.findIndex(r => r.id === rowId);
      if (idx < 0) return prev;

      const next = [...prev];
      const row  = { ...next[idx] };
      const zone = getDropZone(t.colId);

      if (zone === 'checkbox') {
        // 전체 행 적용
        DATA_COLS.forEach(c => { row[c] = payload[c]; });
        row.path = toPathSeg(payload.path);
      } else if (zone === 'path') {
        // 경로 누적: /${a}/${b} 형태로 이어 붙임
        const seg = toPathSeg(payload.path);
        row.path  = row.path ? row.path + seg : seg;
      } else {
        // 해당 컬럼만 적용
        const colId = t.colId as (typeof DATA_COLS)[number];
        if ((DATA_COLS as readonly string[]).includes(colId)) {
          row[colId] = payload[colId];
        }
      }

      next[idx] = row;
      return next;
    });
  }, [clearHL]);

  // ── Tree Node Title (드래그 가능하게 커스텀 렌더링) ───────────────────────

  const renderTitle = useCallback((node: any) => {
    const payload = NODE_PAYLOADS[node.key as string];
    return (
      <Tooltip
        title={payload ? `드래그하여 그리드에 적용` : undefined}
        placement="right"
        mouseEnterDelay={0.6}
      >
        <span
          className={`tree-node-label${payload ? ' draggable' : ''}`}
          draggable={!!payload}
          onDragStart={e => {
            if (!payload) return;
            e.dataTransfer.setData(DND_KEY, JSON.stringify(payload));
            e.dataTransfer.effectAllowed = 'copy';
            e.stopPropagation();
          }}
          onDragEnd={clearHL}
        >
          {payload && <DragOutlined className="drag-icon" />}
          {node.title}
        </span>
      </Tooltip>
    );
  }, [clearHL]);

  // ── Memos ──────────────────────────────────────────────────────────────────

  const antTreeData = useMemo(() => toAntTree(treeNodes), [treeNodes]);

  const handleTreeSelect: TreeProps['onSelect'] = useCallback((keys: React.Key[]) => {
    if (keys.length > 0) setSelectedKey(String(keys[0]));
  }, []);

  const handleReset = useCallback(() => {
    setRowData(makeEmptyRows());
    setSelectedKey(null);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="tree-grid-page">
      <Title level={4} style={{ marginBottom: 16 }}>트리 + 그리드</Title>

      <div className="tree-grid-layout">

        {/* ── 좌측: 트리 패널 ────────────────────────────────────────────── */}
        <Card
          title={
            <Space>
              <span>트리</span>
              <Text type="secondary" style={{ fontSize: 11 }}>노드 드래그 가능</Text>
            </Space>
          }
          size="small"
          className="tree-panel"
        >
          {treeError && <Alert type="error" message="로드 실패" showIcon style={{ marginBottom: 8 }} />}
          {treeLoading
            ? <Spin style={{ display: 'block', marginTop: 24 }} />
            : (
              <Tree
                treeData={antTreeData}
                defaultExpandAll
                selectedKeys={selectedKey ? [selectedKey] : []}
                onSelect={handleTreeSelect}
                titleRender={renderTitle}
                blockNode
                className="node-tree"
              />
            )
          }
        </Card>

        {/* ── 우측: 그리드 패널 ──────────────────────────────────────────── */}
        <Card
          size="small"
          className="grid-panel"
          title={
            <Space>
              <span>{selectedKey ? `[${selectedKey}] 데이터` : '트리 노드를 클릭하거나 드래그하세요'}</span>
              {gridLoading && <Spin size="small" />}
            </Space>
          }
          extra={
            <Button size="small" icon={<ReloadOutlined />} onClick={handleReset}>
              초기화
            </Button>
          }
        >
          <div
            className="ag-theme-quartz treegrid-grid"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <AgGridReact<EditableRow>
              rowData={gridLoading ? undefined : rowData}
              loading={gridLoading}
              columnDefs={COL_DEFS}
              defaultColDef={{ sortable: true, resizable: true, filter: 'agTextColumnFilter' }}
              rowSelection={{ mode: 'multiRow', checkboxes: true, headerCheckbox: true }}
              pagination
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50]}
              getRowId={p => String(p.data.id)}
              onGridReady={e => {
                gridApiRef.current = e.api;
                e.api.sizeColumnsToFit();
              }}
              overlayNoRowsTemplate="<span style='color:#999'>데이터가 없습니다</span>"
            />
          </div>

          {/* 사용 안내 */}
          <div className="dnd-hint">
            <span className="hint-item hint-checkbox">■ 체크박스 : 전체 행 적용</span>
            <span className="hint-item hint-col">■ 각 컬럼 : 해당 값만 적용</span>
            <span className="hint-item hint-path">■ 경로 컬럼 : <code>/$&#123;값&#125;</code> 누적</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
