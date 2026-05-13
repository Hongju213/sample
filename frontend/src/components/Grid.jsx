import React, { forwardRef } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Empty, Select, Space, Spin, Typography } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import './Grid.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const Grid = forwardRef(function Grid(
  {
    list = [],
    columnDefs = [],
    gridOptions = {},
    loading = false,
    error = null,
    currentPage = 1,
    pages = 0,
    totalCount = 0,
    pageSize = 10,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    onClicked,
    onDoubleClicked,
    onChangePageSize,
    onChangeCurrentPage
  },
  ref
) {
  const { defaultColDef, onGridReady, ...restGridOptions } = gridOptions;
  const safeCurrentPage = Math.max(currentPage || 1, 1);
  const safePages = Math.max(pages || 0, 0);
  const hasPagination = safePages > 0;

  const handleGridReady = event => {
    onGridReady?.(event);
    event.api.sizeColumnsToFit();
  };

  return (
    <div className="common-grid">
      <div className="common-grid__body">
        <AgGridReact
          ref={ref}
          rowData={list}
          loading={loading}
          columnDefs={columnDefs}
          defaultColDef={{
            sortable: true,
            resizable: true,
            filter: true,
            minWidth: 90,
            ...defaultColDef
          }}
          rowSelection={{ mode: 'singleRow', checkboxes: false, enableClickSelection: true }}
          theme="legacy"
          getRowId={params => String(params.data.id)}
          onRowClicked={onClicked}
          onRowDoubleClicked={onDoubleClicked}
          overlayNoRowsTemplate="<span class='common-grid__empty-text'>데이터가 없습니다.</span>"
          {...restGridOptions}
          onGridReady={handleGridReady}
        />
        {error && (
          <div className="common-grid__overlay">
            <Empty description="목록을 불러오지 못했습니다." />
          </div>
        )}
      </div>

      <div className="common-grid__footer">
        <Space size={8} wrap>
          <Typography.Text type="secondary">총 {totalCount.toLocaleString()}건</Typography.Text>
          <Select
            size="small"
            value={pageSize}
            options={pageSizeOptions.map(size => ({ value: size, label: `${size}개씩` }))}
            onChange={onChangePageSize}
            className="common-grid__page-size"
          />
        </Space>

        <Space size={4} className="common-grid__pager">
          <Button
            size="small"
            icon={<LeftOutlined />}
            disabled={!hasPagination || safeCurrentPage <= 1}
            onClick={() => onChangeCurrentPage?.(safeCurrentPage - 1)}
          />
          <Typography.Text className="common-grid__page-info">
            {hasPagination ? `${safeCurrentPage} / ${safePages}` : '0 / 0'}
          </Typography.Text>
          <Button
            size="small"
            icon={<RightOutlined />}
            disabled={!hasPagination || safeCurrentPage >= safePages}
            onClick={() => onChangeCurrentPage?.(safeCurrentPage + 1)}
          />
          {loading && <Spin size="small" />}
        </Space>
      </div>
    </div>
  );
});

export default Grid;
