import type { Verdict } from '@/domain/types';

export function formatTime(time: number): string {
  const date = new Date(time);
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export const VERDICT_LABELS: Record<Verdict, string> = {
  ok: '大丈夫',
  gray: 'グレー',
  out: 'アウト',
};
