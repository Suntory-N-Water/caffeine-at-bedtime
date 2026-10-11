import { createContext, type ReactNode, use, useEffect, useMemo, useRef, useState } from 'react';

import { addRecord, removeRecord, restoreRecord, undoLatest } from '@/domain/records';
import type { CaffeineRecord, DrinkId, Settings } from '@/domain/types';
import { loadState, saveRecords, saveSettings } from '@/storage';

type AppState = {
  now: number;
  records: CaffeineRecord[];
  settings: Settings;
  record: (drinkId: DrinkId) => CaffeineRecord;
  remove: (id: string) => void;
  undo: () => CaffeineRecord | null;
  restore: (record: CaffeineRecord) => void;
  updateSettings: (settings: Settings) => void;
};

const AppStateContext = createContext<AppState | null>(null);

function msUntilNextMinute(): number {
  return 60_000 - (Date.now() % 60_000);
}

function useNow(): number {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(Date.now());
      timer = setTimeout(tick, msUntilNextMinute());
    };
    timer = setTimeout(tick, msUntilNextMinute());

    // iPhone はバックグラウンドのタブのタイマーを止めるため、画面に戻った時点で時刻を取り直す
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        setNow(Date.now());
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return now;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const now = useNow();
  const [initial] = useState(() => loadState(localStorage, Date.now()));
  const [records, setRecords] = useState(initial.records);
  const [settings, setSettings] = useState(initial.settings);
  // トーストのボタンは押されるまで数秒残るため、作成時点の records を閉じ込めると
  // その間に増えた記録を上書きで消してしまう。常に最新の配列を ref から読む
  const recordsRef = useRef(records);

  const actions = useMemo(() => {
    const commitRecords = (next: CaffeineRecord[]) => {
      recordsRef.current = next;
      setRecords(next);
      saveRecords(localStorage, next, Date.now());
    };
    return {
      remove: (id: string) => {
        commitRecords(removeRecord(recordsRef.current, id));
      },
      undo: () => {
        const result = undoLatest(recordsRef.current, Date.now());
        commitRecords(result.records);
        return result.removed;
      },
      restore: (record: CaffeineRecord) => {
        commitRecords(restoreRecord(recordsRef.current, record));
      },
      commitRecords,
    };
  }, []);

  const value = useMemo<AppState>(
    () => ({
      now,
      records,
      settings,
      record: (drinkId) => {
        const result = addRecord(recordsRef.current, { drinkId, settings, now: Date.now() });
        actions.commitRecords(result.records);
        return result.record;
      },
      remove: actions.remove,
      undo: actions.undo,
      restore: actions.restore,
      updateSettings: (next) => {
        setSettings(next);
        saveSettings(localStorage, next);
      },
    }),
    [now, records, settings, actions],
  );

  return <AppStateContext value={value}>{children}</AppStateContext>;
}

export function useAppState(): AppState {
  const state = use(AppStateContext);
  if (state === null) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }
  return state;
}
