import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { db } from '../lib/db';
import { gradeCard, createInitialReview } from '../lib/fsrs';
import { getDueWords } from '../lib/review-utils';
import { shuffle } from '../lib/shuffle';
import { canConjugate } from '../lib/conjugation';
import FlashCard from './FlashCard';
import ConjugationCards from './ConjugationCards';

export default function ReviewSession() {
  const [params] = useSearchParams();
  const lessonParam = params.get('lesson');
  const chapter = lessonParam != null ? Number(lessonParam) : undefined;

  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [noWords, setNoWords] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState({ again: 0, hard: 0, good: 0 });
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [showConj, setShowConj] = useState(false);
  const [conjWord, setConjWord] = useState(null);

  useEffect(() => {
    getDueWords(chapter).then(words => {
      if (words.length === 0) {
        setNoWords(true);
      } else {
        const shuffled = shuffle(words);
        setQueue(shuffled);
        setWordCount(shuffled.length);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('ReviewSession load error:', err);
      setError(err.message || '데이터를 불러올 수 없습니다');
      setLoading(false);
    });
  }, [chapter]);

  const currentWord = queue[currentIndex];
  const done = !loading && queue.length > 0 && currentIndex >= queue.length;

  async function handleGrade(grade) {
    if (!currentWord || saving) return;
    setSaving(true);

    try {
      let review = await db.reviews.get(currentWord.id);
      if (!review) review = createInitialReview(currentWord.id);
      const updated = gradeCard(review, grade);
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
      setSaving(false);
      return;
    }

    setSaving(false);
    setResults(prev => ({ ...prev, [grade]: prev[grade] + 1 }));

    if (grade === 'again') {
      setQueue(prev => [...prev, currentWord]);
    }

    if (canConjugate(currentWord.pos)) {
      setConjWord(currentWord);
      setShowConj(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
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
        <Link to="/lesson-select" className="text-indigo-600 font-medium text-sm mt-4 inline-block">돌아가기</Link>
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
        <p className="text-sm text-slate-400">
          {chapter != null ? `Lesson ${chapter} · ` : ''}{wordCount}개 단어 복습 완료
        </p>
        <Link to="/lesson-select" className="text-indigo-600 font-medium text-sm inline-block">돌아가기</Link>
      </div>
    );
  }

  const isReview = currentIndex < wordCount;
  const progressCurrent = isReview ? currentIndex + 1 : currentIndex - wordCount + 1;
  const progressTotal = isReview ? wordCount : queue.length - wordCount;
  const progressPct = (progressCurrent / progressTotal) * 100;

  return (
    <div className="space-y-4 pt-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold text-slate-800">
          {chapter != null ? `Lesson ${chapter} 복습` : '복습'}
        </h1>
        <span className="text-sm text-slate-400">
          {isReview
            ? `${progressCurrent} / ${progressTotal}`
            : `재복습 ${progressCurrent} / ${progressTotal}`}
        </span>
      </div>

      {saveError && (
        <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">저장 오류: {saveError}</p>
      )}

      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {showConj && conjWord ? (
        <ConjugationCards
          key={`conj-${currentIndex}`}
          word={conjWord}
          onDone={() => {
            setShowConj(false);
            setConjWord(null);
            setCurrentIndex(prev => prev + 1);
          }}
        />
      ) : (
        currentWord && <FlashCard key={currentIndex} word={currentWord} onGrade={handleGrade} />
      )}
    </div>
  );
}
