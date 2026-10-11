import { describe, expect, it } from 'vitest';

import { at, coffee, record, settingsWith } from '@/test/fixtures';
import { addRecord, removeRecord, restoreRecord, undoLatest } from './records';
import { DEFAULT_SETTINGS } from './settings';

describe('記録', () => {
  it('飲み物を記録したとき、今の時刻、飲み物、設定にあるその飲み物のカフェイン量を持つ記録が追加されること', () => {
    const existing = coffee(at(10, 11, '9:00'));
    const settings = settingsWith({
      caffeineMg: { ...DEFAULT_SETTINGS.caffeineMg, 'green-tea': 70 },
    });
    const now = at(10, 11, '16:02');

    const result = addRecord([existing], { drinkId: 'green-tea', settings, now });

    expect(result.record).toEqual({
      id: expect.any(String),
      drinkId: 'green-tea',
      drankAt: now,
      caffeineMg: 70,
    });
    expect(result.records).toEqual([existing, result.record]);
  });

  it('記録のトーストの取り消すで、その記録だけが削除されること', () => {
    const morning = coffee(at(10, 11, '9:00'));
    const afternoon = coffee(at(10, 11, '13:00'));

    const result = removeRecord([morning, afternoon], morning.id);

    expect(result).toEqual([afternoon]);
  });
});

describe('取り消しと元に戻す', () => {
  it('取り消しを続けて行ったとき、今の 1 日の新しい記録から 1 つずつ削除されること', () => {
    const morning = coffee(at(10, 11, '9:00'));
    const afternoon = coffee(at(10, 11, '13:00'));
    const evening = record('green-tea', at(10, 11, '16:00'), 65);
    const now = at(10, 11, '17:00');

    const first = undoLatest([morning, evening, afternoon], now);
    const second = undoLatest(first.records, now);

    expect(first.removed).toEqual(evening);
    expect(second.removed).toEqual(afternoon);
    expect(second.records).toEqual([morning]);
  });

  it('今の 1 日に記録がなく前の 1 日にだけ記録があるとき、取り消しで何も削除されないこと', () => {
    const yesterday = coffee(at(10, 10, '13:00'));

    const result = undoLatest([yesterday], at(10, 11, '9:00'));

    expect(result).toEqual({ records: [yesterday], removed: null });
  });

  it('取り消した記録を元に戻したとき、取り消す前と同じ記録の配列になること', () => {
    const records = [
      coffee(at(10, 11, '9:00')),
      coffee(at(10, 11, '13:00')),
      record('green-tea', at(10, 11, '16:00'), 65),
    ];
    const undone = undoLatest(records, at(10, 11, '17:00'));
    if (undone.removed === null) {
      throw new Error('取り消す記録がない');
    }

    const result = restoreRecord(undone.records, undone.removed);

    expect(result).toEqual(records);
  });
});
