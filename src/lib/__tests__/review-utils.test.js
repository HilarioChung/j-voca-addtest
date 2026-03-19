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

  it('오늘 이전 nextReview인 단어 수 반환', () => {
    vi.setSystemTime(new Date('2026-03-19T12:00:00Z'));
    const reviews = [
      { wordId: 1, nextReview: '2026-03-18' },
      { wordId: 2, nextReview: '2026-03-19' },
      { wordId: 3, nextReview: '2026-03-20' },
    ];
    expect(getDueCount(words, reviews)).toBe(2);
  });

  it('단어가 없으면 0', () => {
    vi.setSystemTime(new Date('2026-03-19T12:00:00Z'));
    const reviews = [{ wordId: 99, nextReview: '2026-03-19' }];
    expect(getDueCount([], reviews)).toBe(0);
  });

  it('리뷰가 없으면 0', () => {
    vi.setSystemTime(new Date('2026-03-19T12:00:00Z'));
    expect(getDueCount(words, [])).toBe(0);
  });

  it('삭제된 단어의 리뷰는 무시', () => {
    vi.setSystemTime(new Date('2026-03-19T12:00:00Z'));
    const reviews = [
      { wordId: 1, nextReview: '2026-03-19' },
      { wordId: 99, nextReview: '2026-03-19' },
    ];
    expect(getDueCount(words, reviews)).toBe(1);
  });
});
