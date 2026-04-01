import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import { speak } from '../lib/speech';

export default function NumberPractice() {
  const navigate = useNavigate();
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.words.toArray().then(data => {
      const filtered = data.filter(w => w.pos === '숫자/수사');
      // Shuffle the words
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      setWords(shuffled);
      setLoading(false);
    });
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // End session or loop
      navigate('/lesson-select');
    }
  }, [currentIndex, words.length, navigate]);

  const toggleAnswer = () => {
    if (!showAnswer) {
      // Speak when showing answer
      const word = words[currentIndex];
      speak(word.word);
    }
    setShowAnswer(!showAnswer);
  };

  const speakExample = (e) => {
    e.stopPropagation();
    const word = words[currentIndex];
    if (word.example) {
      speak(word.example);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-medium text-slate-800">연습할 숫자 단어가 없습니다</p>
        <button onClick={() => navigate('/lesson-select')} className="mt-4 text-indigo-600 font-medium">돌아가기</button>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div className="space-y-6 max-w-md mx-auto h-[80vh] flex flex-col pt-4">
      <div className="flex justify-between items-center px-2">
        <button onClick={() => navigate('/lesson-select')} className="text-slate-400 font-medium text-sm">취소</button>
        <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {currentIndex + 1} / {words.length}
        </div>
      </div>

      <div 
        onClick={toggleAnswer}
        className="flex-1 glass rounded-[40px] p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden transition-all active:scale-[0.98] cursor-pointer"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 opacity-20">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>

        <div className="space-y-8 w-full">
          {/* Main Question */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-400">학습할 숫자/기수</p>
            <h2 className="text-6xl font-black text-slate-800 tracking-tight">
              {currentWord.kanji || currentWord.word}
            </h2>
          </div>

          {/* Answer Area */}
          <div className={`transition-all duration-500 transform ${showAnswer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="space-y-4 bg-white/40 p-6 rounded-3xl border border-white/50">
              <div>
                <p className="text-3xl font-bold text-indigo-600 mb-1">{currentWord.word}</p>
                <p className="text-lg font-medium text-slate-600">{currentWord.meaning}</p>
              </div>

              {currentWord.example && (
                <div 
                  onClick={speakExample}
                  className="mt-6 p-4 bg-white/60 rounded-2xl border border-indigo-50 text-left relative group active:bg-indigo-50 transition-colors"
                >
                  <p className="text-xs font-bold text-indigo-400 mb-2 flex items-center gap-1">
                    📖 예문 <span className="text-[10px] bg-indigo-100 text-indigo-500 px-1.5 py-0.5 rounded-md font-black">CLICK TO HEAR</span>
                  </p>
                  <p className="text-base text-slate-800 font-medium leading-relaxed mb-1">
                    {currentWord.example}
                  </p>
                  {currentWord.exampleReading && (
                    <p className="text-xs text-slate-400 italic">
                      {currentWord.exampleReading}
                    </p>
                  )}
                  <div className="absolute right-3 top-3 text-indigo-300 group-active:text-indigo-500">🔊</div>
                </div>
              )}
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
          {currentIndex === words.length - 1 ? '연습 종료' : '다음 문제'}
        </button>
      </div>
    </div>
  );
}
