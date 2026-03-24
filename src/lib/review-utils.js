import { db } from './db';
import { isDue } from './fsrs';

/**
 * 복습 대상 단어를 반환한다.
 * chapter를 지정하면 해당 lesson만, 생략하면 전체를 반환한다.
 */
export async function getDueWords(chapter) {
  const allReviews = await db.reviews.toArray();
  const dueReviews = allReviews.filter(r => isDue(r));
  if (dueReviews.length === 0) return [];

  const wordIds = dueReviews.map(r => r.wordId);
  const words = await db.words.where('id').anyOf(wordIds).toArray();

  // lesson 필터링: chapter가 지정되면 해당 lesson만 반환
  if (chapter != null) return words.filter(w => w.chapter === chapter);
  return words;
}

export function getDueCount(words, reviews) {
  const wordIds = new Set(words.map(w => w.id));
  const dueReviews = reviews.filter(r => wordIds.has(r.wordId) && isDue(r));
  // Learning/Relearning(state 1,3)은 재확인 카드, 나머지는 일반 복습 카드
  const reconfirmCount = dueReviews.filter(r => r.state === 1 || r.state === 3).length;
  return { total: dueReviews.length, reconfirm: reconfirmCount };
}

/**
 * lesson별 due 카운트를 반환한다.
 * { [chapter]: { total, reconfirm } } 형태.
 */
export function getDueCountByLesson(words, reviews) {
  const reviewByWordId = new Map(reviews.map(r => [r.wordId, r]));
  const result = {};

  for (const w of words) {
    const r = reviewByWordId.get(w.id);
    if (!r || !isDue(r)) continue;

    if (!result[w.chapter]) result[w.chapter] = { total: 0, reconfirm: 0 };
    result[w.chapter].total++;
    if (r.state === 1 || r.state === 3) result[w.chapter].reconfirm++;
  }

  return result;
}
