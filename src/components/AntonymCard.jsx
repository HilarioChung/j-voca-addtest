import { speak } from '../lib/speech';

function SpeakerButton({ text }) {
  return (
    <button
      onClick={() => speak(text)}
      className="ml-2 text-slate-300 hover:text-indigo-500 transition-colors inline-flex items-center"
      aria-label="발음 듣기"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M10.5 3.75a.75.75 0 00-1.264-.546L5.203 7H2.667a.75.75 0 00-.7.48A6.985 6.985 0 001.5 10c0 .887.165 1.734.468 2.52.111.29.39.48.7.48h2.535l4.033 3.796A.75.75 0 0010.5 16.25V3.75zM14.325 4.317a.75.75 0 011.061 0 8.25 8.25 0 010 11.668.75.75 0 01-1.06-1.06 6.75 6.75 0 000-9.548.75.75 0 010-1.06z" />
      </svg>
    </button>
  );
}

export default function AntonymCard({ word, onDone }) {
  if (!word || !word.antonym) {
    onDone();
    return null;
  }

  const antonymText = word.antonym;
  const antonymReading = word.antonymReading || '';
  const antonymMeaning = word.antonymMeaning || '';
  const wordDisplay = word.kanji || word.reading || word.word;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="card-step w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
            반의어 찾기
          </span>
          <span className="text-sm font-bold text-slate-700">{wordDisplay}</span>
          <span className="text-xs text-slate-400">({word.meaning})</span>
        </div>

        <p className="text-sm text-slate-400 mb-2">반댓말</p>

        <div className="flex flex-col items-center justify-center p-4">
          <ruby className="text-4xl font-bold text-slate-800 mb-3 ruby-furigana">
            {antonymText}
            {antonymReading && antonymReading !== antonymText && (
              <><rp>(</rp><rt className="text-base font-normal text-indigo-500">{antonymReading}</rt><rp>)</rp></>
            )}
          </ruby>

          <p className="text-xl text-slate-600 font-semibold mb-4">{antonymMeaning}</p>

          <button
            onClick={() => speak(antonymReading || antonymText)}
            className="p-3 rounded-full bg-slate-50 text-slate-400 hover:text-indigo-500 hover:bg-white transition-all shadow-sm"
            aria-label="발음 듣기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
              <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
            </svg>
          </button>
        </div>
      </div>

      <button
        onClick={onDone}
        className="w-full py-4 bg-indigo-600 text-white rounded-xl text-sm font-medium active:scale-95 transition-transform shadow-md"
      >
        다음 단어
      </button>
    </div>
  );
}
