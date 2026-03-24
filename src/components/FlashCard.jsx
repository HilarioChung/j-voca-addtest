import { useState } from 'react';
import { speak } from '../lib/speech';

const SpeakerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
    <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
  </svg>
);

const POS_STYLE = {
  'い형용사': 'bg-sky-100 text-sky-700',
  'な형용사': 'bg-violet-100 text-violet-700',
  '명사': 'bg-slate-100 text-slate-600',
  '동사': 'bg-emerald-100 text-emerald-700',
  '부사': 'bg-amber-100 text-amber-700',
  '인사·표현': 'bg-rose-50 text-rose-500',
};

function PosBadge({ pos }) {
  const style = POS_STYLE[pos] || 'bg-slate-100 text-slate-500';
  return (
    <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${style}`}>
      {pos}
    </span>
  );
}

function StepIndicator({ current, total }) {
  return (
    <div className="flex gap-1.5 justify-center mt-4">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i <= current ? 'w-5 bg-indigo-500' : 'w-2 bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function FlashCard({ word, onGrade, onPrev, onNext }) {
  const [step, setStep] = useState(0);
  const browseMode = !onGrade;
  const hasKanji = !!word.kanji;

  // kanji words: 0(reading) → 1(kanji) → 2(answer)
  // non-kanji:  0(reading) → 1(answer)
  const maxStep = hasKanji ? 2 : 1;
  const isAnswerStep = step >= maxStep;

  function handleTap() {
    if (step < maxStep) setStep(s => s + 1);
  }

  function handleGrade(grade) {
    setStep(0);
    onGrade(grade);
  }

  function handleNav(fn) {
    setStep(0);
    fn();
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="w-full cursor-pointer"
        style={{ minHeight: '260px' }}
        onClick={handleTap}
      >
        <div
          key={step}
          className="card-step bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center p-6"
          style={{ minHeight: '260px' }}
        >
          {step === 0 && (
            <>
              <p className="text-4xl font-bold text-slate-800 mb-2">{word.reading}</p>
              <p className="text-sm text-slate-400">
                {hasKanji ? '탭하여 한자 보기' : '탭하여 뜻 보기'}
              </p>
            </>
          )}

          {step === 1 && hasKanji && (
            <>
              <ruby className="text-4xl font-bold text-slate-800 mb-3 ruby-furigana">
                {word.kanji}
                <rp>(</rp><rt className="text-base font-normal text-indigo-500">{word.reading}</rt><rp>)</rp>
              </ruby>
              <button
                onClick={(e) => { e.stopPropagation(); speak(word.reading); }}
                className="text-slate-400 hover:text-indigo-500 transition-colors mb-2 mt-3"
                aria-label="발음 듣기"
              >
                <SpeakerIcon />
              </button>
              <p className="text-sm text-slate-400 mt-1">탭하여 뜻 보기</p>
            </>
          )}

          {isAnswerStep && (
            <>
              {hasKanji ? (
                <ruby className="text-3xl font-bold text-slate-800 mb-2 ruby-furigana">
                  {word.kanji}
                  <rp>(</rp><rt className="text-sm font-normal text-indigo-500">{word.reading}</rt><rp>)</rp>
                </ruby>
              ) : (
                <p className="text-3xl font-bold text-slate-800 mb-2">{word.word}</p>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); speak(word.reading || word.word); }}
                className="text-slate-400 hover:text-indigo-500 transition-colors mb-3 mt-2"
                aria-label="발음 듣기"
              >
                <SpeakerIcon />
              </button>
              <p className="text-xl text-slate-700 font-medium">{word.meaning}</p>
              {word.pos && <PosBadge pos={word.pos} />}
            </>
          )}
        </div>

        <StepIndicator current={step} total={maxStep + 1} />
      </div>

      {isAnswerStep && !browseMode && (
        <div className="grid grid-cols-3 gap-2 w-full">
          {[
            { grade: 'again', label: '모름', color: 'bg-red-500' },
            { grade: 'hard', label: '애매', color: 'bg-orange-400' },
            { grade: 'good', label: '앎', color: 'bg-green-500' },
          ].map(({ grade, label, color }) => (
            <button
              key={grade}
              onClick={() => handleGrade(grade)}
              className={`${color} text-white py-3.5 rounded-xl text-sm font-medium active:scale-95 active:brightness-90 transition-transform`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {browseMode && (
        <div className="flex gap-3 w-full">
          <button
            onClick={() => handleNav(onPrev)}
            disabled={!onPrev}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-sm text-slate-600 disabled:opacity-30"
          >
            ← 이전
          </button>
          <button
            onClick={() => handleNav(onNext)}
            disabled={!onNext}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-sm text-slate-600 disabled:opacity-30"
          >
            다음 →
          </button>
        </div>
      )}
    </div>
  );
}
