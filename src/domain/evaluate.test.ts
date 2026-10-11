import { describe, expect, it } from 'vitest';

import { at, coffee, record, settingsWith } from '@/test/fixtures';
import { evaluate } from './evaluate';
import { DEFAULT_SETTINGS } from './settings';
import type { CaffeineRecord } from './types';

function drinkResult(records: CaffeineRecord[], now: number, drinkId: string) {
  return evaluate(records, DEFAULT_SETTINGS, now).drinks.find((d) => d.drink.id === drinkId);
}

describe('就寝時の残量の計算', () => {
  it('15:00 に 98mg を飲んだとき、23:00 の就寝時の残量が 49mg であること', () => {
    const records = [coffee(at(10, 11, '15:00'))];

    const result = evaluate(records, DEFAULT_SETTINGS, at(10, 11, '16:00'));

    expect(result.withoutDrink).toEqual({ residualMg: 49, verdict: 'ok' });
  });

  it.each([
    ['9:00 と 13:00 にコーヒー', [coffee(at(10, 11, '9:00')), coffee(at(10, 11, '13:00'))], 70],
    ['9:00 と 15:00 にコーヒー', [coffee(at(10, 11, '9:00')), coffee(at(10, 11, '15:00'))], 78],
    [
      '9:00 と 13:00 にコーヒー、16:00 に緑茶 30mg',
      [
        coffee(at(10, 11, '9:00')),
        coffee(at(10, 11, '13:00')),
        record('green-tea', at(10, 11, '16:00'), 30),
      ],
      87,
    ],
    [
      '9:00 と 13:00 にコーヒー、16:00 に緑茶 500mL',
      [
        coffee(at(10, 11, '9:00')),
        coffee(at(10, 11, '13:00')),
        record('green-tea', at(10, 11, '16:00'), 65),
      ],
      106,
    ],
  ])('%s を飲んだとき、23:00 の就寝時の残量が %smg であること', (_, records, expected) => {
    const result = evaluate(records, DEFAULT_SETTINGS, at(10, 11, '16:30'));

    expect(result.withoutDrink.residualMg).toBe(expected);
  });

  it('前の 1 日にだけ記録があるとき、何も飲まなかった場合の就寝時の残量が 0mg であること', () => {
    const records = [coffee(at(10, 10, '9:00')), coffee(at(10, 10, '13:00'))];

    const result = evaluate(records, DEFAULT_SETTINGS, at(10, 11, '9:00'));

    expect(result.withoutDrink).toEqual({ residualMg: 0, verdict: 'ok' });
  });

  it('飲み物のボタンの残量が、何も飲まなかった場合の残量に今の 1 杯の残量を足した値であること', () => {
    const records = [coffee(at(10, 11, '9:00')), coffee(at(10, 11, '13:00'))];
    const now = at(10, 11, '16:00');

    const result = evaluate(records, DEFAULT_SETTINGS, now);

    expect(result.withoutDrink).toEqual({ residualMg: 70, verdict: 'ok' });
    expect(drinkResult(records, now, 'green-tea')).toMatchObject({
      caffeineMg: 65,
      residualMg: 106,
      verdict: 'out',
    });
  });

  it('記録した後に飲み物のカフェイン量を変えたとき、記録済みの分の残量は変わらず、ボタンの残量だけが新しい量で計算されること', () => {
    const records = [coffee(at(10, 11, '15:00'))];
    const settings = settingsWith({
      caffeineMg: { ...DEFAULT_SETTINGS.caffeineMg, 'seven-cafe-hot': 120 },
    });

    const result = evaluate(records, settings, at(10, 11, '15:00'));

    expect(result.withoutDrink.residualMg).toBe(49);
    expect(result.drinks.find((d) => d.drink.id === 'seven-cafe-hot')).toMatchObject({
      caffeineMg: 120,
      residualMg: 109,
    });
  });
});

describe('1 日の区切り', () => {
  it('4:59 の記録は前の 1 日、5:00 の記録は今の 1 日として扱うこと', () => {
    const before = record('green-tea', at(10, 11, '4:59'), 65);
    const after = record('hojicha', at(10, 11, '5:00'), 65);

    const result = evaluate([before, after], DEFAULT_SETTINGS, at(10, 11, '12:00'));

    expect(result.todayRecords).toEqual([after]);
    expect(result.todayIntakeMg).toBe(65);
  });

  it('23:30 と翌 0:30 の記録は同じ 1 日として集計すること', () => {
    const lateNight = record('green-tea', at(10, 11, '23:30'), 65);
    const afterMidnight = record('hojicha', at(10, 12, '0:30'), 65);

    const result = evaluate([lateNight, afterMidnight], DEFAULT_SETTINGS, at(10, 12, '1:00'));

    expect(result.todayRecords).toEqual([afterMidnight, lateNight]);
    expect(result.todayIntakeMg).toBe(130);
  });

  it('今の 1 日の記録は、飲んだ時刻の新しい順に並ぶこと', () => {
    const morning = coffee(at(10, 11, '9:00'));
    const afternoon = coffee(at(10, 11, '13:00'));
    const evening = record('green-tea', at(10, 11, '16:00'), 65);

    const result = evaluate([afternoon, evening, morning], DEFAULT_SETTINGS, at(10, 11, '17:00'));

    expect(result.todayRecords).toEqual([evening, afternoon, morning]);
  });
});

describe('就寝時刻の扱い', () => {
  it('就寝時刻が 0:30 のとき、10 月 11 日の 1 日の就寝時刻を 10 月 12 日の 0:30 として計算すること', () => {
    const settings = settingsWith({ bedtimeMinutes: 30 });

    const result = evaluate([coffee(at(10, 11, '15:00'))], settings, at(10, 11, '16:00'));

    expect(result.withoutDrink.residualMg).toBe(43);
  });

  it('今の時刻が就寝時刻より前のとき、就寝時刻で残量を計算すること', () => {
    const result = evaluate([coffee(at(10, 11, '15:00'))], DEFAULT_SETTINGS, at(10, 11, '22:00'));

    expect(result.withoutDrink.residualMg).toBe(49);
  });

  it('今の時刻が就寝時刻を過ぎているとき、今の時刻を就寝時刻として残量を計算すること', () => {
    const records = [coffee(at(10, 11, '17:00'))];
    const now = at(10, 12, '1:00');

    const result = evaluate(records, DEFAULT_SETTINGS, now);

    expect(result.withoutDrink.residualMg).toBe(49);
    expect(drinkResult(records, now, 'green-tea')).toMatchObject({ residualMg: 114 });
  });

  it('就寝時刻が 0:30 で 10 月 12 日 1:00 に画面を開いたとき、今の時刻を就寝時刻として計算すること', () => {
    const settings = settingsWith({ bedtimeMinutes: 30 });

    const result = evaluate([coffee(at(10, 11, '17:00'))], settings, at(10, 12, '1:00'));

    expect(result.withoutDrink.residualMg).toBe(49);
  });
});

describe('昨夜の残量', () => {
  it('前の 1 日に記録があるとき、前の 1 日の就寝時刻の残量と判定を返すこと', () => {
    const records = [
      coffee(at(10, 11, '9:00')),
      coffee(at(10, 11, '13:00')),
      record('green-tea', at(10, 11, '16:00'), 65),
    ];

    const result = evaluate(records, DEFAULT_SETTINGS, at(10, 12, '8:00'));

    expect(result.lastNight).toEqual({ residualMg: 106, verdict: 'out' });
  });

  it('前の 1 日に就寝時刻より後の記録があるとき、最後の記録の時刻を就寝時刻として計算すること', () => {
    const records = [coffee(at(10, 11, '15:00')), record('green-tea', at(10, 11, '23:30'), 65)];

    const result = evaluate(records, DEFAULT_SETTINGS, at(10, 12, '8:00'));

    expect(result.lastNight).toEqual({ residualMg: 112, verdict: 'out' });
  });

  it('前の 1 日に記録がないとき、昨夜の残量が記録なしであること', () => {
    const result = evaluate([coffee(at(10, 12, '9:00'))], DEFAULT_SETTINGS, at(10, 12, '10:00'));

    expect(result.lastNight).toBeNull();
  });
});

describe('1 日の摂取量', () => {
  it('今の 1 日の記録のカフェイン量を合計し、前の 1 日の記録を含めないこと', () => {
    const records = [
      coffee(at(10, 10, '20:00')),
      coffee(at(10, 11, '9:00')),
      record('green-tea', at(10, 11, '16:00'), 65),
    ];

    const result = evaluate(records, DEFAULT_SETTINGS, at(10, 11, '17:00'));

    expect(result.todayIntakeMg).toBe(163);
  });

  it.each([
    [400, false],
    [401, true],
  ])('1 日の摂取量が %smg のとき、上限を超えているかが %s であること', (intakeMg, expected) => {
    const records = [record('home-coffee', at(10, 11, '9:00'), intakeMg)];

    const result = evaluate(records, DEFAULT_SETTINGS, at(10, 11, '10:00'));

    expect(result.isOverDailyLimit).toBe(expected);
  });
});
