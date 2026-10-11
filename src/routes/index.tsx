import { createFileRoute, Link } from '@tanstack/react-router';
import { Settings, Undo2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAppState } from '@/app-state';
import { DrinkSwatch, TonightCup } from '@/components/cup';
import { DrinkButton } from '@/components/drink-button';
import { Button } from '@/components/ui/button';
import { VerdictLabel } from '@/components/verdict-label';
import { findDrink } from '@/domain/drinks';
import { evaluate } from '@/domain/evaluate';
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

  const cupLayers = evaluation.layers.map((layer) => ({
    ...layer,
    key: `${layer.drinkId}-${evaluation.todayRecords.filter((r) => r.drinkId === layer.drinkId).length}`,
  }));

  // 下に出るトースト（高さ約 90px）が取り消しボタンに重なると続けて取り消せないため、
  // 一番下までスクロールしたときにボタンがトーストより上に来るだけの余白を下に取る
  return (
    <div className='mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[calc(7rem+env(safe-area-inset-bottom))]'>
      <header className='flex flex-col gap-2'>
        <h1 className='sr-only'>寝る前のカフェイン</h1>
        <div className='flex items-center gap-3'>
          <TonightCup
            layers={cupLayers}
            thresholds={settings.thresholds}
            className='h-16 w-[3.25rem]'
          />
          <p className='flex min-w-0 grow flex-col'>
            <span className='text-muted-foreground text-sm'>何も飲まなければ就寝時</span>
            <span className='flex items-baseline gap-2'>
              <span className='text-3xl leading-tight font-bold tabular-nums'>
                {evaluation.withoutDrink.residualMg}
                <span className='ml-0.5 text-base'>mg</span>
              </span>
              <VerdictLabel verdict={evaluation.withoutDrink.verdict} className='text-lg' />
            </span>
          </p>
          <Link
            to='/settings'
            className='hover:bg-muted active:bg-accent focus-visible:ring-ring/60 flex size-12 shrink-0 flex-col items-center justify-center gap-0.5 self-start rounded-xl text-xs outline-none focus-visible:ring-3'
          >
            <Settings aria-hidden className='size-5' />
            設定
          </Link>
        </div>
        <div className='text-muted-foreground flex justify-between gap-3 text-sm'>
          <p>
            昨夜{' '}
            {evaluation.lastNight === null ? (
              '記録なし'
            ) : (
              <>
                <span className='tabular-nums'>{evaluation.lastNight.residualMg}mg</span>{' '}
                <VerdictLabel verdict={evaluation.lastNight.verdict} />
              </>
            )}
          </p>
          <p>
            今日の摂取量{' '}
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

      <main className='mt-4 flex flex-col gap-8'>
        <section aria-labelledby='drinks-heading'>
          <h2 id='drinks-heading' className='sr-only'>
            飲み物
          </h2>
          <ul className='flex flex-col gap-2'>
            {evaluation.drinks.map((assessment) => (
              <li key={assessment.drink.id}>
                <DrinkButton
                  assessment={assessment}
                  onRecord={() => handleRecord(assessment.drink.id)}
                />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby='records-heading' className='flex flex-col gap-3'>
          <h2 id='records-heading' className='text-base font-bold'>
            今日の記録
          </h2>
          {evaluation.todayRecords.length === 0 ? (
            <p className='text-muted-foreground text-base'>まだ記録がありません</p>
          ) : (
            <ul className='divide-border divide-y'>
              {evaluation.todayRecords.map((r) => (
                <li key={r.id} className='flex items-center gap-3 py-2 text-base'>
                  <span className='w-11 shrink-0 tabular-nums'>{formatTime(r.drankAt)}</span>
                  <DrinkSwatch drinkId={r.drinkId} className='size-5' />
                  <span className='min-w-0 grow'>{findDrink(r.drinkId).name}</span>
                  <span className='shrink-0 tabular-nums'>{r.caffeineMg}mg</span>
                </li>
              ))}
            </ul>
          )}
          <Button
            type='button'
            variant='destructive'
            className='h-11 self-start rounded-full px-4 text-base'
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
