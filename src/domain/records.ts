import { dayOf, isInDay } from './day';
import type { CaffeineRecord, DrinkId, Settings } from './types';

type AddRecordInput = {
  drinkId: DrinkId;
  settings: Settings;
  now: number;
};

function sortByDrankAt(records: CaffeineRecord[]): CaffeineRecord[] {
  return [...records].sort((a, b) => a.drankAt - b.drankAt);
}

export function addRecord(
  records: CaffeineRecord[],
  { drinkId, settings, now }: AddRecordInput,
): { records: CaffeineRecord[]; record: CaffeineRecord } {
  const record: CaffeineRecord = {
    id: crypto.randomUUID(),
    drinkId,
    drankAt: now,
    caffeineMg: settings.caffeineMg[drinkId],
  };
  return { records: sortByDrankAt([...records, record]), record };
}

export function removeRecord(records: CaffeineRecord[], id: string): CaffeineRecord[] {
  return records.filter((r) => r.id !== id);
}

export function undoLatest(
  records: CaffeineRecord[],
  now: number,
): { records: CaffeineRecord[]; removed: CaffeineRecord | null } {
  const today = dayOf(now);
  const latest = sortByDrankAt(records.filter((r) => isInDay(r.drankAt, today))).at(-1);
  if (latest === undefined) {
    return { records, removed: null };
  }
  return { records: removeRecord(records, latest.id), removed: latest };
}

export function restoreRecord(records: CaffeineRecord[], record: CaffeineRecord): CaffeineRecord[] {
  return sortByDrankAt([...removeRecord(records, record.id), record]);
}
