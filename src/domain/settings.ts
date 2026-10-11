import { DRINKS } from './drinks';
import { DRINK_IDS, type DrinkId, type Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  bedtimeMinutes: 23 * 60,
  thresholds: { lower: 75, upper: 80 },
  caffeineMg: Object.fromEntries(DRINKS.map((d) => [d.id, d.defaultCaffeineMg])) as Record<
    DrinkId,
    number
  >,
};

export type SettingsForm = {
  bedtime: string;
  lower: string;
  upper: string;
  caffeineMg: Record<DrinkId, string>;
};

export type SettingsErrors = {
  bedtime?: string;
  lower?: string;
  upper?: string;
  thresholds?: string;
  caffeineMg: Partial<Record<DrinkId, string>>;
};

export type ValidationResult =
  | { ok: true; settings: Settings }
  | { ok: false; errors: SettingsErrors };

const NON_NEGATIVE_INTEGER = /^\d+$/;
const TIME = /^(\d{1,2}):(\d{2})$/;
const NUMBER_ERROR = '0 以上の整数を入力してください';

export function formatBedtime(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function toSettingsForm(settings: Settings): SettingsForm {
  return {
    bedtime: formatBedtime(settings.bedtimeMinutes),
    lower: String(settings.thresholds.lower),
    upper: String(settings.thresholds.upper),
    caffeineMg: Object.fromEntries(
      DRINK_IDS.map((id) => [id, String(settings.caffeineMg[id])]),
    ) as Record<DrinkId, string>,
  };
}

function parseNonNegativeInteger(value: string): number | null {
  const trimmed = value.trim();
  return NON_NEGATIVE_INTEGER.test(trimmed) ? Number(trimmed) : null;
}

function parseBedtime(value: string): number | null {
  const match = TIME.exec(value.trim());
  if (match === null) {
    return null;
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) {
    return null;
  }
  return hour * 60 + minute;
}

export function validateSettings(form: SettingsForm): ValidationResult {
  const errors: SettingsErrors = { caffeineMg: {} };

  const bedtimeMinutes = parseBedtime(form.bedtime);
  if (bedtimeMinutes === null) {
    errors.bedtime = '時刻を入力してください';
  }

  const lower = parseNonNegativeInteger(form.lower);
  const upper = parseNonNegativeInteger(form.upper);
  if (lower === null) {
    errors.lower = NUMBER_ERROR;
  }
  if (upper === null) {
    errors.upper = NUMBER_ERROR;
  }
  if (lower !== null && upper !== null && upper < lower) {
    errors.thresholds = 'アウトの境目は、グレーの境目以上にしてください';
  }

  const caffeineMg: Partial<Record<DrinkId, number>> = {};
  for (const id of DRINK_IDS) {
    const value = parseNonNegativeInteger(form.caffeineMg[id]);
    if (value === null) {
      errors.caffeineMg[id] = NUMBER_ERROR;
    } else {
      caffeineMg[id] = value;
    }
  }

  const hasError =
    errors.bedtime !== undefined ||
    errors.lower !== undefined ||
    errors.upper !== undefined ||
    errors.thresholds !== undefined ||
    Object.keys(errors.caffeineMg).length > 0;
  if (hasError || bedtimeMinutes === null || lower === null || upper === null) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    settings: {
      bedtimeMinutes,
      thresholds: { lower, upper },
      caffeineMg: caffeineMg as Record<DrinkId, number>,
    },
  };
}
