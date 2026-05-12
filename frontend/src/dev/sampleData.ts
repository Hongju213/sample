import type { DataNode } from 'antd/es/tree';

export const treeData: DataNode[] = [
  {
    title: 'src',
    key: 'src',
    children: [
      { title: 'apis', key: 'apis' },
      { title: 'components', key: 'components' },
      { title: 'pages', key: 'pages' }
    ]
  }
];

export const transferItems = Array.from({ length: 8 }).map((_, index) => ({
  key: String(index),
  title: `권한 ${index + 1}`,
  description: `샘플 권한 ${index + 1}`
}));
