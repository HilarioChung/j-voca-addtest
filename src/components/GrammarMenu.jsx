import { useNavigate } from 'react-router-dom';
import { GRAMMAR_CATEGORIES, GRAMMAR_CARDS } from '../lib/grammar-data';

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
  </svg>
);

export default function GrammarMenu() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-1">문법</h1>
      <p className="text-sm text-slate-400 mb-6">품사별 활용 변형을 카드로 학습</p>

      <div className="flex flex-col gap-3">
        {GRAMMAR_CATEGORIES.map((cat) => {
          const cards = GRAMMAR_CARDS[cat.id] || [];

          return (
            <button
              key={cat.id}
              onClick={() => navigate(`/grammar/${cat.id}`)}
              className={`w-full text-left p-4 rounded-2xl border ${cat.color} transition-all active:scale-[0.98]`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-lg font-bold ${cat.textColor}`}>{cat.title}</span>
                    <span className="text-sm text-slate-400">{cat.subtitle}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 text-slate-400 mt-2 inline-block">
                    {cards.length}개 변형
                  </span>
                </div>
                <span className="text-slate-300">
                  <ChevronRight />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
