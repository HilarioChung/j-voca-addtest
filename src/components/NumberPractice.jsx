import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { speak } from '../lib/speech';
import { generateRandomQuestion } from '../lib/number-generator';

export default function NumberPractice() {
  const navigate = useNavigate();
  const [currentWord, setCurrentWord] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [count, setCount] = useState(1);

  const generateNext = useCallback(() => {
    const nextQ = generateRandomQuestion();
    setCurrentWord(nextQ);
    setShowAnswer(false);
  }, []);

  useEffect(() => {
    generateNext();
  }, [generateNext]);

  const handleNext = () => {
    setCount(c => c + 1);
    generateNext();
  };

  const toggleAnswer = () => {
    if (!showAnswer && currentWord) {
      speak(currentWord.reading);
    }
    setShowAnswer(!showAnswer);
  };

  if (!currentWord) return null;

  return (
    <div className="space-y-6 max-w-md mx-auto h-[80vh] flex flex-col pt-4">
      <div className="flex justify-between items-center px-2">
        <button onClick={() => navigate('/words')} className="text-slate-400 font-medium text-sm">종료</button>
        <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          연습 {count}회차
        </div>
      </div>

      <div 
        onClick={toggleAnswer}
        className="flex-1 glass rounded-[40px] p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden transition-all active:scale-[0.98] cursor-pointer"
      >
        <div className="space-y-8 w-full">
          {/* Main Question */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-400">질문</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight break-keep">
              {currentWord.question}
            </h2>
          </div>

          {/* Answer Area */}
          <div className={`transition-all duration-500 transform ${showAnswer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="space-y-4 bg-white/40 p-6 rounded-3xl border border-white/50">
              <div>
                <ruby className="text-4xl font-bold text-indigo-600 mb-3 ruby-furigana break-keep">
                  {currentWord.kanji}
                  {currentWord.reading && currentWord.reading !== currentWord.kanji && (
                    <><rp>(</rp><rt className="text-base font-normal text-indigo-500">{currentWord.reading}</rt><rp>)</rp></>
                  )}
                </ruby>
                <p className="text-lg font-medium text-slate-600 mt-2">{currentWord.meaning || ''}</p>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); speak(currentWord.reading); }}
                className="mt-4 p-3 rounded-full bg-slate-50 text-slate-400 hover:text-indigo-500 hover:bg-white transition-all shadow-sm"
                aria-label="발음 듣기"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mx-auto">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                  <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                </svg>
              </button>
            </div>
          </div>

          {!showAnswer && (
            <p className="text-sm font-bold text-indigo-500 animate-pulse mt-8">화면을 터치해서 정답 확인</p>
          )}
        </div>
      </div>

      <div className="px-2">
        <button
          onClick={handleNext}
          disabled={!showAnswer}
          className={`w-full py-5 rounded-3xl text-lg font-bold transition-all shadow-lg ${
            showAnswer 
              ? 'bg-indigo-600 text-white shadow-indigo-200 hover:-translate-y-1' 
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          다음 문제
        </button>
      </div>
    </div>
  );
}
