import { useId, useRef } from 'react';

import type { CupLayer } from '@/domain/evaluate';
import { findDrink } from '@/domain/drinks';
import type { DrinkId, Thresholds } from '@/domain/types';
import { cn } from '@/lib/utils';

const CUP_PATH = 'M3 4 H45 L40.5 51 Q40 56 35 56 H13 Q8 56 7.5 51 Z';
const LIQUID_TOP = 6;
const LIQUID_BOTTOM = 56;
const LIQUID_HEIGHT = LIQUID_BOTTOM - LIQUID_TOP;

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

type TonightCupProps = {
  layers: (CupLayer & { key: string })[];
  thresholds: Thresholds;
  className?: string;
};

export function TonightCup({ layers, thresholds, className }: TonightCupProps) {
  const clipId = useId();
  // 画面を開いた時点の層まで注ぐ動きを再生すると、記録の操作と関係なく毎回動いてしまうため、
  // 初回の描画にあった層は動かさない
  const initialKeys = useRef<Set<string> | null>(null);
  if (initialKeys.current === null) {
    initialKeys.current = new Set(layers.map((l) => l.key));
  }

  const total = layers.reduce((sum, l) => sum + l.residualMg, 0);
  const scaleMax = Math.max(thresholds.upper * 1.25, total * 1.08, 1);
  const yOf = (mg: number) => LIQUID_BOTTOM - (Math.min(mg, scaleMax) / scaleMax) * LIQUID_HEIGHT;

  let stacked = 0;
  const rects = layers.map((layer) => {
    const bottom = yOf(stacked);
    stacked += layer.residualMg;
    const top = yOf(stacked);
    return { layer, y: top, height: bottom - top };
  });

  const description = layers
    .map((l) => `${findDrink(l.drinkId).name} ${Math.round(l.residualMg)}mg`)
    .join('、');

  return (
    <svg
      viewBox='0 0 48 60'
      role='img'
      aria-label={`今夜のカップ。${description === '' ? 'まだ空です' : description}。目盛りは ${thresholds.lower}mg と ${thresholds.upper}mg`}
      className={cn('shrink-0 overflow-visible', className)}
    >
      <clipPath id={clipId}>
        <path d={CUP_PATH} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        {rects.map(({ layer, y, height }) => (
          <rect
            key={layer.key}
            x='0'
            y={y}
            width='48'
            height={Math.max(height, 0)}
            fill={drinkColor(layer.drinkId)}
            className={initialKeys.current?.has(layer.key) === true ? undefined : 'cup-layer-enter'}
          />
        ))}
      </g>
      {(
        [
          ['lower', thresholds.lower],
          ['upper', thresholds.upper],
        ] as const
      ).map(([name, mg]) => (
        <line
          key={name}
          x1='1'
          x2='47'
          y1={yOf(mg)}
          y2={yOf(mg)}
          stroke='currentColor'
          strokeOpacity='0.55'
          strokeWidth='1.25'
          strokeDasharray='3 2.5'
        />
      ))}
      <path d={CUP_PATH} fill='none' stroke='currentColor' strokeOpacity='0.6' strokeWidth='2.5' />
    </svg>
  );
}
