import { describe, expect, it } from 'vitest';

import { DEFAULT_SETTINGS } from '@/domain/settings';
import { at, coffee, memoryStorage, record, settingsWith } from '@/test/fixtures';
import { loadState, RECORDS_KEY, SETTINGS_KEY, saveRecords, saveSettings } from './storage';

const now = at(10, 12, '12:00');

describe('読み込み', () => {
  it('何も保存されていないとき、初期設定と空の記録を読み込むこと', () => {
    const result = loadState(memoryStorage(), now);

    expect(result).toEqual({
      records: [],
      settings: {
        bedtimeMinutes: 23 * 60,
        thresholds: { lower: 75, upper: 80 },
        caffeineMg: {
          'home-coffee': 135,
          'seven-cafe-hot': 98,
          'seven-cafe-iced': 92,
          'green-tea': 65,
          hojicha: 65,
          'jasmine-tea': 50,
          'black-tea': 50,
        },
      },
    });
  });

  it.each([
    ['JSON として読めない', '{'],
    ['形が合わない', JSON.stringify({ foo: 1 })],
  ])('保存されたデータが%sとき、初期設定と空の記録を読み込むこと', (_, broken) => {
    const storage = memoryStorage({ [RECORDS_KEY]: broken, [SETTINGS_KEY]: broken });

    const result = loadState(storage, now);

    expect(result).toEqual({ records: [], settings: DEFAULT_SETTINGS });
  });
});

describe('保存', () => {
  it('保存した記録と設定を、読み込んだときに同じ値で受け取れること', () => {
    const storage = memoryStorage();
    const records = [coffee(at(10, 11, '9:00')), record('green-tea', at(10, 12, '11:00'), 65)];
    const settings = settingsWith({ bedtimeMinutes: 30, thresholds: { lower: 60, upper: 70 } });

    saveRecords(storage, records, now);
    saveSettings(storage, settings);

    expect(loadState(storage, now)).toEqual({ records, settings });
  });

  it('前の 1 日より古い記録は、保存するときに削除されること', () => {
    const storage = memoryStorage();
    const tooOld = coffee(at(10, 11, '4:59'));
    const lastDay = coffee(at(10, 11, '5:00'));
    const today = coffee(at(10, 12, '9:00'));

    saveRecords(storage, [tooOld, lastDay, today], now);

    expect(JSON.parse(storage.getItem(RECORDS_KEY) ?? '')).toEqual([lastDay, today]);
  });

  it('前の 1 日より古い記録は、読み込むときに削除されること', () => {
    const tooOld = coffee(at(10, 11, '4:59'));
    const lastDay = coffee(at(10, 11, '5:00'));
    const storage = memoryStorage({ [RECORDS_KEY]: JSON.stringify([tooOld, lastDay]) });

    const result = loadState(storage, now);

    expect(result.records).toEqual([lastDay]);
  });
});
