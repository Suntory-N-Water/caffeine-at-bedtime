import { useId } from 'react';

import type { DrinkId } from '@/domain/types';
import { cn } from '@/lib/utils';
import { drinkColor } from './cup';

const OUTLINE = 'currentColor';
const VESSEL_WHITE = 'var(--vessel)';

type VesselProps = {
  drinkId: DrinkId;
  className?: string;
};

export function DrinkVessel({ drinkId, className }: VesselProps) {
  return (
    <svg viewBox='0 0 64 80' aria-hidden className={cn('shrink-0 overflow-visible', className)}>
      <VesselShape drinkId={drinkId} />
    </svg>
  );
}

function VesselShape({ drinkId }: { drinkId: DrinkId }) {
  switch (drinkId) {
    case 'home-coffee':
      return <Mug liquid={drinkColor(drinkId)} />;
    case 'seven-cafe-hot':
      return <PaperCup sleeve={drinkColor(drinkId)} />;
    case 'seven-cafe-iced':
      return <IcedCup liquid={drinkColor(drinkId)} />;
    default:
      return <Bottle liquid={drinkColor(drinkId)} />;
  }
}

function Steam() {
  return (
    <g fill='none' stroke={OUTLINE} strokeOpacity='0.35' strokeWidth='2' strokeLinecap='round'>
      <path className='vessel-steam' d='M27 18 q-3 -4 0 -8 t0 -8' />
      <path className='vessel-steam vessel-steam-late' d='M37 18 q-3 -4 0 -8 t0 -8' />
    </g>
  );
}

function Mug({ liquid }: { liquid: string }) {
  // 取っ手を含めた幅の中心は描画範囲の中心より 4 だけ右にある。4 動かすと胴が左に寄って見え、
  // 動かさないと右に寄って見えるため、間の 2 だけ左へ動かす
  return (
    <g strokeLinejoin='round' transform='translate(-2 0)'>
      <Steam />
      <path
        d='M48 34 h3 a9 9 0 0 1 0 18 h-3'
        fill='none'
        stroke={OUTLINE}
        strokeOpacity='0.55'
        strokeWidth='4'
      />
      <path
        d='M12 30 Q12 24 18 24 H44 Q50 24 50 30 V64 Q50 74 40 74 H22 Q12 74 12 64 Z'
        fill={VESSEL_WHITE}
        stroke={OUTLINE}
        strokeOpacity='0.55'
        strokeWidth='2.5'
      />
      <ellipse cx='31' cy='28' rx='16' ry='3.2' fill={liquid} />
    </g>
  );
}

function PaperCup({ sleeve }: { sleeve: string }) {
  return (
    <g strokeLinejoin='round'>
      <Steam />
      <path
        d='M16 27 H48 L44 75 H20 Z'
        fill={VESSEL_WHITE}
        stroke={OUTLINE}
        strokeOpacity='0.55'
        strokeWidth='2.5'
      />
      <path d='M17.6 42 H46.4 L45.1 58 H18.9 Z' fill={sleeve} />
      <rect
        x='12'
        y='21'
        width='40'
        height='7'
        rx='3'
        fill={VESSEL_WHITE}
        stroke={OUTLINE}
        strokeOpacity='0.55'
        strokeWidth='2.5'
      />
      <rect x='20' y='17' width='24' height='5' rx='2' fill={OUTLINE} fillOpacity='0.35' />
    </g>
  );
}

function IcedCup({ liquid }: { liquid: string }) {
  const clipId = useId();
  const cup = 'M14 22 H50 L46 75 H18 Z';
  return (
    <g strokeLinejoin='round'>
      <rect
        x='35'
        y='4'
        width='4'
        height='40'
        rx='2'
        transform='rotate(12 37 24)'
        fill={OUTLINE}
        fillOpacity='0.45'
      />
      <clipPath id={clipId}>
        <path d={cup} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect x='0' y='22' width='64' height='60' fill={VESSEL_WHITE} fillOpacity='0.6' />
        <rect x='0' y='34' width='64' height='50' fill={liquid} />
        <rect
          x='20'
          y='30'
          width='11'
          height='11'
          rx='2.5'
          transform='rotate(-14 25 35)'
          fill='#ffffff'
          fillOpacity='0.75'
        />
        <rect
          x='32'
          y='38'
          width='10'
          height='10'
          rx='2.5'
          transform='rotate(18 37 43)'
          fill='#ffffff'
          fillOpacity='0.6'
        />
      </g>
      <path d={cup} fill='none' stroke={OUTLINE} strokeOpacity='0.55' strokeWidth='2.5' />
      <rect x='12' y='19' width='40' height='4' rx='2' fill={OUTLINE} fillOpacity='0.45' />
    </g>
  );
}

function Bottle({ liquid }: { liquid: string }) {
  const clipId = useId();
  const body = 'M26 14 H38 V19 Q46 22 46 30 V70 Q46 76 40 76 H24 Q18 76 18 70 V30 Q18 22 26 19 Z';
  return (
    <g strokeLinejoin='round'>
      <clipPath id={clipId}>
        <path d={body} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect x='0' y='14' width='64' height='70' fill={VESSEL_WHITE} fillOpacity='0.6' />
        <rect x='0' y='26' width='64' height='60' fill={liquid} />
        <rect x='0' y='40' width='64' height='17' fill={VESSEL_WHITE} />
        <rect x='0' y='46' width='64' height='5' fill={liquid} fillOpacity='0.55' />
      </g>
      <path d={body} fill='none' stroke={OUTLINE} strokeOpacity='0.55' strokeWidth='2.5' />
      <rect x='25' y='6' width='14' height='9' rx='2' fill={liquid} />
      <rect
        x='25'
        y='6'
        width='14'
        height='9'
        rx='2'
        fill='none'
        stroke={OUTLINE}
        strokeOpacity='0.55'
        strokeWidth='2'
      />
    </g>
  );
}
