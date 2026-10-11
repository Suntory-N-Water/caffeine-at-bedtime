import type { Thresholds } from '@/domain/types';
import { cn } from '@/lib/utils';

export type GaugeSegment = {
  key: string;
  mg: number;
  color: string;
  enter?: boolean;
};

type GaugeProps = {
  segments: GaugeSegment[];
  scaleMax: number;
  thresholds: Thresholds;
  className?: string;
};

export function Gauge({ segments, scaleMax, thresholds, className }: GaugeProps) {
  const percent = (mg: number) => `${(Math.min(Math.max(mg, 0), scaleMax) / scaleMax) * 100}%`;

  let stacked = 0;
  const placed = segments.map((segment) => {
    const left = stacked;
    stacked += segment.mg;
    return { segment, left };
  });

  return (
    <div aria-hidden className={cn('relative h-3', className)}>
      <div className='bg-muted absolute inset-0 overflow-hidden rounded-full'>
        <div
          className='bg-verdict-gray/45 absolute inset-y-0'
          style={{
            left: percent(thresholds.lower),
            width: percent(thresholds.upper - thresholds.lower),
          }}
        />
        <div
          className='bg-verdict-out/8 absolute inset-y-0 right-0'
          style={{ left: percent(thresholds.upper) }}
        />
        {placed.map(({ segment, left }) => (
          <div
            key={segment.key}
            className={cn(
              'border-card absolute inset-y-0 border-r-2 last:border-r-0',
              segment.enter === true && 'gauge-segment-enter',
            )}
            style={{
              left: percent(left),
              width: percent(segment.mg),
              backgroundColor: segment.color,
            }}
          />
        ))}
      </div>
      {/* 2 つの境目は 5mg しか離れておらず、境目ごとに線を引くと一時停止の記号のように見えるため、
          線はアウトの境目にだけ引き、グレーの範囲は横棒の中の塗りで示す */}
      <div
        className='bg-foreground/80 absolute -inset-y-1 w-0.5 -translate-x-1/2 rounded-full'
        style={{ left: percent(thresholds.upper) }}
      />
    </div>
  );
}

export function gaugeScaleMax(thresholds: Thresholds, values: number[]): number {
  return Math.max(thresholds.upper * 1.5, ...values.map((v) => v * 1.05), 1);
}
