export type SlaState =
  | 'critical'
  | 'approaching'
  | 'healthy'
  | 'unavailable';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function getRemainingSlaMs(
  dueAt: string | undefined,
  now = new Date(),
) {
  return dueAt ? new Date(dueAt).getTime() - now.getTime() : undefined;
}

export function classifySla(
  dueAt: string | undefined,
  now = new Date(),
): SlaState {
  const remaining = getRemainingSlaMs(dueAt, now);

  if (remaining === undefined) return 'unavailable';
  if (remaining <= HOUR) return 'critical';
  if (remaining <= 8 * HOUR) return 'approaching';

  return 'healthy';
}

export function formatDuration(milliseconds: number) {
  if (milliseconds <= 0) return 'Vencido';
  if (milliseconds < HOUR) return `${Math.ceil(milliseconds / MINUTE)} min`;

  if (milliseconds < DAY) {
    const hours = Math.floor(milliseconds / HOUR);
    const minutes = Math.floor((milliseconds % HOUR) / MINUTE);
    return minutes ? `${hours}h ${minutes}min` : `${hours}h`;
  }

  const days = Math.floor(milliseconds / DAY);
  const hours = Math.floor((milliseconds % DAY) / HOUR);
  return hours ? `${days}d ${hours}h` : `${days}d`;
}
