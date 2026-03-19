import { db } from './db';
import { getTodayString } from './dates';

export async function getDueWords() {
  const today = getTodayString();
  const dueReviews = await db.reviews.where('nextReview').belowOrEqual(today).toArray();
  if (dueReviews.length === 0) return [];

  const wordIds = dueReviews.map(r => r.wordId);
  return db.words.where('id').anyOf(wordIds).toArray();
}

export function getDueCount(words, reviews) {
  const today = getTodayString();
  const wordIds = new Set(words.map(w => w.id));
  return reviews.filter(r => wordIds.has(r.wordId) && r.nextReview <= today).length;
}
