export const formatUsd = (value: number, compact = false): string => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: compact ? 'compact' : 'standard',
  maximumFractionDigits: compact ? 1 : 0,
}).format(value);

export const formatNumber = (value: number): string => new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
}).format(value);

export const formatPercent = (value: number, precision = 0): string => `${(value * 100).toFixed(precision)}%`;

export const formatDate = (value: string): string => {
  const date = new Date(value);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = String(date.getUTCFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
};

export function formatDuration(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return '—';
  if (hours < 24) return `${hours.toFixed(1)}h`;
  const days = hours / 24;
  return `${days.toFixed(days < 10 ? 1 : 0)}d`;
}