import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sm2, createInitialReview, mapQuality } from '../sm2';

const FIXED_DATE = new Date('2026-03-19T12:00:00Z');

beforeEach(() => {
  vi.setSystemTime(FIXED_DATE);
});

afterEach(() => {
  vi.setSystemTime(vi.getRealSystemTime());
});

describe('mapQuality', () => {
  it('각 grade를 SM-2 quality로 매핑', () => {
    expect(mapQuality('again')).toBe(1);
    expect(mapQuality('hard')).toBe(2);
    expect(mapQuality('good')).toBe(4);
    expect(mapQuality('easy')).toBe(5);
  });

  it('알 수 없는 grade는 3 반환', () => {
    expect(mapQuality('unknown')).toBe(3);
    expect(mapQuality(undefined)).toBe(3);
  });
});

describe('createInitialReview', () => {
  it('초기 복습 데이터를 올바르게 생성', () => {
    const review = createInitialReview(42);
    expect(review).toEqual({
      wordId: 42,
      easiness: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: '2026-03-19',
      lastReview: null,
    });
  });
});

describe('sm2', () => {
  function makeReview(overrides = {}) {
    return {
      wordId: 1,
      easiness: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: '2026-03-19',
      lastReview: null,
      ...overrides,
    };
  }

  describe('again (quality=1) — 실패 시 리셋', () => {
    it('repetitions를 0으로, interval을 1로 리셋', () => {
      const review = makeReview({ repetitions: 3, interval: 15 });
      const result = sm2(review, 'again');
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });

    it('다음 복습일은 내일', () => {
      const result = sm2(makeReview(), 'again');
      expect(result.nextReview).toBe('2026-03-20');
    });

    it('easiness가 감소하지만 1.3 이상 유지', () => {
      const result = sm2(makeReview({ easiness: 1.4 }), 'again');
      expect(result.easiness).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('hard (quality=2) — 실패 시 리셋', () => {
    it('again과 마찬가지로 repetitions 리셋', () => {
      const result = sm2(makeReview({ repetitions: 2, interval: 6 }), 'hard');
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });
  });

  describe('good (quality=4) — 성공', () => {
    it('첫 번째 성공: interval=1', () => {
      const result = sm2(makeReview({ repetitions: 0 }), 'good');
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    it('두 번째 성공: interval=6', () => {
      const result = sm2(makeReview({ repetitions: 1, interval: 1 }), 'good');
      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
    });

    it('세 번째 이후: interval = round(interval * easiness)', () => {
      const result = sm2(makeReview({ repetitions: 2, interval: 6, easiness: 2.5 }), 'good');
      expect(result.interval).toBe(15);
      expect(result.repetitions).toBe(3);
    });

    it('nextReview가 interval일 후', () => {
      const result = sm2(makeReview({ repetitions: 2, interval: 6, easiness: 2.5 }), 'good');
      expect(result.nextReview).toBe('2026-04-03');
    });
  });

  describe('easy (quality=5) — 성공, easiness 증가', () => {
    it('easiness가 증가', () => {
      const result = sm2(makeReview({ easiness: 2.5 }), 'easy');
      expect(result.easiness).toBe(2.6);
    });
  });

  describe('easiness 계산 정밀도', () => {
    it('good(q=4)일 때 easiness = 2.5 + 0.1 - 0.08 - 0.02 = 2.5', () => {
      const result = sm2(makeReview({ easiness: 2.5 }), 'good');
      expect(result.easiness).toBe(2.5);
    });

    it('again(q=1)일 때 easiness = 2.5 + (0.1 - 0.64) = 1.96', () => {
      const result = sm2(makeReview({ easiness: 2.5 }), 'again');
      expect(result.easiness).toBeCloseTo(1.96, 10);
    });

    it('hard(q=2)일 때 정확한 easiness', () => {
      // EF = 2.5 + (0.1 - (5-2)*(0.08 + (5-2)*0.02))
      // EF = 2.5 + (0.1 - 3*(0.08 + 0.06))
      // EF = 2.5 + (0.1 - 0.42) = 2.5 - 0.32 = 2.18
      const result = sm2(makeReview({ easiness: 2.5 }), 'hard');
      expect(result.easiness).toBeCloseTo(2.18, 10);
    });
  });

  describe('연속 학습 시나리오', () => {
    it('good 연속 3회: interval 1→6→15', () => {
      let review = makeReview();
      review = sm2(review, 'good'); // rep=1, interval=1
      expect(review.interval).toBe(1);

      review = sm2(review, 'good'); // rep=2, interval=6
      expect(review.interval).toBe(6);

      review = sm2(review, 'good'); // rep=3, interval=round(6*2.5)=15
      expect(review.interval).toBe(15);
    });

    it('성공 후 실패하면 처음부터 다시', () => {
      let review = makeReview();
      review = sm2(review, 'good'); // rep=1
      review = sm2(review, 'good'); // rep=2
      review = sm2(review, 'again'); // 리셋

      expect(review.repetitions).toBe(0);
      expect(review.interval).toBe(1);

      review = sm2(review, 'good'); // 다시 rep=1
      expect(review.repetitions).toBe(1);
      expect(review.interval).toBe(1);
    });
  });

  describe('easiness 하한', () => {
    it('1.3 미만으로 내려가지 않음', () => {
      const result = sm2(makeReview({ easiness: 1.3 }), 'again');
      expect(result.easiness).toBe(1.3);
    });

    it('여러 번 again 후에도 1.3 유지', () => {
      let review = makeReview({ easiness: 2.5 });
      for (let i = 0; i < 20; i++) {
        review = sm2(review, 'again');
      }
      expect(review.easiness).toBe(1.3);
    });
  });

  describe('lastReview', () => {
    it('항상 오늘 날짜로 설정', () => {
      const result = sm2(makeReview(), 'good');
      expect(result.lastReview).toBe('2026-03-19');
    });
  });

  describe('원본 불변성', () => {
    it('입력 review 객체를 변경하지 않음', () => {
      const original = makeReview();
      const frozen = { ...original };
      sm2(original, 'good');
      expect(original).toEqual(frozen);
    });
  });
});
