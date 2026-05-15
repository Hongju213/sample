import React, { useMemo } from 'react';
import { Alert, Card, Spin, Tree } from 'antd';
import { beginTreeDrag, endTreeDrag } from './treeGridUtils.js';

export default function TreePanel({
  treeData,
  selectedKey,
  loading,
  error,
  onSelectNode
}) {
  const handleSelect = keys => {
    onSelectNode(keys.length > 0 ? String(keys[0]) : null);
  };

  const draggableTreeData = useMemo(() => makeDraggableTreeData(treeData), [treeData]);

  return (
    <Card title="Tree" size="small" className="tree-panel">
      {error && <Alert type="error" message="Tree data could not be loaded." showIcon />}
      {loading ? (
        <Spin className="panel-spinner" />
      ) : (
        <Tree
          treeData={draggableTreeData}
          defaultExpandAll
          blockNode
          selectedKeys={selectedKey ? [selectedKey] : []}
          onSelect={handleSelect}
          className="node-tree"
        />
      )}
    </Card>
  );
}

function makeDraggableTreeData(nodes) {
  return nodes.map(node => {
    const nodeName = getNodeTitleText(node.title);

    return {
      ...node,
      title: (
        <div
          className="node-tree-title"
          draggable
          onDragStart={event => {
            event.stopPropagation();
            beginTreeDrag(event, {
              nodeKey: String(node.key),
              nodeName
            });
          }}
          onDragEnd={endTreeDrag}
        >
          {node.title}
        </div>
      ),
      children: node.children?.length ? makeDraggableTreeData(node.children) : undefined
    };
  });
}

function getNodeTitleText(title) {
  if (typeof title === 'string' || typeof title === 'number') {
    return String(title);
  }

  return '';
}
