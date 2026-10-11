import { CircleAlert, CircleCheck, CircleX, type LucideIcon } from 'lucide-react';

import type { Verdict } from '@/domain/types';
import { VERDICT_LABELS } from '@/lib/format';
import { cn } from '@/lib/utils';

const VERDICT_ICONS: Record<Verdict, LucideIcon> = {
  ok: CircleCheck,
  gray: CircleAlert,
  out: CircleX,
};

const TEXT_CLASSES: Record<Verdict, string> = {
  ok: 'text-verdict-ok-text',
  gray: 'text-verdict-gray-text',
  out: 'text-verdict-out-text',
};

// 大丈夫の日がほとんどのため、大丈夫まで塗ると全ボタンが同じ強さで並び、グレーとアウトが目立たなくなる
const BADGE_CLASSES: Record<Verdict, string> = {
  ok: 'text-verdict-ok-text font-medium',
  gray: 'bg-verdict-gray text-verdict-on rounded-full px-2.5 py-1 font-bold',
  out: 'bg-verdict-out text-verdict-on rounded-full px-2.5 py-1 font-bold',
};

type VerdictLabelProps = {
  verdict: Verdict;
  className?: string;
};

export function VerdictLabel({ verdict, className }: VerdictLabelProps) {
  const Icon = VERDICT_ICONS[verdict];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 align-[-0.15em] font-bold',
        TEXT_CLASSES[verdict],
        className,
      )}
    >
      <Icon aria-hidden className='size-[1.05em] shrink-0' strokeWidth={2.5} />
      {VERDICT_LABELS[verdict]}
    </span>
  );
}

export function VerdictBadge({ verdict, className }: VerdictLabelProps) {
  const Icon = VERDICT_ICONS[verdict];
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 text-base leading-none',
        BADGE_CLASSES[verdict],
        className,
      )}
    >
      <Icon aria-hidden className='size-[1.1em] shrink-0' strokeWidth={2.5} />
      {VERDICT_LABELS[verdict]}
    </span>
  );
}
