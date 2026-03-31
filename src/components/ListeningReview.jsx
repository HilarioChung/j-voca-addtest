import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import { createListeningSession } from '../lib/listening';
import { calculateWeakWords } from '../lib/weak-utils';

const TIMER_OPTIONS = [10, 15, 20, 30, 45, 60]; // 분 단위 선택지

export default function ListeningReview() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('setup'); // 'setup' | 'playing' | 'finished'
  const [weakWords, setWeakWords] = useState([]);
  const [loading, setLoading] = useState(true);

  // 재생 중 상태
  const [currentWord, setCurrentWord] = useState(null);
  const [playPhase, setPlayPhase] = useState(null); // 'japanese_q', 'korean_q', 'waiting', 'japanese_a', 'korean_a', 'next'
  const [selectedMin, setSelectedMin] = useState(30);
  const [studyMode, setStudyMode] = useState('random');
  const [playDir, setPlayDir] = useState('jp2kr');
  const [remainingSec, setRemainingSecState] = useState(0);
  const sessionRef = useRef(null);
  const endTimeRef = useRef(null);

  // 취약 단어(오답 노트) 조회
  useEffect(() => {
    Promise.all([
      db.words.toArray(),
      db.reviews.toArray(),
      db.reviewLogs.toArray(),
    ]).then(([w, r, l]) => {
      const weak = calculateWeakWords(w, r, l).map(item => item.word);
      setWeakWords(weak);
      setLoading(false);
    });
  }, []);

  // 타이머 카운트다운
  useEffect(() => {
    if (phase !== 'playing') return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setRemainingSecState(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  const startSession = useCallback(() => {
    endTimeRef.current = Date.now() + selectedMin * 60 * 1000;
    setRemainingSecState(selectedMin * 60);
    setPhase('playing');

    sessionRef.current = createListeningSession(weakWords, selectedMin, studyMode, {
      onWordChange: (word, dir) => { setCurrentWord(word); setPlayDir(dir); },
      onPhaseChange: (p) => setPlayPhase(p),
      onFinish: () => setPhase('finished'),
    });
  }, [weakWords, selectedMin, studyMode]);

  const stopSession = useCallback(() => {
    sessionRef.current?.stop();
    setPhase('finished');
  }, []);

  // 언마운트 시 세션 정리
  useEffect(() => {
    return () => sessionRef.current?.stop();
  }, []);

  // 남은 시간 표시 포맷
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // phase별 안내 텍스트

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 취약 단어가 없는 경우
  if (weakWords.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">🎧</p>
        <p className="text-lg font-medium text-slate-700 mb-2">취약 단어가 없습니다</p>
        <p className="text-sm text-slate-400 mb-6">오답노트에 기록된 단어가 아직 없네요!</p>
        <button
          onClick={() => navigate('/lesson-select')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm"
        >
          돌아가기
        </button>
      </div>
    );
  }

  // 설정 화면 — 타이머 선택
  if (phase === 'setup') {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-slate-800">자전거 복습</h1>

        <div className="glass rounded-3xl p-6 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-2">취약 단어 (오답집중)</p>
          <p className="text-4xl font-bold text-slate-800 tracking-tight">{weakWords.length}<span className="text-lg text-slate-400 ml-1">개</span></p>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-600 mb-3 px-2">복습 시간 설정</p>
          <div className="grid grid-cols-3 gap-3">
            {TIMER_OPTIONS.map(min => (
              <button
                key={min}
                onClick={() => setSelectedMin(min)}
                className={`py-4 rounded-2xl text-sm font-bold transition-all ${
                  selectedMin === min
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                    : 'bg-white border border-slate-100 text-slate-500 shadow-sm hover:bg-slate-50'
                }`}
              >
                {min}분
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-600 mb-3 px-2">진행 방향</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'random', label: '🔀 랜덤' },
              { id: 'jp2kr', label: '🇯🇵 일본어먼저' },
              { id: 'kr2jp', label: '🇰🇷 한글먼저' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setStudyMode(mode.id)}
                className={`py-3 rounded-2xl text-xs font-bold transition-all ${
                  studyMode === mode.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                    : 'bg-white border border-slate-100 text-slate-500 shadow-sm hover:bg-slate-50'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-4 text-xs text-slate-500 space-y-2">
          <p className="flex items-center gap-2">
            <span className="text-base">🔊</span>{' '}
            {studyMode === 'kr2jp' ? '한국어 뜻 → 5초 대기 → 일본어 발음' : '일본어 발음 → 5초 대기 → 한국어 뜻'}
          </p>
          <p className="flex items-center gap-2"><span className="text-base">🔁</span> 설정한 시간 동안 무한 반복</p>
          <p className="flex items-center gap-2"><span className="text-base">📱</span> 화면 꺼짐 방지 자동 적용</p>
        </div>

        <button
          onClick={startSession}
          className="w-full py-5 bg-indigo-600 text-white rounded-3xl text-lg font-bold shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition-all mt-4"
        >
          시작하기
        </button>
      </div>
    );
  }

  // 재생 화면
  if (phase === 'playing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-md mx-auto">
        <div className="w-full glass rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-sm relative overflow-hidden" style={{ minHeight: '320px' }}>
          {/* 남은 시간 */}
          <div className="absolute top-6 right-6 text-xs font-medium text-slate-400 bg-white/50 px-3 py-1.5 rounded-full">
            {formatTime(remainingSec)}
          </div>

          {/* 현재 단어 표시 */}
          {currentWord ? (() => {
            const isAnswerPhase = (playPhase && playPhase.endsWith('_a')) || playPhase === 'next';
            const questionText = playDir === 'kr2jp' ? currentWord.meaning : currentWord.word;
            const answerMain = playDir === 'kr2jp' ? currentWord.word : currentWord.meaning;
            const waitingLabel = playDir === 'kr2jp' ? '일본어 발음을 뱉어보세요...' : '뜻을 떠올려 보세요...';

            return (
              <div className="text-center space-y-6 flex-1 flex flex-col justify-center w-full">
                <p className={`font-bold tracking-tight ${playDir === 'kr2jp' ? 'text-4xl text-indigo-700' : 'text-5xl text-slate-800'}`}>
                  {questionText}
                </p>
                
                <div className="h-20 flex flex-col justify-center items-center transition-opacity duration-500">
                  {isAnswerPhase ? (
                    <>
                      <p className={`font-bold mb-2 ${playDir === 'kr2jp' ? 'text-4xl text-emerald-600' : 'text-2xl text-indigo-600'}`}>
                        {answerMain}
                      </p>
                      {playDir === 'jp2kr' && currentWord.reading && currentWord.reading !== currentWord.word && (
                        <p className="text-sm font-medium text-slate-400">{currentWord.reading}</p>
                      )}
                      {playDir === 'kr2jp' && currentWord.reading && currentWord.reading !== answerMain && (
                        <p className="text-sm font-medium text-slate-400">{currentWord.reading}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm font-medium text-slate-400 opacity-50">
                      {playPhase === 'waiting' ? waitingLabel : '듣고 정답을 떠올리세요'}
                    </p>
                  )}
                </div>

              {/* 대기 시 카운트다운 인디케이터 */}
              <div className="h-6 flex justify-center items-center">
                {playPhase === 'waiting' && (
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            );
          })() : (
            <div className="flex-1 flex items-center justify-center">
               <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* 중지 버튼 */}
        <button
          onClick={stopSession}
          className="mt-8 px-8 py-4 bg-white text-rose-500 border border-rose-100 rounded-2xl text-sm font-bold shadow-sm hover:bg-rose-50 transition-colors"
        >
          ■ 복습 종료
        </button>
      </div>
    );
  }

  // 완료 화면
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
      <p className="text-5xl">✅</p>
      <p className="text-xl font-bold text-slate-800">복습 완료!</p>
      <p className="text-sm text-slate-500">{weakWords.length}개의 취약 단어를 집중 반복 훈련했습니다!</p>
      <button
        onClick={() => navigate('/lesson-select')}
        className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium"
      >
        홈으로
      </button>
    </div>
  );
}
