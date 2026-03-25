import { useState } from 'react';
import { speak } from '../lib/speech';
import { conjugate, canConjugate } from '../lib/conjugation';

function SpeakerButton({ text }) {
  return (
    <button
      onClick={() => speak(text)}
      className="ml-2 text-slate-300 hover:text-indigo-500 transition-colors inline-flex items-center"
      aria-label="발음 듣기"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M10.5 3.75a.75.75 0 00-1.264-.546L5.203 7H2.667a.75.75 0 00-.7.48A6.985 6.985 0 001.5 10c0 .887.165 1.734.468 2.52.111.29.39.48.7.48h2.535l4.033 3.796A.75.75 0 0010.5 16.25V3.75zM14.325 4.317a.75.75 0 011.061 0 8.25 8.25 0 010 11.668.75.75 0 01-1.06-1.06 6.75 6.75 0 000-9.548.75.75 0 010-1.06z" />
      </svg>
    </button>
  );
}

function ConjRow({ item }) {
  return (
    <div className="flex items-start justify-between py-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
        <p className="text-base font-medium text-slate-800 flex items-center">
          {item.sentence}
          <SpeakerButton text={item.reading} />
        </p>
        <p className="text-xs text-slate-400">{item.reading}</p>
      </div>
    </div>
  );
}

/**
 * 활용 카드: 등급 선택 후, い형용사/な형용사/명사일 때 표시
 * 카드 1: 평서형 + 부정형
 * 카드 2: 과거형 + 과거부정형
 * onDone 호출 시 다음 단어로 진행
 */
export default function ConjugationCards({ word, onDone }) {
  const [page, setPage] = useState(0);

  if (!canConjugate(word.pos)) {
    onDone();
    return null;
  }

  const conj = conjugate(word);
  if (!conj) {
    onDone();
    return null;
  }

  const pages = [
    { items: [conj.present, conj.negative], title: '평서형 · 부정형' },
    { items: [conj.past, conj.pastNegative], title: '과거형 · 과거부정형' },
  ];

  const current = pages[page];
  const isLast = page >= pages.length - 1;
  const display = word.kanji || word.reading;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        key={page}
        className="card-step w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
            활용 연습
          </span>
          <span className="text-sm font-bold text-slate-700">{display}</span>
          <span className="text-xs text-slate-400">{word.meaning}</span>
        </div>

        <p className="text-xs text-slate-400 mb-2">{current.title}</p>

        <div className="divide-y divide-slate-100">
          {current.items.map((item) => (
            <ConjRow key={item.label} item={item} />
          ))}
        </div>
      </div>

      {/* 페이지 인디케이터 */}
      <div className="flex gap-1.5 justify-center">
        {pages.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i <= page ? 'w-5 bg-indigo-500' : 'w-2 bg-slate-200'
            }`}
          />
        ))}
      </div>

      <button
        onClick={() => {
          if (isLast) {
            onDone();
          } else {
            setPage(p => p + 1);
          }
        }}
        className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium active:scale-95 transition-transform"
      >
        {isLast ? '다음 단어' : '다음'}
      </button>
    </div>
  );
}
