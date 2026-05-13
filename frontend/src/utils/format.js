import dayjs from 'dayjs';

export function formatDateTime(value) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
}

export function statusColor(status) {
  if (status === 'DONE') {
    return 'green';
  }

  if (status === 'DOING') {
    return 'blue';
  }

  return 'default';
}

export const statusOptions = [
  { label: '대기', value: 'TODO' },
  { label: '진행', value: 'DOING' },
  { label: '완료', value: 'DONE' }
];

export const statusLabels = {
  TODO: '대기',
  DOING: '진행',
  DONE: '완료'
};
