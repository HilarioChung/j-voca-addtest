import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/db';
import { getDueCount, getDueCountByLesson } from '../lib/review-utils';

export default function LessonSelect() {
  const [words, setWords] = useState([]);
  const [reviews, setReviews] = useState([]);

  const loadData = useCallback(async () => {
    const [w, r] = await Promise.all([
      db.words.toArray(),
      db.reviews.toArray(),
    ]);
    setWords(w);
    setReviews(r);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const { total: totalDue, reconfirm: totalReconfirm } = getDueCount(words, reviews);
  const byLesson = getDueCountByLesson(words, reviews);

  // 전체 lesson 목록 (due 없는 lesson도 포함)
  const chapters = [...new Set(words.map(w => w.chapter))].sort((a, b) => a - b);

  if (words.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-medium text-slate-800">단어가 없습니다</p>
        <Link to="/input" className="text-indigo-600 font-medium text-sm mt-4 inline-block">
          단어 추가하기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">복습</h1>

      {/* 전체 복습 */}
      <Link
        to="/review"
        className={`block rounded-2xl p-4 shadow-sm ${
          totalDue > 0
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-100 text-slate-400 pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-70">전체 복습</p>
            <p className="text-2xl font-bold">{totalDue}개</p>
            {totalReconfirm > 0 && (
              <p className="text-xs opacity-70 mt-0.5">재확인 {totalReconfirm}</p>
            )}
          </div>
          {totalDue > 0 && <span className="text-2xl opacity-70">→</span>}
        </div>
      </Link>

      {/* lesson별 복습 */}
      <div className="space-y-2">
        {chapters.map(ch => {
          const counts = byLesson[ch] || { total: 0, reconfirm: 0 };
          const hasDue = counts.total > 0;
          return (
            <Link
              key={ch}
              to={hasDue ? `/review?lesson=${ch}` : '#'}
              className={`block rounded-xl p-4 border ${
                hasDue
                  ? 'bg-white border-slate-200 shadow-sm'
                  : 'bg-slate-50 border-slate-100 pointer-events-none'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-medium ${hasDue ? 'text-slate-800' : 'text-slate-400'}`}>
                  Lesson {ch}
                </span>
                <div className="text-right">
                  <span className={`font-bold ${hasDue ? 'text-indigo-600' : 'text-slate-300'}`}>
                    {counts.total}개
                  </span>
                  {counts.reconfirm > 0 && (
                    <p className="text-xs text-slate-400">재확인 {counts.reconfirm}</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {totalDue === 0 && (
        <p className="text-center text-sm text-slate-400 py-4">복습할 단어가 없습니다</p>
      )}
    </div>
  );
}
