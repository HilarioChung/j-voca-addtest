import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GRAMMAR_CATEGORIES, GRAMMAR_CARDS, getStem, getKanjiStem } from '../lib/grammar-data';
import { speak } from '../lib/speech';
import { db } from '../lib/db';

const SpeakerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
    <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
  </svg>
);

function GrammarCard({ card, category, words, categoryId }) {
  const [flipped, setFlipped] = useState(false);
  const [word, setWord] = useState(null);

  const pickWord = useCallback(() => {
    if (words.length === 0) return;
    setWord(words[Math.floor(Math.random() * words.length)]);
  }, [words]);

  // Pick a random word on mount and when words change
  useEffect(() => { pickWord(); }, [pickWord]);

  function handleFlip() {
    if (!flipped) {
      pickWord(); // pick new word each time card is flipped to front→back
    }
    setFlipped(f => !f);
  }

  const example = word ? (() => {
    const stem = getStem(word, categoryId);
    const kanjiStem = getKanjiStem(word, categoryId);
    const conjugated = card.conjugate(stem);
    const kanjiConj = kanjiStem ? card.conjugate(kanjiStem) : null;
    const meaningConj = card.meaning(word.meaning);
    return { conjugated, kanjiConj, meaningConj };
  })() : null;

  return (
    <div
      onClick={handleFlip}
      className="cursor-pointer"
      style={{ perspective: '800px' }}
    >
      <div
        className={`relative w-full transition-transform duration-500 ${flipped ? 'grammar-card-flipped' : ''}`}
        style={{ transformStyle: 'preserve-3d', minHeight: '160px' }}
      >
        {/* Front - name only */}
        <div
          className={`absolute inset-0 rounded-2xl border ${category.color} flex flex-col items-center justify-center p-4`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className={`text-lg font-bold ${category.textColor}`}>{card.name}</p>
          <p className="text-xs text-slate-400 mt-1">{card.nameJp}</p>
        </div>

        {/* Back - conjugation + example */}
        <div
          className="absolute inset-0 rounded-2xl border border-slate-200 bg-white flex flex-col items-center justify-center p-4"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className={`text-2xl font-bold ${category.textColor}`}>{card.suffix}</p>
          <p className="text-sm text-slate-500 mt-1">{card.name}</p>

          {example && (
            <div className="mt-3 pt-3 border-t border-slate-100 w-full text-center">
              <div className="flex items-center justify-center gap-1.5">
                {example.kanjiConj ? (
                  <ruby className="text-base font-semibold text-slate-700 ruby-furigana">
                    {example.kanjiConj}
                    <rp>(</rp>
                    <rt className="text-[10px] font-normal text-indigo-500">{example.conjugated}</rt>
                    <rp>)</rp>
                  </ruby>
                ) : (
                  <span className="text-base font-semibold text-slate-700">{example.conjugated}</span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); speak(example.kanjiConj || example.conjugated); }}
                  className="text-slate-300 hover:text-indigo-500 transition-colors"
                  aria-label="발음 듣기"
                >
                  <SpeakerIcon />
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1">{example.meaningConj}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GrammarPractice() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [words, setWords] = useState([]);

  const category = GRAMMAR_CATEGORIES.find(c => c.id === categoryId);
  const cards = GRAMMAR_CARDS[categoryId];

  useEffect(() => {
    if (!category) return;
    db.words.toArray().then(all => setWords(all.filter(w => w.pos === category.pos)));
  }, [category]);

  if (!category || !cards) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">데이터가 없습니다</p>
        <button onClick={() => navigate('/grammar')} className="mt-4 text-indigo-500 text-sm">← 돌아가기</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => navigate('/grammar')} className="p-1 -ml-1 text-slate-400 hover:text-slate-600">
          <BackIcon />
        </button>
        <div>
          <h1 className={`text-lg font-bold ${category.textColor}`}>{category.title}</h1>
          <p className="text-xs text-slate-400">{category.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map(card => (
          <GrammarCard
            key={card.id}
            card={card}
            category={category}
            words={words}
            categoryId={categoryId}
          />
        ))}
      </div>
    </div>
  );
}
