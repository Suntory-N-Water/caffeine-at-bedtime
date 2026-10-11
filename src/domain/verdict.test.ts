import { describe, expect, it } from 'vitest';

import { judge } from './verdict';

const initialThresholds = { lower: 75, upper: 80 };

describe('境目が初期値の 75mg と 80mg のとき', () => {
  it.each([
    [74, 'ok'],
    [75, 'gray'],
    [80, 'gray'],
    [81, 'out'],
  ] as const)('残量が %smg のとき、判定が %s であること', (residualMg, expected) => {
    expect(judge(residualMg, initialThresholds)).toBe(expected);
  });

  it.each([
    [74.4, 'ok'],
    [74.5, 'gray'],
    [80.4, 'gray'],
    [80.5, 'out'],
  ] as const)(
    '残量が %smg のとき、四捨五入した値で判定して %s であること',
    (residualMg, expected) => {
      expect(judge(residualMg, initialThresholds)).toBe(expected);
    },
  );
});

describe('利用者が境目を変えたとき', () => {
  it.each([
    [59, 'ok'],
    [60, 'gray'],
    [71, 'out'],
  ] as const)(
    '境目が 60mg と 70mg で残量が %smg のとき、判定が %s であること',
    (residualMg, expected) => {
      expect(judge(residualMg, { lower: 60, upper: 70 })).toBe(expected);
    },
  );

  it('2 つの境目が同じ 75mg のとき、75mg がグレーであること', () => {
    expect(judge(75, { lower: 75, upper: 75 })).toBe('gray');
  });
});
