import { dayOf, previousDay } from '@/domain/day';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { type CaffeineRecord, DRINK_IDS, type DrinkId, type Settings } from '@/domain/types';

export const RECORDS_KEY = 'caffeine-at-bedtime:records';
export const SETTINGS_KEY = 'caffeine-at-bedtime:settings';

type StoredState = {
  records: CaffeineRecord[];
  settings: Settings;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isDrinkId(value: unknown): value is DrinkId {
  return DRINK_IDS.some((id) => id === value);
}

function isRecord(value: unknown): value is CaffeineRecord {
  return (
    isObject(value) &&
    typeof value['id'] === 'string' &&
    isDrinkId(value['drinkId']) &&
    isFiniteNumber(value['drankAt']) &&
    isFiniteNumber(value['caffeineMg'])
  );
}

// 飲み物を追加する前に保存した設定には、追加した飲み物のカフェイン量がない。
// 設定全体を初期値に戻すと就寝時刻と境目まで消えるため、足りない飲み物だけ初期値で補う
function parseSettings(value: unknown): Settings {
  if (!isObject(value)) {
    return DEFAULT_SETTINGS;
  }
  const { bedtimeMinutes, thresholds, caffeineMg } = value;
  if (
    !isFiniteNumber(bedtimeMinutes) ||
    !isObject(thresholds) ||
    !isFiniteNumber(thresholds['lower']) ||
    !isFiniteNumber(thresholds['upper']) ||
    !isObject(caffeineMg)
  ) {
    return DEFAULT_SETTINGS;
  }
  return {
    bedtimeMinutes,
    thresholds: { lower: thresholds['lower'], upper: thresholds['upper'] },
    caffeineMg: Object.fromEntries(
      DRINK_IDS.map((id) => {
        const mg = caffeineMg[id];
        return [id, isFiniteNumber(mg) ? mg : DEFAULT_SETTINGS.caffeineMg[id]];
      }),
    ) as Record<DrinkId, number>,
  };
}

function readJson(storage: Storage, key: string): unknown {
  const raw = storage.getItem(key);
  if (raw === null) {
    return null;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

// 昨夜の残量の表示に前の 1 日の記録が必要なため、それより古い記録だけを削除する
function keepRecent(records: CaffeineRecord[], now: number): CaffeineRecord[] {
  const oldestKept = previousDay(dayOf(now)).start;
  return records.filter((r) => r.drankAt >= oldestKept);
}

export function loadState(storage: Storage, now: number): StoredState {
  const rawRecords = readJson(storage, RECORDS_KEY);
  const rawSettings = readJson(storage, SETTINGS_KEY);
  const records = Array.isArray(rawRecords) ? rawRecords.filter(isRecord) : [];
  return {
    records: keepRecent(records, now),
    settings: parseSettings(rawSettings),
  };
}

export function saveRecords(storage: Storage, records: CaffeineRecord[], now: number): void {
  storage.setItem(RECORDS_KEY, JSON.stringify(keepRecent(records, now)));
}

export function saveSettings(storage: Storage, settings: Settings): void {
  storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
