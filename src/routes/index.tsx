import { createFileRoute, Link } from '@tanstack/react-router';
import { Settings, Undo2 } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

import { useAppState } from '@/app-state';
import { DrinkSwatch, drinkColor } from '@/components/cup';
import { DrinkButton } from '@/components/drink-button';
import { NightGlass } from '@/components/night-glass';
import { Button } from '@/components/ui/button';
import { VerdictBadge, VerdictLabel } from '@/components/verdict-label';
import { bedtimeOf, dayOf } from '@/domain/day';
import { findDrink } from '@/domain/drinks';
import { type Assessment, type DrinkAssessment, evaluate } from '@/domain/evaluate';
import { formatBedtime } from '@/domain/settings';
import type { DrinkId, Thresholds } from '@/domain/types';
import { formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: '寝る前のカフェイン' }] }),
  component: MainPage,
});

const TOAST_DURATION_MS = 5000;
const COFFEE_IDS: ReadonlySet<DrinkId> = new Set([
  'home-coffee',
  'seven-cafe-hot',
  'seven-cafe-iced',
]);

function marginMessage({ residualMg, verdict }: Assessment, thresholds: Thresholds): string {
  const margin = thresholds.upper - residualMg;
  if (verdict === 'out') {
    return `アウトの線を ${-margin}mg 越えています`;
  }
  return `アウトの線まで あと ${margin}mg`;
}

function MainPage() {
  const { now, records, settings, record, remove, undo, restore } = useAppState();
  const evaluation = evaluate(records, settings, now);
  const { thresholds } = settings;

  const handleRecord = (drinkId: DrinkId) => {
    const added = record(drinkId);
    toast(`${findDrink(drinkId).name} を ${formatTime(added.drankAt)} に記録しました`, {
      duration: TOAST_DURATION_MS,
      action: { label: '取り消す', onClick: () => remove(added.id) },
    });
  };

  const handleUndo = () => {
    const removed = undo();
    if (removed === null) {
      return;
    }
    toast(`${findDrink(removed.drinkId).name}（${formatTime(removed.drankAt)}）を取り消しました`, {
      duration: TOAST_DURATION_MS,
      action: { label: '元に戻す', onClick: () => restore(removed) },
    });
  };

  // 画面を開いた時点の層まで注ぐ動きを再生すると、記録の操作と関係なく毎回動いてしまうため、
  // 初回の描画にあった層は動かさない
  const layerKeys = evaluation.layers.map(
    (layer) =>
      `${layer.drinkId}-${evaluation.todayRecords.filter((r) => r.drinkId === layer.drinkId).length}`,
  );
  const initialLayerKeys = useRef<Set<string> | null>(null);
  if (initialLayerKeys.current === null) {
    initialLayerKeys.current = new Set(layerKeys);
  }
  const glassLayers = evaluation.layers.map((layer, index) => {
    const key = layerKeys[index] ?? layer.drinkId;
    return {
      key,
      mg: layer.residualMg,
      color: drinkColor(layer.drinkId),
      enter: initialLayerKeys.current?.has(key) !== true,
    };
  });
  const glassLabel = `今日飲んだ分のグラス。${
    evaluation.layers.length === 0
      ? 'まだ空です'
      : evaluation.layers
          .map((l) => `${findDrink(l.drinkId).name} ${Math.round(l.residualMg)}mg`)
          .join('、')
  }。線は ${thresholds.lower}mg と ${thresholds.upper}mg`;

  const isPastBedtime = now >= bedtimeOf(dayOf(now), settings.bedtimeMinutes);
  const bedWhen = isPastBedtime
    ? '今すぐ寝たら'
    : `${formatBedtime(settings.bedtimeMinutes)} に寝たとき`;

  const coffees = evaluation.drinks.filter((d) => COFFEE_IDS.has(d.drink.id));
  const teas = evaluation.drinks.filter((d) => !COFFEE_IDS.has(d.drink.id));

  // 下に出るトースト（高さ約 90px）が取り消しボタンに重なると続けて取り消せないため、
  // 一番下までスクロールしたときにボタンがトーストより上に来るだけの余白を下に取る
  return (
    <div className='mx-auto flex min-h-dvh w-full max-w-lg flex-col px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[calc(7rem+env(safe-area-inset-bottom))]'>
      <div className='flex items-center justify-between px-2 pb-2'>
        <h1 className='text-base font-bold tracking-wide'>寝る前のカフェイン</h1>
        <Link
          to='/settings'
          className='text-muted-foreground hover:bg-muted active:bg-accent focus-visible:ring-ring/60 -mr-1 flex size-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl text-xs outline-none focus-visible:ring-3'
        >
          <Settings aria-hidden className='size-5' />
          設定
        </Link>
      </div>

      {/* 寝る前の画面であることを、背景の色に関係なく夜の窓として見せるため、この枠だけ常にダークモードの色にする */}
      <header className='dark night-window text-foreground relative overflow-hidden rounded-[2rem] px-5 pt-5 pb-4'>
        <div className='relative flex items-end gap-3'>
          <div className='flex min-w-0 grow flex-col gap-2 pb-2'>
            <p className='text-muted-foreground flex items-start gap-1.5 text-sm leading-snug'>
              <Moon />
              <span>
                {/* 375px の幅では「体に／残る」のように語の途中で折り返されるため、句の切れ目で改行する */}
                <span className='block'>{bedWhen}、</span>
                <span className='block'>体に残るカフェイン</span>
              </span>
            </p>
            <p className='text-6xl leading-none font-bold tracking-tight tabular-nums'>
              {evaluation.withoutDrink.residualMg}
              <span className='ml-1 text-xl font-medium tracking-normal'>mg</span>
            </p>
            <VerdictBadge
              verdict={evaluation.withoutDrink.verdict}
              className='self-start text-base'
            />
            <p className='text-sm leading-snug font-medium'>
              {marginMessage(evaluation.withoutDrink, thresholds)}
            </p>
          </div>
          <NightGlass
            layers={glassLayers}
            thresholds={thresholds}
            label={glassLabel}
            className='h-40 w-[7.5rem]'
          />
        </div>
        <div className='text-muted-foreground relative mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-sm'>
          <p>
            昨夜{' '}
            {evaluation.lastNight === null ? (
              '記録なし'
            ) : (
              <>
                <span className='tabular-nums'>{evaluation.lastNight.residualMg}mg</span>{' '}
                <VerdictLabel verdict={evaluation.lastNight.verdict} className='font-medium' />
              </>
            )}
          </p>
          <p>
            今日飲んだ量{' '}
            <span
              className={cn(
                'tabular-nums',
                evaluation.isOverDailyLimit && 'text-verdict-out-text font-bold',
              )}
            >
              {evaluation.todayIntakeMg}mg
            </span>
            {evaluation.isOverDailyLimit && <span className='sr-only'>（400mg 超過）</span>}
          </p>
        </div>
      </header>

      <main className='flex flex-col gap-8 pt-6'>
        <section aria-labelledby='drinks-heading' className='flex flex-col gap-3'>
          <h2 id='drinks-heading' className='px-2 text-lg font-bold'>
            次の 1 杯、どれにする？
          </h2>
          <DrinkShelf drinks={coffees} columns='grid-cols-3' onRecord={handleRecord} />
          <DrinkShelf drinks={teas} columns='grid-cols-2' onRecord={handleRecord} />
        </section>

        <section aria-labelledby='records-heading' className='flex flex-col gap-2 px-2'>
          <h2 id='records-heading' className='text-muted-foreground text-sm font-bold'>
            今日の記録
          </h2>
          {evaluation.todayRecords.length === 0 ? (
            <p className='text-muted-foreground text-base'>まだ記録がありません</p>
          ) : (
            <ul className='flex flex-col'>
              {evaluation.todayRecords.map((r) => (
                <li key={r.id} className='flex items-center gap-3 py-1.5 text-base'>
                  <span className='text-muted-foreground w-11 shrink-0 tabular-nums'>
                    {formatTime(r.drankAt)}
                  </span>
                  <DrinkSwatch drinkId={r.drinkId} className='size-4' />
                  <span className='min-w-0 grow'>{findDrink(r.drinkId).name}</span>
                  <span className='text-muted-foreground shrink-0 tabular-nums'>
                    {r.caffeineMg}mg
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Button
            type='button'
            variant='ghost'
            className='text-verdict-out-text hover:text-verdict-out-text -ml-3 h-11 self-start px-3 text-base'
            disabled={evaluation.todayRecords.length === 0}
            onClick={handleUndo}
          >
            <Undo2 aria-hidden className='size-5' />
            直前の記録を取り消す
          </Button>
        </section>
      </main>
    </div>
  );
}

type DrinkShelfProps = {
  drinks: DrinkAssessment[];
  columns: string;
  onRecord: (drinkId: DrinkId) => void;
};

function DrinkShelf({ drinks, columns, onRecord }: DrinkShelfProps) {
  return (
    <ul className={cn('grid gap-2.5', columns)}>
      {drinks.map((assessment) => (
        <li key={assessment.drink.id}>
          <DrinkButton assessment={assessment} onRecord={() => onRecord(assessment.drink.id)} />
        </li>
      ))}
    </ul>
  );
}

function Moon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden className='mt-px size-4 shrink-0 text-[#f5e9b8]'>
      <path d='M15.5 3.5a8.5 8.5 0 1 0 5 15.4A9 9 0 0 1 15.5 3.5Z' fill='currentColor' />
    </svg>
  );
}
