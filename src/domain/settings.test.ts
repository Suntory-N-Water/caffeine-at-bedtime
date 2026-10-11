import { describe, expect, it } from 'vitest';

import { DEFAULT_SETTINGS, type SettingsForm, toSettingsForm, validateSettings } from './settings';

function formWith(overrides: Partial<SettingsForm>): SettingsForm {
  return { ...toSettingsForm(DEFAULT_SETTINGS), ...overrides };
}

describe('判定の境目の検証', () => {
  it('2 つ目の境目が 1 つ目より小さいとき、境目のエラーを返すこと', () => {
    const result = validateSettings(formWith({ lower: '80', upper: '75' }));

    expect(result.ok).toBe(false);
    expect(result.ok ? undefined : result.errors.thresholds).toBeDefined();
  });

  it('2 つ目の境目が 1 つ目と同じとき、保存できること', () => {
    const result = validateSettings(formWith({ lower: '75', upper: '75' }));

    expect(result).toEqual({
      ok: true,
      settings: { ...DEFAULT_SETTINGS, thresholds: { lower: 75, upper: 75 } },
    });
  });
});

describe('数値の入力の検証', () => {
  it.each([
    ['空欄', ''],
    ['0 未満', '-1'],
    ['数字以外', 'abc'],
  ])('境目が%sのとき、その項目のエラーを返すこと', (_, value) => {
    const result = validateSettings(formWith({ lower: value }));

    expect(result.ok ? undefined : result.errors.lower).toBeDefined();
  });

  it.each([
    ['空欄', ''],
    ['0 未満', '-1'],
    ['数字以外', 'abc'],
  ])('カフェイン量が%sのとき、その飲み物のエラーを返すこと', (_, value) => {
    const form = toSettingsForm(DEFAULT_SETTINGS);

    const result = validateSettings({
      ...form,
      caffeineMg: { ...form.caffeineMg, 'green-tea': value },
    });

    expect(result.ok ? undefined : result.errors.caffeineMg['green-tea']).toBeDefined();
  });
});
