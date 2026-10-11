import { bedtimeOf, type Day, dayOf, isInDay, previousDay } from './day';
import { DRINKS } from './drinks';
import type { CaffeineRecord, Drink, Settings, Thresholds, Verdict } from './types';
import { judge } from './verdict';

const HALF_LIFE_HOURS = 8;
const HOUR_MS = 60 * 60 * 1000;
export const DAILY_LIMIT_MG = 400;

export type Assessment = {
  residualMg: number;
  verdict: Verdict;
};

export type DrinkAssessment = Assessment & {
  drink: Drink;
  caffeineMg: number;
};

export type Evaluation = {
  withoutDrink: Assessment;
  drinks: DrinkAssessment[];
  todayRecords: CaffeineRecord[];
  todayIntakeMg: number;
  isOverDailyLimit: boolean;
  lastNight: Assessment | null;
};

function residualOf(caffeineMg: number, hoursUntilBed: number): number {
  return caffeineMg * 0.5 ** (hoursUntilBed / HALF_LIFE_HOURS);
}

function totalResidual(records: CaffeineRecord[], bedAt: number): number {
  return records.reduce(
    (sum, r) => sum + residualOf(r.caffeineMg, (bedAt - r.drankAt) / HOUR_MS),
    0,
  );
}

function assess(residualMg: number, thresholds: Thresholds): Assessment {
  return { residualMg: Math.round(residualMg), verdict: judge(residualMg, thresholds) };
}

export function evaluate(records: CaffeineRecord[], settings: Settings, now: number): Evaluation {
  const today = dayOf(now);
  const lastDay = previousDay(today);
  const todayRecords = records
    .filter((r) => isInDay(r.drankAt, today))
    .sort((a, b) => b.drankAt - a.drankAt);
  const lastDayRecords = records.filter((r) => isInDay(r.drankAt, lastDay));

  // 就寝時刻を過ぎても起きている場合は、今すぐ寝たとして計算する
  const bedAt = Math.max(bedtimeOf(today, settings.bedtimeMinutes), now);
  const baseResidual = totalResidual(todayRecords, bedAt);

  const drinks = DRINKS.map((drink) => {
    const caffeineMg = settings.caffeineMg[drink.id];
    const residual = baseResidual + residualOf(caffeineMg, (bedAt - now) / HOUR_MS);
    return { drink, caffeineMg, ...assess(residual, settings.thresholds) };
  });

  const todayIntakeMg = todayRecords.reduce((sum, r) => sum + r.caffeineMg, 0);

  return {
    withoutDrink: assess(baseResidual, settings.thresholds),
    drinks,
    todayRecords,
    todayIntakeMg,
    isOverDailyLimit: todayIntakeMg > DAILY_LIMIT_MG,
    lastNight: assessLastNight(lastDayRecords, settings, lastDay),
  };
}

function assessLastNight(
  records: CaffeineRecord[],
  settings: Settings,
  day: Day,
): Assessment | null {
  if (records.length === 0) {
    return null;
  }
  // 就寝時刻より後に記録があれば、その時刻までは起きていたとみなす（利用者が決めた扱い）
  const lastDrankAt = Math.max(...records.map((r) => r.drankAt));
  const bedAt = Math.max(bedtimeOf(day, settings.bedtimeMinutes), lastDrankAt);
  return assess(totalResidual(records, bedAt), settings.thresholds);
}
