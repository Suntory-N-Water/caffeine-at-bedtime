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

const PILL_CLASSES: Record<Verdict, string> = {
  ok: 'bg-verdict-ok',
  gray: 'bg-verdict-gray',
  out: 'bg-verdict-out',
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

export function VerdictPill({ verdict, className }: VerdictLabelProps) {
  const Icon = VERDICT_ICONS[verdict];
  return (
    <span
      className={cn(
        'text-verdict-on inline-flex items-center gap-1 rounded-full py-1 pr-3 pl-2 text-xl leading-none font-bold',
        PILL_CLASSES[verdict],
        className,
      )}
    >
      <Icon aria-hidden className='size-5 shrink-0' strokeWidth={2.5} />
      {VERDICT_LABELS[verdict]}
    </span>
  );
}
