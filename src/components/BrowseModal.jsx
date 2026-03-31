import { useState, useEffect } from 'react';
import FlashCard from './FlashCard';

export default function BrowseModal({ browse }) {
  const [studyMode, setStudyMode] = useState('random');
  const [cardDir, setCardDir] = useState('jp2kr');

  useEffect(() => {
    if (!browse.isOpen) return;
    if (studyMode === 'random') {
      setCardDir(Math.random() > 0.5 ? 'jp2kr' : 'kr2jp');
    } else {
      setCardDir(studyMode);
    }
  }, [browse.browseIndex, studyMode, browse.isOpen]);

  if (!browse.isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-hidden touch-none"
      onClick={browse.close}
    >
      <div className="bg-slate-50 rounded-2xl p-6 w-full max-w-lg space-y-6 mt-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-400">{browse.browseIndex + 1} / {browse.browseQueue.length}</span>
            <select
              value={studyMode}
              onChange={(e) => setStudyMode(e.target.value)}
              className="text-xs font-medium bg-white border border-slate-200 text-slate-600 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm"
            >
              <option value="random">🔀 랜덤</option>
              <option value="jp2kr">🇯🇵 일본어먼저</option>
              <option value="kr2jp">🇰🇷 한글먼저</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            {browse.listening ? (
              <button onClick={browse.stopListening} className="text-emerald-500 text-sm font-bold">■ 정지</button>
            ) : (
              <button onClick={() => browse.startListening(browse.browseQueue, browse.browseIndex)} className="text-emerald-500 text-sm font-bold">▶ 듣기</button>
            )}
            <button onClick={browse.close} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
          </div>
        </div>
        <FlashCard
          key={browse.currentWord.id}
          word={browse.currentWord}
          direction={cardDir}
          onPrev={browse.prev}
          onNext={browse.next}
        />
      </div>
    </div>
  );
}
