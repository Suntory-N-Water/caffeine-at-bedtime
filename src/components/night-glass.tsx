import { useId } from 'react';

import type { Thresholds } from '@/domain/types';
import { cn } from '@/lib/utils';

export type GlassLayer = {
  key: string;
  mg: number;
  color: string;
  enter: boolean;
};

const GLASS = 'M8 8 H92 L84 120 Q83.5 127 76.5 127 H23.5 Q16.5 127 16 120 Z';
const INSIDE = 'M11 10 H89 L81.3 119 Q80.9 124 76 124 H24 Q19.1 124 18.7 119 Z';
const LIQUID_TOP = 14;
const LIQUID_BOTTOM = 124;
const WAVE = `M-100 4 ${'q12.5 -5 25 0 t25 0 '.repeat(6)}V9 H-100 Z`;

type NightGlassProps = {
  layers: GlassLayer[];
  thresholds: Thresholds;
  label: string;
  className?: string;
};

export function NightGlass({ layers, thresholds, label, className }: NightGlassProps) {
  const clipId = useId();
  const total = layers.reduce((sum, l) => sum + l.mg, 0);
  const scaleMax = Math.max(thresholds.upper * 1.35, total * 1.08, 1);
  const yOf = (mg: number) =>
    LIQUID_BOTTOM - (Math.min(mg, scaleMax) / scaleMax) * (LIQUID_BOTTOM - LIQUID_TOP);

  let stacked = 0;
  const rects = layers.map((layer) => {
    const bottom = yOf(stacked);
    stacked += layer.mg;
    return { layer, top: yOf(stacked), bottom };
  });
  const topLayer = rects.at(-1);

  return (
    <svg
      viewBox='0 0 100 132'
      role='img'
      aria-label={label}
      className={cn('shrink-0 overflow-visible', className)}
    >
      <clipPath id={clipId}>
        <path d={INSIDE} />
      </clipPath>
      <path d={GLASS} fill='#ffffff' fillOpacity='0.08' />
      <g clipPath={`url(#${clipId})`}>
        {rects.map(({ layer, top, bottom }) => (
          <rect
            key={layer.key}
            x='0'
            y={top}
            width='100'
            height={Math.max(bottom - top, 0)}
            fill={layer.color}
            className={layer.enter ? 'glass-layer-enter' : undefined}
          />
        ))}
        {topLayer !== undefined && topLayer.bottom - topLayer.top > 0.5 && (
          // 一番上の層の表面だけを波打たせ、液体が注がれた器に見せる
          <g transform={`translate(0 ${topLayer.top - 4})`}>
            <path className='glass-wave' d={WAVE} fill={topLayer.layer.color} />
          </g>
        )}
        <line
          x1='0'
          x2='100'
          y1={yOf(thresholds.lower)}
          y2={yOf(thresholds.lower)}
          stroke='#ffffff'
          strokeOpacity='0.45'
          strokeWidth='1'
          strokeDasharray='3 3'
        />
        <line
          x1='0'
          x2='100'
          y1={yOf(thresholds.upper)}
          y2={yOf(thresholds.upper)}
          stroke='#ffffff'
          strokeOpacity='0.85'
          strokeWidth='1.5'
        />
      </g>
      <path
        d='M20 20 L25 100'
        stroke='#ffffff'
        strokeOpacity='0.25'
        strokeWidth='3'
        strokeLinecap='round'
      />
      <path
        d={GLASS}
        fill='none'
        stroke='#ffffff'
        strokeOpacity='0.7'
        strokeWidth='2.5'
        strokeLinejoin='round'
      />
    </svg>
  );
}
