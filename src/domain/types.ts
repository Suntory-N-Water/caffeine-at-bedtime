export const DRINK_IDS = [
  'home-coffee',
  'seven-cafe-hot',
  'seven-cafe-iced',
  'green-tea',
  'hojicha',
  'jasmine-tea',
  'black-tea',
] as const;

export type DrinkId = (typeof DRINK_IDS)[number];

export type Drink = {
  id: DrinkId;
  name: string;
  detail: string | null;
  defaultCaffeineMg: number;
  isEstimate: boolean;
  source: Source;
};

export type Source = {
  label: string;
  url: string;
};

export type CaffeineRecord = {
  id: string;
  drinkId: DrinkId;
  drankAt: number;
  caffeineMg: number;
};

export type Thresholds = {
  lower: number;
  upper: number;
};

export type Settings = {
  bedtimeMinutes: number;
  thresholds: Thresholds;
  caffeineMg: Record<DrinkId, number>;
};

export type Verdict = 'ok' | 'gray' | 'out';
