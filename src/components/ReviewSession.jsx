import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/db';
import { gradeCard, createInitialReview } from '../lib/fsrs';
import { getDueWords } from '../lib/review-utils';
import FlashCard from './FlashCard';

export default function ReviewSession() {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [noWords, setNoWords] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState({ again: 0, hard: 0, good: 0 });
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    getDueWords().then(words => {
      if (words.length === 0) {
        setNoWords(true);
      } else {
        const shuffled = words.sort(() => Math.random() - 0.5);
        setQueue(shuffled);
        setWordCount(shuffled.length);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('ReviewSession load error:', err);
      setError(err.message || '데이터를 불러올 수 없습니다');
      setLoading(false);
    });
  }, []);

  const currentWord = queue[currentIndex];
  const done = !loading && queue.length > 0 && currentIndex >= queue.length;

  async function handleGrade(grade) {
    if (!currentWord || saving) return;
    setSaving(true);

    try {
      let review = await db.reviews.get(currentWord.id);
      if (!review) review = createInitialReview(currentWord.id);
      const updated = gradeCard(review, grade);
      // 단일 트랜잭션으로 review와 log를 함께 저장
      await db.transaction('rw', db.reviews, db.reviewLogs, async () => {
        await db.reviews.put(updated);
        await db.reviewLogs.add({
          wordId: currentWord.id,
          review_date: new Date().toISOString(),
          grade,
        });
      });
    } catch (err) {
      console.error('Review save error:', err);
      setSaveError(err.message || '저장 실패');
    }

    setSaving(false);
    setResults(prev => ({ ...prev, [grade]: prev[grade] + 1 }));

    if (grade === 'again') {
      // 모름: 큐 뒤쪽에 재삽입하여 같은 세션에서 다시 복습
      setQueue(prev => [...prev, currentWord]);
    }

    setCurrentIndex(prev => prev + 1);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">&#x26A0;&#xFE0F;</p>
        <p className="text-lg font-medium text-slate-800">데이터 로드 실패</p>
        <p className="text-sm text-slate-400 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm"
        >
          새로고침
        </button>
      </div>
    );
  }

  if (noWords) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">&#x1F389;</p>
        <p className="text-lg font-medium text-slate-800">복습할 단어가 없습니다</p>
        <p className="text-sm text-slate-400 mt-2">내일 다시 확인해보세요</p>
        <Link to="/" className="text-indigo-600 font-medium text-sm mt-4 inline-block">홈으로</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-12 space-y-6">
        <p className="text-4xl">&#x2705;</p>
        <p className="text-lg font-medium text-slate-800">복습 완료!</p>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="bg-red-50 rounded-xl p-3">
            <p className="text-red-500 font-medium">{results.again}</p>
            <p className="text-slate-400">모름</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3">
            <p className="text-orange-400 font-medium">{results.hard}</p>
            <p className="text-slate-400">애매</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-green-500 font-medium">{results.good}</p>
            <p className="text-slate-400">앎</p>
          </div>
        </div>
        <p className="text-sm text-slate-400">{wordCount}개 단어 복습 완료</p>
        <Link to="/" className="text-indigo-600 font-medium text-sm inline-block">홈으로</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">복습</h1>
        <span className="text-sm text-slate-400">{currentIndex + 1} / {queue.length}</span>
      </div>

      {saveError && (
        <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">저장 오류: {saveError}</p>
      )}

      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / queue.length) * 100}%` }}
        />
      </div>

      {currentWord && <FlashCard key={currentIndex} word={currentWord} onGrade={handleGrade} />}
    </div>
  );
}
