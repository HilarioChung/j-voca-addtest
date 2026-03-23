import { db } from './db';
import { isDue } from './fsrs';

export async function getDueWords() {
  // 모든 리뷰를 로드하여 isDue()로 필터링 — Dexie 문자열 비교 대신
  // 날짜 기준 비교(isDue)와 동일한 로직을 사용하여 getDueCount와 일관성 보장
  const allReviews = await db.reviews.toArray();
  const dueReviews = allReviews.filter(r => isDue(r));
  if (dueReviews.length === 0) return [];

  const wordIds = dueReviews.map(r => r.wordId);
  return db.words.where('id').anyOf(wordIds).toArray();
}

export function getDueCount(words, reviews) {
  const wordIds = new Set(words.map(w => w.id));
  return reviews.filter(r => wordIds.has(r.wordId) && isDue(r)).length;
}
