import { createFileRoute, Link } from '@tanstack/react-router';
import { Settings, Undo2 } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

import { useAppState } from '@/app-state';
import { DrinkSwatch, drinkColor } from '@/components/cup';
import { DrinkButton } from '@/components/drink-button';
import { Gauge, gaugeScaleMax } from '@/components/gauge';
import { Button } from '@/components/ui/button';
import { VerdictBadge, VerdictLabel } from '@/components/verdict-label';
import { bedtimeOf, dayOf } from '@/domain/day';
import { findDrink } from '@/domain/drinks';
import { evaluate } from '@/domain/evaluate';
import { formatBedtime } from '@/domain/settings';
import type { DrinkId } from '@/domain/types';
import { formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: '寝る前のカフェイン' }] }),
  component: MainPage,
});

const TOAST_DURATION_MS = 5000;

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

  // 画面を開いた時点の層まで伸びる動きを再生すると、記録の操作と関係なく毎回動いてしまうため、
  // 初回の描画にあった層は動かさない
  const layerKeys = evaluation.layers.map(
    (layer) =>
      `${layer.drinkId}-${evaluation.todayRecords.filter((r) => r.drinkId === layer.drinkId).length}`,
  );
  const initialLayerKeys = useRef<Set<string> | null>(null);
  if (initialLayerKeys.current === null) {
    initialLayerKeys.current = new Set(layerKeys);
  }
  const tonightSegments = evaluation.layers.map((layer, index) => {
    const key = layerKeys[index] ?? layer.drinkId;
    return {
      key,
      mg: layer.residualMg,
      color: drinkColor(layer.drinkId),
      enter: initialLayerKeys.current?.has(key) !== true,
    };
  });

  const scaleMax = gaugeScaleMax(
    thresholds,
    evaluation.drinks.map((d) => d.residualMg),
  );
  const isPastBedtime = now >= bedtimeOf(dayOf(now), settings.bedtimeMinutes);
  const tonightLabel = isPastBedtime
    ? '今すぐ寝ると体に残るカフェイン'
    : `今夜 ${formatBedtime(settings.bedtimeMinutes)} に体に残るカフェイン`;
  const layerDescription = evaluation.layers
    .map((l) => `${findDrink(l.drinkId).name} ${Math.round(l.residualMg)}mg`)
    .join('、');

  // 下に出るトースト（高さ約 90px）が取り消しボタンに重なると続けて取り消せないため、
  // 一番下までスクロールしたときにボタンがトーストより上に来るだけの余白を下に取る
  return (
    <div className='mx-auto flex min-h-dvh w-full max-w-lg flex-col px-3 pt-[max(1rem,env(safe-area-inset-top))] pb-[calc(7rem+env(safe-area-inset-bottom))]'>
      <header className='flex flex-col gap-3 px-4 pt-1 pb-5'>
        <h1 className='sr-only'>寝る前のカフェイン</h1>
        <div className='flex items-start justify-between gap-3'>
          <p className='flex min-w-0 flex-col gap-1'>
            <span className='text-muted-foreground text-sm'>{tonightLabel}</span>
            <span className='flex flex-wrap items-center gap-x-3 gap-y-1'>
              <span className='text-5xl leading-none font-bold tracking-tight tabular-nums'>
                {evaluation.withoutDrink.residualMg}
                <span className='ml-1 text-xl font-medium tracking-normal'>mg</span>
              </span>
              <VerdictBadge verdict={evaluation.withoutDrink.verdict} className='text-lg' />
            </span>
          </p>
          <Link
            to='/settings'
            className='text-muted-foreground hover:bg-muted active:bg-accent focus-visible:ring-ring/60 -mr-3 -mt-1 flex size-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl text-xs outline-none focus-visible:ring-3'
          >
            <Settings aria-hidden className='size-5' />
            設定
          </Link>
        </div>
        <div className='flex items-center gap-3'>
          <div
            role='img'
            aria-label={`今の 1 日に飲んだ分。${layerDescription === '' ? 'まだありません' : layerDescription}。境目は ${thresholds.lower}mg と ${thresholds.upper}mg`}
            className='grow'
          >
            <Gauge
              segments={tonightSegments}
              scaleMax={scaleMax}
              thresholds={thresholds}
              className='h-4'
            />
          </div>
          {/* 飲み物ボタンの横棒と左右の端をそろえ、境目の線が縦一列に並ぶようにする */}
          <span aria-hidden className='w-12 shrink-0' />
        </div>
        <div className='text-muted-foreground flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm'>
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

      <main className='flex flex-col gap-10'>
        <section aria-labelledby='drinks-heading'>
          <h2 id='drinks-heading' className='sr-only'>
            飲み物
          </h2>
          <ul className='flex flex-col gap-2'>
            {evaluation.drinks.map((assessment) => (
              <li key={assessment.drink.id}>
                <DrinkButton
                  assessment={assessment}
                  baseMg={evaluation.withoutDrink.residualMg}
                  scaleMax={scaleMax}
                  thresholds={thresholds}
                  onRecord={() => handleRecord(assessment.drink.id)}
                />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby='records-heading' className='flex flex-col gap-2 px-4'>
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
