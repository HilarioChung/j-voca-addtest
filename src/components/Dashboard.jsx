import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/db';
import { getDueCount } from '../lib/review-utils';
import { calculateStats } from '../lib/stats';
import { calculateWeakWords } from '../lib/weak-utils';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
}

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

  const [showInstall, setShowInstall] = useState(() => !isStandalone() && !sessionStorage.getItem('hide-install'));

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
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex justify-between items-center pt-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">본's J-voca ⍺</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Smart Japanese Vocabulary</p>
        </div>
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        </div>
      </div>

      {hasUpdate && (
        <div className="glass border-emerald-100 bg-emerald-50/50 rounded-3xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-800">New Version Ready</p>
            <p className="text-xs text-emerald-600">Update now for the latest features</p>
          </div>
          <button
            onClick={async () => {
              const keys = await caches.keys();
              await Promise.all(keys.map(k => caches.delete(k)));
              window.location.reload();
            }}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-200"
          >
            Update
          </button>
        </div>
      )}

      {showInstall && (
        <div className="glass border-indigo-100 bg-indigo-50/50 rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 -mr-8 -mt-8 rounded-full" />
          <button
            onClick={() => { setShowInstall(false); sessionStorage.setItem('hide-install', '1'); }}
            className="absolute top-3 right-4 text-indigo-400 hover:text-indigo-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
          <div className="relative">
            <p className="text-sm font-bold text-indigo-800 mb-2">Install to Home Screen</p>
            <p className="text-xs text-indigo-600 leading-relaxed max-w-[90%]">
              Enjoy a full-screen experience and quick access from your home screen.
            </p>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-5">
        <div className="glass rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-slate-50 rounded-bl-3xl" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Words</p>
          <p className="text-4xl font-black text-slate-800">{words.length}</p>
        </div>
        
        <Link to="/lesson-select" className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 shadow-xl shadow-indigo-100 text-white relative group transition-transform active:scale-95">
          <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2">Due Today</p>
          <p className="text-4xl font-black">{dueCount}</p>
          {reconfirmCount > 0 && (
            <div className="mt-2 inline-flex items-center px-2 py-0.5 bg-white/20 rounded-lg text-[10px] font-bold">
              + {reconfirmCount} Re-confirm
            </div>
          )}
          <div className="absolute bottom-4 right-4 opacity-30 group-hover:translate-x-1 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Learning Insight Card */}
      {totalReviews > 0 && (
        <Link
          to="/stats"
          className="block glass bg-gradient-to-r from-violet-500/5 to-indigo-500/5 rounded-3xl p-6 border-indigo-50 relative group transition-all"
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-4">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Learning Insight</p>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-black text-slate-800">{streak} Days</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Current Streak</p>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div>
                  <p className="text-2xl font-black text-slate-800">{Math.round(overallAccuracy * 100)}%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Accuracy Rate</p>
                </div>
              </div>
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0017.25 3.75H6.75A2.25 2.25 0 004.5 6v12A2.25 2.25 0 006.75 20.25z" />
              </svg>
            </div>
          </div>
        </Link>
      )}

      {/* Weak Words Alert */}
      {weakCount > 0 && (
        <Link to="/weak-words" className="block bg-rose-50 border border-rose-100 rounded-3xl p-6 relative overflow-hidden group transition-all active:scale-[0.98]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/20 -mr-12 -mt-12 rounded-full" />
          <div className="flex justify-between items-center relative">
            <div>
              <p className="text-sm font-black text-rose-800">Critical Review Needed</p>
              <p className="text-xs text-rose-600 mt-1">Practice {weakCount} weak words to improve retention.</p>
            </div>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm font-black">
              {weakCount}
            </div>
          </div>
        </Link>
      )}

      {/* Progress Section */}
      {chapters.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mx-auto">Chapter Progress</h2>
          </div>
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
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>
          <p className="text-slate-800 font-bold text-xl mb-2">No Words Yet</p>
          <p className="text-slate-400 text-sm mb-8 px-12">Start your journey by adding words from your textbook.</p>
          <Link to="/input" className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:-translate-y-1 transition-all active:scale-95">
            Add First Words
          </Link>
        </div>
      )}
    </div>
  );
}
