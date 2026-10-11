import { createFileRoute } from '@tanstack/react-router';
import { RotateCcw } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { toast } from 'sonner';

import { useAppState } from '@/app-state';
import { DrinkSwatch } from '@/components/cup';
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
import type { DrinkId } from '@/domain/types';

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

function describedBy(...ids: (string | false)[]): string | undefined {
  const joined = ids.filter((id) => id !== false).join(' ');
  return joined === '' ? undefined : joined;
}

type SectionProps = {
  title: string;
  onReset: () => void;
  children: ReactNode;
};

function Section({ title, onReset, children }: SectionProps) {
  return (
    <fieldset className='border-border flex flex-col gap-4 rounded-xl border p-4'>
      <div className='flex items-center justify-between gap-2'>
        <legend className='float-left min-w-0 text-base font-bold break-keep'>{title}</legend>
        <Button
          type='button'
          variant='ghost'
          className='text-muted-foreground h-11 px-3 text-sm'
          onClick={onReset}
        >
          <RotateCcw aria-hidden className='size-4' />
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
      const firstInvalid = event.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }
    setErrors(NO_ERRORS);
    updateSettings(result.settings);
    toast('設定を保存しました', { duration: 5000 });
  };

  const thresholdError = errors.thresholds;

  return (
    <div className='mx-auto w-full max-w-lg px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]'>
      <h1 className='text-xl font-bold'>設定</h1>

      <form noValidate onSubmit={handleSubmit} className='mt-4 flex flex-col gap-6'>
        <Section title='就寝時刻' onReset={() => update({ bedtime: DEFAULT_FORM.bedtime })}>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='bedtime' className='text-base'>
              寝る時刻
            </Label>
            <Input
              id='bedtime'
              name='bedtime'
              type='time'
              value={form.bedtime}
              onChange={(e) => update({ bedtime: e.target.value })}
              aria-invalid={errors.bedtime !== undefined}
              aria-describedby={describedBy(
                'bedtime-hint',
                errors.bedtime !== undefined && 'bedtime-error',
              )}
              className='h-11 w-36 text-base'
            />
            <p id='bedtime-hint' className='text-muted-foreground text-sm'>
              0:00〜4:59 は翌日の時刻として扱います
            </p>
            <FieldError id='bedtime-error' message={errors.bedtime} />
          </div>
        </Section>

        <Section
          title='判定の境目'
          onReset={() => update({ lower: DEFAULT_FORM.lower, upper: DEFAULT_FORM.upper })}
        >
          <p className='text-muted-foreground text-sm'>
            自分で決めた値です。寝つきが悪かった日は、昨夜の残量を見て調整してください。
          </p>
          <p className='text-base'>
            昨夜の残量{' '}
            {lastNight === null ? (
              '記録なし'
            ) : (
              <>
                <span className='font-bold tabular-nums'>{lastNight.residualMg}mg</span>{' '}
                <VerdictLabel verdict={lastNight.verdict} />
              </>
            )}
          </p>
          <NumberField
            id='lower'
            label='グレーになる残量（この値以上）'
            value={form.lower}
            onChange={(value) => update({ lower: value })}
            error={errors.lower}
            groupErrorId={thresholdError === undefined ? undefined : 'thresholds-error'}
          />
          <NumberField
            id='upper'
            label='アウトになる残量（この値を超える）'
            value={form.upper}
            onChange={(value) => update({ upper: value })}
            error={errors.upper}
            groupErrorId={thresholdError === undefined ? undefined : 'thresholds-error'}
          />
          <FieldError id='thresholds-error' message={thresholdError} />
        </Section>

        <Section
          title='各飲み物のカフェイン量'
          onReset={() => update({ caffeineMg: DEFAULT_FORM.caffeineMg })}
        >
          {DRINKS.map((drink) => (
            <NumberField
              key={drink.id}
              id={`caffeine-${drink.id}`}
              label={drink.isEstimate ? `${drink.name}（推定値）` : drink.name}
              drinkId={drink.id}
              value={form.caffeineMg[drink.id]}
              onChange={(value) => updateCaffeine(drink.id, value)}
              error={errors.caffeineMg[drink.id]}
            />
          ))}
        </Section>

        <Button type='submit' className='h-12 text-base'>
          保存
        </Button>
      </form>
    </div>
  );
}

type NumberFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error: string | undefined;
  groupErrorId?: string | undefined;
  drinkId?: DrinkId;
};

function NumberField({
  id,
  label,
  value,
  onChange,
  error,
  groupErrorId,
  drinkId,
}: NumberFieldProps) {
  const errorId = `${id}-error`;
  const invalid = error !== undefined || groupErrorId !== undefined;
  return (
    <div className='flex flex-col gap-2'>
      <Label htmlFor={id} className='text-base'>
        {drinkId !== undefined && <DrinkSwatch drinkId={drinkId} className='size-5' />}
        {label}
      </Label>
      <div className='flex items-center gap-2'>
        <Input
          id={id}
          name={id}
          type='text'
          inputMode='numeric'
          autoComplete='off'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid}
          aria-describedby={describedBy(error !== undefined && errorId, groupErrorId ?? false)}
          className='h-11 w-28 text-base tabular-nums'
        />
        <span className='text-base'>mg</span>
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
