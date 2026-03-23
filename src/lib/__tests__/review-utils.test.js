import { describe, it, expect, vi, afterEach } from 'vitest';
import { getDueCount } from '../review-utils';

afterEach(() => {
  vi.setSystemTime(vi.getRealSystemTime());
});

describe('getDueCount', () => {
  const words = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
  ];

  it('due 날짜가 오늘 이전인 단어 수 반환', () => {
    const now = new Date('2026-03-19T12:00:00Z');
    vi.setSystemTime(now);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const laterToday = new Date(now);
    laterToday.setHours(23, 59, 59, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const reviews = [
      { wordId: 1, due: yesterday.toISOString() },
      { wordId: 2, due: laterToday.toISOString() },
      { wordId: 3, due: tomorrow.toISOString() },
    ];
    // wordId 1: 어제 → due, wordId 2: 오늘 → due, wordId 3: 내일 → not due
    expect(getDueCount(words, reviews).total).toBe(2);
  });

  it('단어가 없으면 0', () => {
    vi.setSystemTime(new Date('2026-03-19T12:00:00Z'));
    const reviews = [{ wordId: 99, due: '2026-03-19T00:00:00.000Z' }];
    expect(getDueCount([], reviews).total).toBe(0);
  });

  it('리뷰가 없으면 0', () => {
    vi.setSystemTime(new Date('2026-03-19T12:00:00Z'));
    expect(getDueCount(words, []).total).toBe(0);
  });

  it('삭제된 단어의 리뷰는 무시', () => {
    vi.setSystemTime(new Date('2026-03-19T12:00:00Z'));
    const reviews = [
      { wordId: 1, due: '2026-03-19T00:00:00.000Z' },
      { wordId: 99, due: '2026-03-19T00:00:00.000Z' },
    ];
    expect(getDueCount(words, reviews).total).toBe(1);
  });

  it('Learning/Relearning 상태도 due면 카운트에 포함', () => {
    vi.setSystemTime(new Date('2026-03-19T12:00:00Z'));
    const reviews = [
      { wordId: 1, due: '2026-03-19T00:00:00.000Z', state: 1 },  // Learning
      { wordId: 2, due: '2026-03-19T00:00:00.000Z', state: 3 },  // Relearning
      { wordId: 3, due: '2026-03-19T00:00:00.000Z', state: 2 },  // Review
    ];
    expect(getDueCount(words, reviews)).toEqual({ total: 3, reconfirm: 2 });
  });
});
