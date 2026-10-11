import type { CSSProperties } from 'react';

import type { DrinkAssessment } from '@/domain/evaluate';
import type { Thresholds } from '@/domain/types';
import { VERDICT_LABELS } from '@/lib/format';
import { drinkColor } from './cup';
import { Gauge } from './gauge';
import { VerdictBadge } from './verdict-label';

type DrinkButtonProps = {
  assessment: DrinkAssessment;
  baseMg: number;
  scaleMax: number;
  thresholds: Thresholds;
  onRecord: () => void;
};

export function DrinkButton({
  assessment,
  baseMg,
  scaleMax,
  thresholds,
  onRecord,
}: DrinkButtonProps) {
  const { drink, caffeineMg, residualMg, verdict } = assessment;
  const estimate = drink.isEstimate ? '（推定値）' : '';
  const label = `${drink.name}、${caffeineMg}mg${estimate}、今飲むと就寝時 ${residualMg}mg、${VERDICT_LABELS[verdict]}`;

  return (
    <button
      type='button'
      aria-label={label}
      onClick={onRecord}
      style={{ '--liquid': drinkColor(drink.id) } as CSSProperties}
      className='bg-card focus-visible:ring-ring/60 flex w-full touch-manipulation flex-col gap-2.5 rounded-2xl px-4 pt-3 pb-3.5 text-left shadow-[0_1px_2px_rgb(63_49_43/0.06)] transition-[background-color,transform] duration-150 ease-out outline-none hover:bg-[color-mix(in_oklch,var(--liquid)_8%,var(--card))] focus-visible:ring-3 active:scale-[0.98] active:bg-[color-mix(in_oklch,var(--liquid)_18%,var(--card))] active:duration-75 motion-reduce:active:scale-100 dark:shadow-none'
    >
      <span className='flex items-start gap-3'>
        <span className='min-w-0 grow leading-snug'>
          <span className='text-[1.0625rem] font-bold break-keep'>{drink.name}</span>{' '}
          <span className='text-muted-foreground text-sm whitespace-nowrap tabular-nums'>
            {caffeineMg}mg{drink.isEstimate && '・推定値'}
          </span>
        </span>
        <VerdictBadge verdict={verdict} />
      </span>
      <span className='flex items-center gap-3'>
        <Gauge
          segments={[
            { key: 'base', mg: baseMg, color: 'var(--gauge-base)' },
            { key: 'drink', mg: residualMg - baseMg, color: drinkColor(drink.id) },
          ]}
          scaleMax={scaleMax}
          thresholds={thresholds}
          className='h-2.5 grow'
        />
        <span className='w-12 shrink-0 text-right text-sm font-medium tabular-nums'>
          {residualMg}mg
        </span>
      </span>
    </button>
  );
}
