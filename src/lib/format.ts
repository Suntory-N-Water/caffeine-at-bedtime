import type { Verdict } from '@/domain/types';

const timeFormat = new Intl.DateTimeFormat('ja-JP', { hour: 'numeric', minute: '2-digit' });

export function formatTime(time: number): string {
  return timeFormat.format(time);
}

export const VERDICT_LABELS: Record<Verdict, string> = {
  ok: '大丈夫',
  gray: 'グレー',
  out: 'アウト',
};
