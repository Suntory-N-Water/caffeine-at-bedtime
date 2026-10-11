import type { CSSProperties } from 'react';

import type { DrinkAssessment } from '@/domain/evaluate';
import { VERDICT_LABELS } from '@/lib/format';
import { DrinkSwatch, drinkColor } from './cup';
import { VerdictPill } from './verdict-label';

type DrinkButtonProps = {
  assessment: DrinkAssessment;
  onRecord: () => void;
};

export function DrinkButton({ assessment, onRecord }: DrinkButtonProps) {
  const { drink, caffeineMg, residualMg, verdict } = assessment;
  const estimate = drink.isEstimate ? '（推定値）' : '';
  const label = `${drink.name}、${caffeineMg}mg${estimate}、今飲むと就寝時 ${residualMg}mg、${VERDICT_LABELS[verdict]}`;

  return (
    <button
      type='button'
      aria-label={label}
      onClick={onRecord}
      style={{ '--liquid': drinkColor(drink.id) } as CSSProperties}
      className='bg-card focus-visible:ring-ring/60 flex min-h-[4.5rem] w-full touch-manipulation items-center gap-3 rounded-2xl px-3 py-3 text-left shadow-[0_1px_2px_rgb(63_49_43/0.08),0_2px_8px_-2px_rgb(63_49_43/0.08)] transition-[background-color,transform] duration-150 ease-out outline-none hover:bg-[color-mix(in_oklch,var(--liquid)_8%,var(--card))] focus-visible:ring-3 active:scale-[0.98] active:bg-[color-mix(in_oklch,var(--liquid)_18%,var(--card))] active:duration-75 motion-reduce:active:scale-100 dark:shadow-none'
    >
      <DrinkSwatch drinkId={drink.id} className='size-10' />
      <span className='flex min-w-0 grow flex-col'>
        <span className='text-base leading-snug font-bold break-keep'>{drink.name}</span>
        {drink.detail !== null && (
          <span className='text-muted-foreground text-sm leading-snug'>{drink.detail}</span>
        )}
        <span className='text-muted-foreground text-base leading-snug tabular-nums'>
          {caffeineMg}mg
          {drink.isEstimate && <span className='ml-1 text-sm'>推定値</span>}
        </span>
      </span>
      <span className='flex shrink-0 flex-col items-end gap-1'>
        <VerdictPill verdict={verdict} />
        <span className='text-muted-foreground text-base tabular-nums'>就寝時 {residualMg}mg</span>
      </span>
    </button>
  );
}
