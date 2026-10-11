import type { CSSProperties } from 'react';

import type { DrinkAssessment } from '@/domain/evaluate';
import { VERDICT_LABELS } from '@/lib/format';
import { drinkColor } from './cup';
import { DrinkVessel } from './drink-vessel';
import { VerdictBadge } from './verdict-label';

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
      className='group bg-card focus-visible:ring-ring/60 flex h-full w-full touch-manipulation flex-col items-center gap-1 rounded-3xl px-2 pt-3 pb-3.5 text-center shadow-[0_1px_0_rgb(63_49_43/0.04),0_6px_16px_-8px_rgb(63_49_43/0.25)] transition-[background-color,transform] duration-150 ease-out outline-none hover:bg-[color-mix(in_oklch,var(--liquid)_10%,var(--card))] focus-visible:ring-3 active:scale-[0.97] active:bg-[color-mix(in_oklch,var(--liquid)_20%,var(--card))] active:duration-75 motion-reduce:active:scale-100 dark:shadow-none'
    >
      <DrinkVessel
        drinkId={drink.id}
        className='text-foreground h-16 w-13 origin-bottom transition-transform duration-200 ease-out group-active:-rotate-[16deg] motion-reduce:group-active:rotate-0'
      />
      <span className='flex min-h-[2.75em] items-center text-[0.9375rem] leading-snug font-bold break-keep'>
        {drink.name}
      </span>
      <span className='text-muted-foreground text-sm leading-none tabular-nums'>
        {caffeineMg}mg{drink.isEstimate && '・推定値'}
      </span>
      <span className='mt-2 flex h-7 items-center'>
        <VerdictBadge verdict={verdict} className='text-sm' />
      </span>
      <span className='text-muted-foreground text-xs tabular-nums'>就寝時 {residualMg}mg</span>
    </button>
  );
}
