import dayjs from 'dayjs';

// 날짜가 없을 때 화면 곳곳에서 같은 기호를 보여주기 위한 작은 포맷터다.
export function formatDateTime(value) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
}

// 상태별 색상은 Table, Tag, Grid에서 동일하게 재사용한다.
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
