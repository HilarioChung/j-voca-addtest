import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/db';
import { getDueCount } from '../lib/review-utils';
import { calculateStats } from '../lib/stats';
import { calculateWeakWords } from '../lib/weak-utils';
import { getLocalDateString } from '../lib/date-utils';

export default function Dashboard() {
  const [words, setWords] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewLogs, setReviewLogs] = useState([]);

  const loadData = useCallback(async () => {
    const [w, r, l] = await Promise.all([
      db.words.toArray(),
      db.reviews.toArray(),
      db.reviewLogs.toArray(),
    ]);
    setWords(w);
    setReviews(r);
    setReviewLogs(l);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const [hasUpdate, setHasUpdate] = useState(() => !!window.__HAS_UPDATE__);
  useEffect(() => {
    const handler = () => setHasUpdate(true);
    window.addEventListener('version-updated', handler);
    return () => window.removeEventListener('version-updated', handler);
  }, []);

  const { total: dueCount, reconfirm: reconfirmCount } = useMemo(() => getDueCount(words, reviews), [words, reviews]);
  const { streak, totalReviews, overallAccuracy } = useMemo(() => calculateStats(reviewLogs), [reviewLogs]);
  const weakCount = useMemo(() => calculateWeakWords(words, reviews, reviewLogs).length, [words, reviews, reviewLogs]);

  const chapters = useMemo(() => {
    const chapterMap = {};
    for (const w of words) {
      if (!chapterMap[w.chapter]) chapterMap[w.chapter] = { total: 0, reviewed: 0 };
      chapterMap[w.chapter].total++;
    }
    const wordById = new Map(words.map(w => [w.id, w]));
    for (const r of reviews) {
      const word = wordById.get(r.wordId);
      if (word && chapterMap[word.chapter] && r.reps > 0) {
        chapterMap[word.chapter].reviewed++;
      }
    }
    const result = [];
    for (const [ch, data] of Object.entries(chapterMap)) {
      result.push({ chapter: Number(ch), ...data });
    }
    result.sort((a, b) => a.chapter - b.chapter);
    return result;
  }, [words, reviews]);

  return (
    <div className="space-y-8 pb-12 pt-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">본's J-voca ⍺</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">똑똑한 일본어 단어장</p>
        </div>
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        </div>
      </div>

      {hasUpdate && (
        <div className="glass border-emerald-100 bg-emerald-50/50 rounded-3xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-800">새 버전 준비됨</p>
            <p className="text-xs text-emerald-600">최신 기능을 위해 업데이트하세요</p>
          </div>
          <button
            onClick={async () => {
              const keys = await caches.keys();
              await Promise.all(keys.map(k => caches.delete(k)));
              window.location.reload();
            }}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
          >
            업데이트
          </button>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-5">
        <div className="glass rounded-3xl p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">전체 단어</p>
          <p className="text-4xl font-black text-slate-800">{words.length}</p>
        </div>
        
        <Link to="/lesson-select" className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 shadow-xl shadow-indigo-100 text-white relative group active:scale-95 transition-all">
          <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2">오늘 복습</p>
          <p className="text-4xl font-black">{dueCount}</p>
          {reconfirmCount > 0 && (
            <div className="mt-2 inline-flex items-center px-2 py-0.5 bg-white/20 rounded-lg text-[10px] font-bold">
              + {reconfirmCount} 재확인
            </div>
          )}
        </Link>
      </div>

      {/* Stats Insight */}
      {totalReviews > 0 && (
        <Link
          to="/stats"
          className="block glass bg-gradient-to-r from-violet-500/5 to-indigo-500/5 rounded-3xl p-6 border-indigo-50 relative group transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">학습 통계</p>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-black text-slate-800">{streak}일</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">연속 학습</p>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div>
                  <p className="text-2xl font-black text-slate-800">{Math.round(overallAccuracy * 100)}%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">평균 정확도</p>
                </div>
              </div>
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0017.25 3.75H6.75A2.25 2.25 0 004.5 6v12A2.25 2.25 0 006.75 20.25z" />
              </svg>
            </div>
          </div>
        </Link>
      )}

      {weakCount > 0 && (
        <Link to="/weak-words" className="block bg-rose-50 border border-rose-100 rounded-3xl p-6 relative active:scale-[0.98] transition-all">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-black text-rose-800">오답노트 확인</p>
              <p className="text-xs text-rose-600 mt-1">{weakCount}개의 취약 단어가 있습니다.</p>
            </div>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm font-black">
              {weakCount}
            </div>
          </div>
        </Link>
      )}

      {/* Number Practice Link */}
      <Link to="/number-practice" className="block bg-slate-50 border border-slate-200 rounded-3xl p-6 relative active:scale-[0.98] transition-all">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-black text-slate-800">숫자/날짜 연습</p>
            <p className="text-xs text-slate-500 mt-1">헷갈리는 숫자 읽기를 랜덤으로 연습하세요.</p>
          </div>
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm font-black text-xl">
            🔢
          </div>
        </div>
      </Link>

      {/* Progress Section */}
      {chapters.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">레슨별 진행률</h2>
          <div className="grid gap-4">
            {chapters.map(ch => {
              const pct = ch.total > 0 ? Math.round((ch.reviewed / ch.total) * 100) : 0;
              return (
                <div key={ch.chapter} className="glass rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-black text-slate-700">Lesson {ch.chapter}</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                      {ch.reviewed} / {ch.total}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {words.length === 0 && (
        <div className="glass rounded-3xl py-16 text-center">
          <p className="text-slate-800 font-bold text-xl mb-2">단어가 없습니다</p>
          <p className="text-slate-400 text-sm mb-8 px-12">교재 사진을 찍어 단어를 추가해보세요.</p>
          <Link to="/input" className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold">
            단어 추가하기
          </Link>
        </div>
      )}
    </div>
  );
}
