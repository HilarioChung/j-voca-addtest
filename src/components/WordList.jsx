import { useState, useEffect, useRef, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, syncWordsFromData, deleteReview } from '../lib/db';
import { hasGithubToken, updateWordInRepo, deleteWordFromRepo, deleteChapterFromRepo } from '../lib/github';
import FlashCard from './FlashCard';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speak(text) {
  return new Promise(resolve => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = 0.8;
    u.onend = resolve;
    u.onerror = resolve;
    speechSynthesis.speak(u);
  });
}

export default function WordList() {
  const words = useLiveQuery(() => db.words.toArray(), [], []);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [browseIndex, setBrowseIndex] = useState(null);
  const [browseQueue, setBrowseQueue] = useState([]);
  const [listening, setListening] = useState(false);
  const listeningRef = useRef(false);
  const wakeLockRef = useRef(null);

  const chapters = [...new Set(words.map(w => w.chapter))].sort((a, b) => a - b);
  const filtered = selectedChapter !== null
    ? words.filter(w => w.chapter === selectedChapter)
    : words;

  const canEdit = hasGithubToken();

  function openBrowse() {
    setBrowseQueue(shuffle(filtered));
    setBrowseIndex(0);
  }

  function closeBrowse() {
    stopListening();
    setBrowseIndex(null);
    setBrowseQueue([]);
  }

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    setListening(false);
    speechSynthesis.cancel();
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  }, []);

  const startListening = useCallback(async (queue, startIdx) => {
    listeningRef.current = true;
    setListening(true);
    try {
      if (navigator.wakeLock) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch {}

    for (let i = startIdx; i < queue.length; i++) {
      if (!listeningRef.current) return;
      setBrowseIndex(i);
      await speak(queue[i].word);
      if (!listeningRef.current) return;
      await new Promise(r => setTimeout(r, 3000));
    }
    stopListening();
  }, [stopListening]);

  useEffect(() => {
    if (browseIndex !== null) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [browseIndex !== null]);

  useEffect(() => {
    return () => { stopListening(); };
  }, [stopListening]);

  function startEdit(word) {
    setEditingId(word.id);
    setEditForm({ word: word.word, reading: word.reading, meaning: word.meaning });
  }

  async function saveEdit(id) {
    setSaving(true);
    try {
      const data = await updateWordInRepo(id, editForm);
      await syncWordsFromData(data.words);
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('삭제하시겠습니까?')) return;
    setSaving(true);
    try {
      const data = await deleteWordFromRepo(id);
      await syncWordsFromData(data.words);
      await deleteReview(id);
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  }

  async function handleDeleteChapter() {
    if (selectedChapter === null) return;
    const count = filtered.length;
    if (!confirm(`Lesson ${selectedChapter}의 단어 ${count}개를 모두 삭제하시겠습니까?`)) return;
    setSaving(true);
    try {
      const { data, deletedIds } = await deleteChapterFromRepo(selectedChapter);
      await syncWordsFromData(data.words);
      for (const id of deletedIds) await deleteReview(id);
      setSelectedChapter(null);
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">단어 목록</h1>

      {chapters.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => { setSelectedChapter(null); closeBrowse(); }}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              selectedChapter === null ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            전체 ({words.length})
          </button>
          {chapters.map(ch => (
            <button
              key={ch}
              onClick={() => { setSelectedChapter(ch); closeBrowse(); }}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                selectedChapter === ch ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Lesson {ch} ({words.filter(w => w.chapter === ch).length})
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={openBrowse}
            className="flex-1 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-600 font-medium"
          >
            플래시카드 ({filtered.length}개)
          </button>
          <button
            onClick={() => { const q = shuffle(filtered); setBrowseQueue(q); setBrowseIndex(0); startListening(q, 0); }}
            className="flex-1 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-600 font-medium"
          >
            듣기 모드
          </button>
        </div>
      )}

      {browseIndex !== null && browseQueue.length > 0 && browseIndex < browseQueue.length && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-hidden touch-none"
          onClick={closeBrowse}
        >
          <div className="bg-slate-50 rounded-2xl p-4 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">{browseIndex + 1} / {browseQueue.length}</span>
              <div className="flex items-center gap-3">
                {listening ? (
                  <button onClick={stopListening} className="text-emerald-500 text-sm font-medium">■ 정지</button>
                ) : (
                  <button onClick={() => startListening(browseQueue, browseIndex)} className="text-emerald-500 text-sm font-medium">▶ 듣기</button>
                )}
                <button onClick={closeBrowse} className="text-slate-400 text-lg">&times;</button>
              </div>
            </div>
            <FlashCard
              key={browseQueue[browseIndex].id}
              word={browseQueue[browseIndex]}
              onPrev={browseIndex > 0 ? () => { stopListening(); setBrowseIndex(browseIndex - 1); } : null}
              onNext={browseIndex < browseQueue.length - 1 ? () => { stopListening(); setBrowseIndex(browseIndex + 1); } : null}
            />
          </div>
        </div>
      )}

      {canEdit && selectedChapter !== null && filtered.length > 0 && (
        <button
          onClick={handleDeleteChapter}
          disabled={saving}
          className="w-full py-2 border border-red-200 rounded-xl text-sm text-red-500"
        >
          {saving ? '삭제 중...' : `Lesson ${selectedChapter} 전체 삭제 (${filtered.length}개)`}
        </button>
      )}

      {filtered.length === 0 ? (
        <p className="text-center py-12 text-slate-400">단어가 없습니다</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(w => (
            <div key={w.id} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
              {editingId === w.id ? (
                <div className="space-y-2">
                  <input
                    value={editForm.word}
                    onChange={e => setEditForm(f => ({ ...f, word: e.target.value }))}
                    className="w-full px-2 py-1 border border-slate-200 rounded-lg text-sm"
                  />
                  <input
                    value={editForm.reading}
                    onChange={e => setEditForm(f => ({ ...f, reading: e.target.value }))}
                    className="w-full px-2 py-1 border border-slate-200 rounded-lg text-sm"
                  />
                  <input
                    value={editForm.meaning}
                    onChange={e => setEditForm(f => ({ ...f, meaning: e.target.value }))}
                    className="w-full px-2 py-1 border border-slate-200 rounded-lg text-sm"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="text-xs text-slate-400" disabled={saving}>취소</button>
                    <button onClick={() => saveEdit(w.id)} className="text-xs text-indigo-600 font-medium" disabled={saving}>
                      {saving ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-slate-800">{w.word}</span>
                    <span className="text-slate-400 text-sm ml-2">{w.reading}</span>
                    <p className="text-sm text-slate-500">{w.meaning}</p>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => startEdit(w)} className="text-slate-400">수정</button>
                      <button onClick={() => handleDelete(w.id)} className="text-red-400">삭제</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
