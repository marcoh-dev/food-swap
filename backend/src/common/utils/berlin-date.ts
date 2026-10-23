// Listings end at the end of a calendar day in Germany, so all day based
// date rules use Berlin time, independent of the server's time zone.

export const TIME_ZONE = 'Europe/Berlin';

const DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function timeZoneOffset(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(date);
  const part = (type: string) =>
    Number(parts.find((entry) => entry.type === type)?.value);
  const asUtc = Date.UTC(
    part('year'),
    part('month') - 1,
    part('day'),
    part('hour'),
    part('minute'),
    part('second'),
  );

  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

// Parses "YYYY-MM-DD HH:mm[:ss.SSS]" as Berlin local time.
export function berlinTime(local: string): Date {
  const match =
    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::(\d{2})\.(\d{3}))?$/.exec(
      local,
    );
  if (!match) throw new Error(`Invalid date "${local}"`);

  const [, year, month, day, hour, minute, second = '0', ms = '0'] = match;
  const guess = Date.UTC(+year, +month - 1, +day, +hour, +minute, +second, +ms);
  const offset = timeZoneOffset(
    new Date(guess - timeZoneOffset(new Date(guess))),
  );

  return new Date(guess - offset);
}

// The Berlin calendar day of a point in time as "YYYY-MM-DD".
export function berlinDay(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(date);
}

export function isCalendarDay(day: string): boolean {
  const match = DAY_PATTERN.exec(day);
  if (!match) return false;

  const [, year, month, date] = match.map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, date));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === date
  );
}

export function shiftDay(day: string, { days = 0, months = 0 }): string {
  const [year, month, date] = day.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + months, date + days));

  return shifted.toISOString().slice(0, 10);
}

// The last millisecond of a "YYYY-MM-DD" day in Berlin.
export function endOfDay(day: string): Date {
  return berlinTime(`${day} 23:59:59.999`);
}
