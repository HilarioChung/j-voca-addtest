import Dexie from 'dexie';
import { createInitialReview } from './fsrs';

export let db = createDb();

function createDb() {
  const d = new Dexie('j-voca');

  d.version(3).stores({
    words: 'id, chapter, textbook, createdAt',
    reviews: 'wordId, due, last_review, state',
    reviewLogs: '++id, wordId, review_date, grade',
  });

  return d;
}

const SCHEMA_ERRORS = ['VersionError', 'UpgradeError'];

async function backupBeforeDelete() {
  try {
    const idb = await new Promise((resolve, reject) => {
      const req = indexedDB.open('j-voca');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const names = [...idb.objectStoreNames];
    if (names.length === 0) { idb.close(); return; }
    const tx = idb.transaction(names, 'readonly');
    const backup = {};
    await Promise.all(names.map(name =>
      new Promise(resolve => {
        const req = tx.objectStore(name).getAll();
        req.onsuccess = () => { backup[name] = req.result; resolve(); };
        req.onerror = () => resolve();
      })
    ));
    idb.close();
    if (Object.values(backup).some(arr => arr?.length > 0)) {
      localStorage.setItem(
        'j-voca-db-backup-' + Date.now(),
        JSON.stringify({ ...backup, backedUpAt: new Date().toISOString() })
      );
    }
  } catch (_) {
    // Best-effort backup
  }
}

export async function openDb() {
  try {
    await db.open();
  } catch (err) {
    if (SCHEMA_ERRORS.includes(err.name)) {
      await backupBeforeDelete();
      await Dexie.delete('j-voca');
      db = createDb();
      await db.open();
    } else {
      throw err;
    }
  }
}

export async function syncWordsFromData(words) {
  await db.transaction('rw', db.words, async () => {
    await db.words.clear();
    if (words?.length) await db.words.bulkPut(words);
  });
}

export async function putReview(review) {
  return db.reviews.put(review);
}

export async function putReviewLog(log) {
  return db.reviewLogs.add(log);
}

export async function deleteReview(wordId) {
  return db.reviews.delete(wordId);
}

export async function exportData() {
  const words = await db.words.toArray();
  const reviews = await db.reviews.toArray();
  const reviewLogs = await db.reviewLogs.toArray();
  return { words, reviews, reviewLogs, exportedAt: new Date().toISOString() };
}

export async function importReviews(reviews, reviewLogs) {
  await db.transaction('rw', db.reviews, db.reviewLogs, async () => {
    await db.reviews.clear();
    if (reviews?.length) await db.reviews.bulkPut(reviews);
    await db.reviewLogs.clear();
    if (reviewLogs?.length) await db.reviewLogs.bulkPut(reviewLogs);
  });
}

export async function ensureReviewsExist() {
  const allWords = await db.words.toArray();
  const existingReviews = await db.reviews.toArray();
  const reviewedIds = new Set(existingReviews.map(r => r.wordId));

  const missing = allWords.filter(w => !reviewedIds.has(w.id));
  if (missing.length > 0) {
    await db.reviews.bulkPut(missing.map(w => createInitialReview(w.id)));
  }
}

export async function clearAllReviews() {
  await db.transaction('rw', db.reviews, db.reviewLogs, async () => {
    await db.reviews.clear();
    await db.reviewLogs.clear();
  });
}

export async function clearAllData() {
  await db.transaction('rw', db.words, db.reviews, db.reviewLogs, async () => {
    await db.words.clear();
    await db.reviews.clear();
    await db.reviewLogs.clear();
  });
}
