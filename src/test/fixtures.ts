import { DEFAULT_SETTINGS } from '@/domain/settings';
import type { CaffeineRecord, DrinkId, Settings } from '@/domain/types';

export function at(month: number, day: number, time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return new Date(2026, month - 1, day, hour, minute).getTime();
}

let sequence = 0;

export function record(drinkId: DrinkId, drankAt: number, caffeineMg: number): CaffeineRecord {
  sequence += 1;
  return { id: `record-${sequence}`, drinkId, drankAt, caffeineMg };
}

export function coffee(drankAt: number): CaffeineRecord {
  return record('seven-cafe-hot', drankAt, 98);
}

export function memoryStorage(initial: Record<string, string> = {}): Storage {
  const items = new Map(Object.entries(initial));
  return {
    get length() {
      return items.size;
    },
    clear: () => {
      items.clear();
    },
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => {
      items.delete(key);
    },
    setItem: (key, value) => {
      items.set(key, value);
    },
  };
}

export function settingsWith(overrides: Partial<Settings>): Settings {
  return { ...DEFAULT_SETTINGS, ...overrides };
}
