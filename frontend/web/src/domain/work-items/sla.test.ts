import { describe, expect, it } from 'vitest';

import { classifySla, formatDuration } from './sla';

const now = new Date('2026-09-09T12:00:00.000Z');

describe('classifySla', () => {
  it.each([
    [undefined, 'unavailable'],
    ['2026-09-09T11:59:00.000Z', 'critical'],
    ['2026-09-09T12:29:00.000Z', 'critical'],
    ['2026-09-09T15:00:00.000Z', 'approaching'],
    ['2026-09-10T12:01:00.000Z', 'healthy'],
  ] as const)('classifies %s as %s', (dueAt, expected) => {
    expect(classifySla(dueAt, now)).toBe(expected);
  });
});

describe('formatDuration', () => {
  it('formats overdue, minutes, hours, and days', () => {
    expect(formatDuration(-60_000)).toBe('Vencido');
    expect(formatDuration(28 * 60_000)).toBe('28 min');
    expect(formatDuration(3.5 * 3_600_000)).toBe('3h 30min');
    expect(formatDuration(27 * 3_600_000)).toBe('1d 3h');
  });
});
