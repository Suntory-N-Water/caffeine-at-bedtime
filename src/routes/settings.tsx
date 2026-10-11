import { createFileRoute, Link } from '@tanstack/react-router';
import { BookOpen, ChevronLeft, Hourglass, UserRound } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { toast } from 'sonner';

import { useAppState } from '@/app-state';
import { DrinkSwatch } from '@/components/cup';
import { Gauge, gaugeScaleMax } from '@/components/gauge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VerdictLabel } from '@/components/verdict-label';
import { DRINKS } from '@/domain/drinks';
import { evaluate } from '@/domain/evaluate';
import {
  DEFAULT_SETTINGS,
  type SettingsErrors,
  type SettingsForm,
  toSettingsForm,
  validateSettings,
} from '@/domain/settings';
import type { DrinkId, Source, Thresholds } from '@/domain/types';

export const Route = createFileRoute('/settings')({
  head: () => ({ meta: [{ title: '設定 | 寝る前のカフェイン' }] }),
  component: SettingsPage,
});

const DEFAULT_FORM = toSettingsForm(DEFAULT_SETTINGS);
const NO_ERRORS: SettingsErrors = { caffeineMg: {} };

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (message === undefined) {
    return null;
  }
  return (
    <p id={id} className='text-destructive text-sm'>
      {message}
    </p>
  );
}

// setErrors の反映前に呼ぶため、DOM の aria-invalid ではなく検証結果から画面の上にある欄を選ぶ
function firstInvalidFieldId(errors: SettingsErrors): string | null {
  if (errors.bedtime !== undefined) {
    return 'bedtime';
  }
  if (errors.lower !== undefined || errors.thresholds !== undefined) {
    return 'lower';
  }
  if (errors.upper !== undefined) {
    return 'upper';
  }
  const drink = DRINKS.find((d) => errors.caffeineMg[d.id] !== undefined);
  return drink === undefined ? null : `caffeine-${drink.id}`;
}

function describedBy(...ids: (string | false)[]): string | undefined {
  const joined = ids.filter((id) => id !== false).join(' ');
  return joined === '' ? undefined : joined;
}

// 入力途中の値でも横棒の境目を動かすため、数字として読めない間は保存済みの値を使う
function previewThresholds(form: SettingsForm, saved: Thresholds): Thresholds {
  const lower = Number(form.lower);
  const upper = Number(form.upper);
  const valid =
    form.lower.trim() !== '' &&
    form.upper.trim() !== '' &&
    Number.isInteger(lower) &&
    Number.isInteger(upper) &&
    lower >= 0 &&
    upper >= lower;
  return valid ? { lower, upper } : saved;
}

const HALF_LIFE_SOURCE: Source = {
  label: 'EFSA の解説資料',
  url: 'https://www.efsa.europa.eu/sites/default/files/corporate_publications/files/efsaexplainscaffeine150527.pdf',
};

function SourceLink({ source }: { source: Source }) {
  return (
    <a
      href={source.url}
      target='_blank'
      rel='noreferrer'
      className='hover:text-foreground focus-visible:ring-ring/60 rounded-sm underline underline-offset-2 outline-none focus-visible:ring-3'
    >
      {source.label}
      <span className='sr-only'>（新しいタブで開きます）</span>
    </a>
  );
}

type SectionProps = {
  title: string;
  onReset: () => void;
  children: ReactNode;
};

function Section({ title, onReset, children }: SectionProps) {
  return (
    <fieldset className='flex min-w-0 flex-col gap-4 py-6'>
      <div className='flex items-center justify-between gap-2'>
        <legend className='float-left min-w-0 text-lg font-bold break-keep'>{title}</legend>
        <Button
          type='button'
          variant='ghost'
          className='text-muted-foreground -mr-3 h-11 px-3 text-sm font-normal'
          onClick={onReset}
        >
          初期値に戻す
        </Button>
      </div>
      {children}
    </fieldset>
  );
}

function SettingsPage() {
  const { now, records, settings, updateSettings } = useAppState();
  const [form, setForm] = useState<SettingsForm>(() => toSettingsForm(settings));
  const [errors, setErrors] = useState<SettingsErrors>(NO_ERRORS);
  const { lastNight } = evaluate(records, settings, now);

  const update = (patch: Partial<SettingsForm>) => setForm((prev) => ({ ...prev, ...patch }));
  const updateCaffeine = (id: DrinkId, value: string) =>
    setForm((prev) => ({ ...prev, caffeineMg: { ...prev.caffeineMg, [id]: value } }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateSettings(form);
    if (!result.ok) {
      setErrors(result.errors);
      const firstId = firstInvalidFieldId(result.errors);
      if (firstId !== null) {
        document.getElementById(firstId)?.focus();
      }
      return;
    }
    setErrors(NO_ERRORS);
    updateSettings(result.settings);
    toast('設定を保存しました', { duration: 5000 });
  };

  const thresholdError = errors.thresholds;
  const preview = previewThresholds(form, settings.thresholds);
  const lastNightMg = lastNight?.residualMg ?? 0;

  return (
    <div className='mx-auto w-full max-w-lg px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]'>
      {/* ホーム画面に追加して開くと、ブラウザの戻るボタンが表示されないため、メイン画面へのリンクを置く */}
      <Link
        to='/'
        className='text-muted-foreground hover:bg-muted active:bg-accent focus-visible:ring-ring/60 -ml-3 flex h-11 w-fit items-center gap-1 rounded-xl pr-3 pl-2 text-base outline-none focus-visible:ring-3'
      >
        <ChevronLeft aria-hidden className='size-5' />
        戻る
      </Link>
      <h1 className='mt-1 text-2xl font-bold'>設定</h1>

      <form noValidate onSubmit={handleSubmit} className='divide-border flex flex-col divide-y'>
        <Section title='就寝時刻' onReset={() => update({ bedtime: DEFAULT_FORM.bedtime })}>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='bedtime' className='sr-only'>
              就寝時刻
            </Label>
            <Input
              id='bedtime'
              name='bedtime'
              type='time'
              autoComplete='off'
              value={form.bedtime}
              onChange={(e) => update({ bedtime: e.target.value })}
              aria-invalid={errors.bedtime !== undefined}
              aria-describedby={describedBy(errors.bedtime !== undefined && 'bedtime-error')}
              className='h-12 w-36 text-xl font-bold tabular-nums'
            />
            <FieldError id='bedtime-error' message={errors.bedtime} />
          </div>
        </Section>

        <Section
          title='判定の境目'
          onReset={() => update({ lower: DEFAULT_FORM.lower, upper: DEFAULT_FORM.upper })}
        >
          <ul className='text-muted-foreground flex flex-col gap-1.5 text-sm'>
            <li className='flex items-start gap-2'>
              <UserRound aria-hidden className='mt-0.5 size-4 shrink-0' />
              あなたの寝つきに合わせて決める値
            </li>
            <li className='flex items-start gap-2'>
              <Hourglass aria-hidden className='mt-0.5 size-4 shrink-0' />
              <span>
                半減期 8 時間で計算 <SourceLink source={HALF_LIFE_SOURCE} />
              </span>
            </li>
          </ul>
          <div className='flex flex-col gap-2'>
            <p className='text-base'>
              昨夜{' '}
              {lastNight === null ? (
                '記録なし'
              ) : (
                <>
                  <span className='font-bold tabular-nums'>{lastNight.residualMg}mg</span>{' '}
                  <VerdictLabel verdict={lastNight.verdict} />
                </>
              )}
            </p>
            <Gauge
              segments={[{ key: 'last-night', mg: lastNightMg, color: 'var(--gauge-base)' }]}
              scaleMax={gaugeScaleMax(preview, [lastNightMg])}
              thresholds={preview}
              className='h-3'
            />
          </div>
          <ThresholdField
            id='lower'
            suffix='mg 以上でグレー'
            value={form.lower}
            onChange={(value) => update({ lower: value })}
            error={errors.lower}
            groupErrorId={thresholdError === undefined ? undefined : 'thresholds-error'}
          />
          <ThresholdField
            id='upper'
            suffix='mg を超えるとアウト'
            value={form.upper}
            onChange={(value) => update({ upper: value })}
            error={errors.upper}
            groupErrorId={thresholdError === undefined ? undefined : 'thresholds-error'}
          />
          <FieldError id='thresholds-error' message={thresholdError} />
        </Section>

        <Section
          title='1 杯のカフェイン量'
          onReset={() => update({ caffeineMg: DEFAULT_FORM.caffeineMg })}
        >
          <ul className='flex flex-col gap-3'>
            {DRINKS.map((drink) => (
              <li key={drink.id}>
                <CaffeineField
                  id={`caffeine-${drink.id}`}
                  drinkId={drink.id}
                  name={drink.name}
                  note={[drink.detail, drink.isEstimate ? '推定値' : null]
                    .filter((s) => s !== null)
                    .join('・')}
                  source={drink.source}
                  value={form.caffeineMg[drink.id]}
                  onChange={(value) => updateCaffeine(drink.id, value)}
                  error={errors.caffeineMg[drink.id]}
                />
              </li>
            ))}
          </ul>
        </Section>

        <div className='pt-6'>
          <Button type='submit' className='h-12 w-full text-base'>
            設定を保存
          </Button>
        </div>
      </form>
    </div>
  );
}

type NumberInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  describedBy: string | undefined;
};

function NumberInput({ id, value, onChange, invalid, describedBy: described }: NumberInputProps) {
  return (
    <Input
      id={id}
      name={id}
      type='text'
      inputMode='numeric'
      autoComplete='off'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={invalid}
      aria-describedby={described}
      className='h-11 w-20 shrink-0 text-right text-lg font-bold tabular-nums'
    />
  );
}

type ThresholdFieldProps = {
  id: string;
  suffix: string;
  value: string;
  onChange: (value: string) => void;
  error: string | undefined;
  groupErrorId: string | undefined;
};

function ThresholdField({ id, suffix, value, onChange, error, groupErrorId }: ThresholdFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className='flex flex-col gap-1'>
      <div className='flex items-center gap-2'>
        <NumberInput
          id={id}
          value={value}
          onChange={onChange}
          invalid={error !== undefined || groupErrorId !== undefined}
          describedBy={describedBy(error !== undefined && errorId, groupErrorId ?? false)}
        />
        <Label htmlFor={id} className='text-base font-normal'>
          {suffix}
        </Label>
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

type CaffeineFieldProps = {
  id: string;
  drinkId: DrinkId;
  name: string;
  note: string;
  source: Source;
  value: string;
  onChange: (value: string) => void;
  error: string | undefined;
};

function CaffeineField({
  id,
  drinkId,
  name,
  note,
  source,
  value,
  onChange,
  error,
}: CaffeineFieldProps) {
  const errorId = `${id}-error`;
  const noteId = `${id}-note`;
  return (
    <div className='flex flex-col gap-1'>
      <div className='flex items-center gap-3'>
        <DrinkSwatch drinkId={drinkId} className='size-6' />
        <span className='flex min-w-0 grow flex-col'>
          <Label htmlFor={id} className='text-base break-keep'>
            {name}
          </Label>
          {note !== '' && (
            <span id={noteId} className='text-muted-foreground text-sm break-keep'>
              {note}
            </span>
          )}
        </span>
        <NumberInput
          id={id}
          value={value}
          onChange={onChange}
          invalid={error !== undefined}
          describedBy={describedBy(note !== '' && noteId, error !== undefined && errorId)}
        />
        <span className='text-muted-foreground w-6 shrink-0 text-base'>mg</span>
      </div>
      <p className='text-muted-foreground flex items-start gap-1.5 pl-9 text-xs leading-relaxed'>
        <BookOpen aria-hidden className='mt-0.5 size-3.5 shrink-0' />
        <SourceLink source={source} />
      </p>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
