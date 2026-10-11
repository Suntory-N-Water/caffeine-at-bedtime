import type { Thresholds, Verdict } from './types';

// 画面には四捨五入した mg を出すため、判定も同じ値で行い、表示と判定が食い違わないようにする
export function judge(residualMg: number, thresholds: Thresholds): Verdict {
  const rounded = Math.round(residualMg);
  if (rounded < thresholds.lower) {
    return 'ok';
  }
  if (rounded <= thresholds.upper) {
    return 'gray';
  }
  return 'out';
}
