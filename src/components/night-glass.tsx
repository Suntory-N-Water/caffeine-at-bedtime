import { type CSSProperties, useId } from 'react';

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
// グラスの縁をアウトの境目の 1.25 倍にする。初期値の 80mg なら 100mg で、
// 寝つきが悪くなった緑茶 500mL の例（約 106mg）であふれ、湯のみ 1 杯の例（約 87mg）は線を越えるだけになる
const CAPACITY_RATIO = 1.25;
const DROPS = [
  { x: 104, delay: 0 },
  { x: 98, delay: 0.45 },
  { x: 106, delay: 0.9 },
  { x: 100, delay: 0.25 },
  { x: 103, delay: 0.65 },
  { x: 107, delay: 1.1 },
];

type NightGlassProps = {
  layers: GlassLayer[];
  thresholds: Thresholds;
  label: string;
  className?: string;
};

export function NightGlass({ layers, thresholds, label, className }: NightGlassProps) {
  const clipId = useId();
  const gooId = useId();
  const total = layers.reduce((sum, l) => sum + l.mg, 0);
  const capacity = Math.max(thresholds.upper * CAPACITY_RATIO, 1);
  const overflowing = total > capacity;
  // あふれた量がアウトの境目の半分に達したところで、流れの太さと水たまりの広さを最大にする
  const spill = overflowing ? Math.min((total - capacity) / (thresholds.upper * 0.5), 1) : 0;
  const yOf = (mg: number) =>
    LIQUID_BOTTOM - (Math.min(mg, capacity) / capacity) * (LIQUID_BOTTOM - LIQUID_TOP);

  let stacked = 0;
  const rects = layers.map((layer, index) => {
    const bottom = yOf(stacked);
    stacked += layer.mg;
    const isTop = index === layers.length - 1;
    return { layer, top: isTop && overflowing ? 0 : yOf(stacked), bottom };
  });
  const topLayer = rects.at(-1);

  return (
    <svg
      viewBox='0 0 100 132'
      role='img'
      aria-label={overflowing ? `${label}。グラスからあふれています` : label}
      className={cn('shrink-0 overflow-visible', className)}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={INSIDE} />
        </clipPath>
        {/* ぼかしてから輪郭をはっきりさせ直し、流れ・しずく・水たまりが近づくとつながる液体に見せる */}
        <filter id={gooId} x='-50%' y='-20%' width='200%' height='140%'>
          <feGaussianBlur in='SourceGraphic' stdDeviation='1.6' />
          <feColorMatrix values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7' />
        </filter>
      </defs>
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
        {!overflowing && topLayer !== undefined && topLayer.bottom - topLayer.top > 0.5 && (
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
      {overflowing && topLayer !== undefined && (
        <Spill color={topLayer.layer.color} amount={spill} filterId={gooId} />
      )}
    </svg>
  );
}

type SpillProps = {
  color: string;
  amount: number;
  filterId: string;
};

// 両側を同じ太さで流すと、グラスを縁取る枠に見える。
// 右の縁からは滝のように落とし、左の縁からは壁を伝う細い筋だけを流して、右側にあふれたように見せる
function Spill({ color, amount, filterId }: SpillProps) {
  const fallWidth = 5 + amount * 4;
  const dome = 6 + amount * 5;
  // 左の筋は、あふれた量が増えるほど壁の下まで伸びる
  const trickleEnd = 46 + amount * 70;
  const trickleX = 6.5 + ((trickleEnd - 8) / 112) * 8;
  const drops = DROPS.slice(0, 2 + Math.round(amount * 4));
  return (
    <g filter={`url(#${filterId})`} fill={color} className='glass-spill'>
      <path
        className='glass-spill-dome'
        d={`M4 15 Q4 8 14 ${8 - dome / 2} Q50 ${8 - dome * 1.5} 86 ${8 - dome / 2} Q98 7 99 14 Z`}
      />
      <path
        d='M94 8 C101 8 104 13 104 24 V131'
        fill='none'
        stroke={color}
        strokeWidth={fallWidth}
        strokeLinecap='round'
        strokeDasharray='14 4'
        className='glass-spill-stream'
      />
      <path
        d={`M7 10 L${trickleX} ${trickleEnd}`}
        fill='none'
        stroke={color}
        strokeWidth='3.5'
        strokeLinecap='round'
      />
      <circle cx={trickleX} cy={trickleEnd + 1} r='3.4' className='glass-spill-bead' />
      {drops.map((drop) => (
        <circle
          key={drop.x}
          cx={drop.x}
          cy='16'
          r={2.6 + amount}
          className='glass-spill-drop'
          style={{ animationDelay: `${drop.delay}s` } satisfies CSSProperties}
        />
      ))}
      <ellipse
        cx='80'
        cy='131'
        rx={30 + amount * 16}
        ry={4 + amount * 2}
        className='glass-spill-puddle'
      />
    </g>
  );
}
