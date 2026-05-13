import React from 'react';
import { Alert, Card, Spin, Tree } from 'antd';
import { TREE_NODE_MIME } from './treeGridUtils.js';

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

  const handleTreeDragStart = ({ event, node }) => {
    const dragData = {
      nodeKey: String(node.key),
      nodeName: String(node.title)
    };

    event.dataTransfer.setData(TREE_NODE_MIME, JSON.stringify(dragData));
    event.dataTransfer.setData('text/plain', dragData.nodeName);
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <Card title="Tree" size="small" className="tree-panel">
      {error && <Alert type="error" message="Tree data could not be loaded." showIcon />}
      {loading ? (
        <Spin className="panel-spinner" />
      ) : (
        <Tree
          treeData={treeData}
          defaultExpandAll
          draggable
          blockNode
          selectedKeys={selectedKey ? [selectedKey] : []}
          onSelect={handleSelect}
          onDragStart={handleTreeDragStart}
          className="node-tree"
        />
      )}
    </Card>
  );
}
