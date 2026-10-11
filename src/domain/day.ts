const DAY_START_HOUR = 5;

export type Day = {
  start: number;
  end: number;
};

export function dayOf(time: number): Day {
  const date = new Date(time);
  const dayOffset = date.getHours() < DAY_START_HOUR ? -1 : 0;
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + dayOffset,
    DAY_START_HOUR,
  );
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1, DAY_START_HOUR);
  return { start: start.getTime(), end: end.getTime() };
}

export function previousDay(day: Day): Day {
  return dayOf(day.start - 1);
}

export function isInDay(time: number, day: Day): boolean {
  return day.start <= time && time < day.end;
}

export function bedtimeOf(day: Day, bedtimeMinutes: number): number {
  const start = new Date(day.start);
  const isAfterMidnight = bedtimeMinutes < DAY_START_HOUR * 60;
  return new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + (isAfterMidnight ? 1 : 0),
    0,
    bedtimeMinutes,
  ).getTime();
}
