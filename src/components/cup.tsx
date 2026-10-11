import { useId } from 'react';

import type { DrinkId } from '@/domain/types';
import { cn } from '@/lib/utils';

const CUP_PATH = 'M3 4 H45 L40.5 51 Q40 56 35 56 H13 Q8 56 7.5 51 Z';

export function drinkColor(drinkId: DrinkId): string {
  return `var(--drink-${drinkId})`;
}

type DrinkSwatchProps = {
  drinkId: DrinkId;
  className?: string;
};

export function DrinkSwatch({ drinkId, className }: DrinkSwatchProps) {
  const clipId = useId();
  return (
    <svg viewBox='0 0 48 60' aria-hidden className={cn('shrink-0', className)}>
      <clipPath id={clipId}>
        <path d={CUP_PATH} />
      </clipPath>
      <rect
        x='0'
        y='18'
        width='48'
        height='42'
        fill={drinkColor(drinkId)}
        clipPath={`url(#${clipId})`}
      />
      <path d={CUP_PATH} fill='none' stroke='currentColor' strokeOpacity='0.35' strokeWidth='2.5' />
    </svg>
  );
}
