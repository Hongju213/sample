import dayjs from 'dayjs';

export function formatDateTime(value?: string) {
  if (!value) {
    return '-';
  }
  return dayjs(value).format('YYYY-MM-DD HH:mm');
}

export function statusColor(status: string) {
  if (status === 'DONE') {
    return 'green';
  }
  if (status === 'DOING') {
    return 'blue';
  }
  return 'default';
}
