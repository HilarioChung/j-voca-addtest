import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTodayString } from '../dates';

beforeEach(() => {});

afterEach(() => {
  vi.setSystemTime(vi.getRealSystemTime());
});

describe('getTodayString', () => {
  it('YYYY-MM-DD 형식 반환', () => {
    vi.setSystemTime(new Date('2026-03-19T15:30:00Z'));
    const result = getTodayString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('올바른 날짜 반환', () => {
    vi.setSystemTime(new Date('2026-01-05T00:00:00Z'));
    expect(getTodayString()).toBe('2026-01-05');
  });

  it('연말 날짜 처리', () => {
    vi.setSystemTime(new Date('2026-12-31T23:59:59Z'));
    expect(getTodayString()).toBe('2026-12-31');
  });
});
