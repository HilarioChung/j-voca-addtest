import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, syncWordsFromData, deleteReview } from '../lib/db';
import { hasGithubToken, updateWordInRepo, deleteWordFromRepo, deleteChapterFromRepo } from '../lib/github';
import { filterWords } from '../lib/word-utils';
import { getStep, getSteps, getChapters, formatLesson, ALL_STEPS, resolveStepFilter } from '../lib/lesson-utils';
import BrowseModal from './BrowseModal';
import { useBrowseMode } from '../hooks/useBrowseMode';

export default function WordList() {
  const words = useLiveQuery(() => db.words.toArray(), [], []);
  const [selectedStep, setSelectedStep] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const browse = useBrowseMode();

  const steps = getSteps(words);
  const currentStep = resolveStepFilter(selectedStep, words);
  const isAllSteps = currentStep == null;
  const chapters = getChapters(words, currentStep).filter(ch => ch > 0);

  const countByChapter = useMemo(() => {
    const map = {};
    if (currentStep == null) return map;
    for (const w of words) {
      if (getStep(w) !== currentStep) continue;
      map[w.chapter] = (map[w.chapter] || 0) + 1;
    }
    return map;
  }, [words, currentStep]);

  const stepWordCount = Object.values(countByChapter).reduce((sum, n) => sum + n, 0);
  const lessonWordCount = selectedChapter !== null ? (countByChapter[selectedChapter] || 0) : 0;
  const filtered = filterWords(words, currentStep, isAllSteps ? null : selectedChapter, searchQuery);

  const canEdit = hasGithubToken();

  function startEdit(word) {
    setEditingId(word.id);
    setEditForm({ word: word.word, kanji: word.kanji, reading: word.reading, meaning: word.meaning });
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
    if (selectedChapter === null || currentStep === null) return;
    const count = lessonWordCount;
    if (!confirm(`Step ${currentStep} Lesson ${selectedChapter}의 단어 ${count}개를 모두 삭제하시겠습니까?`)) return;
    setSaving(true);
    try {
      const { data, deletedIds } = await deleteChapterFromRepo(currentStep, selectedChapter);
      await syncWordsFromData(data.words);
      for (const id of deletedIds) await deleteReview(id);
      setSelectedChapter(null);
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  }

  function selectStep(step) {
    setSelectedStep(step);
    setSelectedChapter(null);
    browse.close();
  }

  function selectChapter(ch) {
    setSelectedChapter(ch);
    browse.close();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">단어 목록</h1>
        <Link 
          to="/number-practice" 
          className="text-sm px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-medium border border-indigo-100 shadow-sm"
        >
          숫자/날짜 연습
        </Link>
      </div>

      {/* 검색 입력 */}
      <input
        type="text"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="단어, 읽기, 뜻 검색..."
        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
      />

      {/* Step 선택 칩 (Step이 2개 이상일 때) */}
      {steps.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => selectStep(ALL_STEPS)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              isAllSteps ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            전체 Step ({words.length})
          </button>
          {steps.map(step => (
            <button
              key={step}
              onClick={() => selectStep(step)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                currentStep === step ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Step {step}
            </button>
          ))}
        </div>
      )}

      {/* Chapter 선택 칩 */}
      {!isAllSteps && chapters.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => selectChapter(null)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              selectedChapter === null ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            전체 ({stepWordCount})
          </button>
          {chapters.map(ch => (
            <button
              key={ch}
              onClick={() => selectChapter(ch)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                selectedChapter === ch ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Lesson {ch} ({countByChapter[ch] || 0})
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => browse.open(filtered)}
            className="flex-1 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-600 font-medium"
          >
            플래시카드 ({filtered.length}개)
          </button>
          <button
            onClick={() => browse.openWithListening(filtered)}
            className="flex-1 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-600 font-medium"
          >
            듣기 모드
          </button>
        </div>
      )}

      <BrowseModal browse={browse} />

      {canEdit && !isAllSteps && selectedChapter !== null && filtered.length > 0 && (
        <button
          onClick={handleDeleteChapter}
          disabled={saving}
          className="w-full py-2 border border-red-200 rounded-xl text-sm text-red-500"
        >
          {saving ? '삭제 중...' : `Step ${currentStep} Lesson ${selectedChapter} 전체 삭제 (${lessonWordCount}개)`}
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
                    placeholder="단어 (히라가나)"
                    className="w-full px-2 py-1 border border-slate-200 rounded-lg text-sm"
                  />
                  <input
                    value={editForm.kanji || ''}
                    onChange={e => setEditForm(f => ({ ...f, kanji: e.target.value || undefined }))}
                    placeholder="한자 (없으면 비워두기)"
                    className="w-full px-2 py-1 border border-slate-200 rounded-lg text-sm"
                  />
                  <input
                    value={editForm.reading}
                    onChange={e => setEditForm(f => ({ ...f, reading: e.target.value }))}
                    placeholder="읽기"
                    className="w-full px-2 py-1 border border-slate-200 rounded-lg text-sm"
                  />
                  <input
                    value={editForm.meaning}
                    onChange={e => setEditForm(f => ({ ...f, meaning: e.target.value }))}
                    placeholder="뜻"
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
                    {w.kanji ? (
                      <>
                        <span className="font-medium text-slate-800">{w.kanji}</span>
                        <span className="text-indigo-500 text-sm ml-2">{w.reading}</span>
                      </>
                    ) : (
                      <span className="font-medium text-slate-800">{w.word}</span>
                    )}
                    <p className="text-sm text-slate-500">{w.meaning}</p>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => startEdit(w)} className="text-slate-400 py-1 px-2">수정</button>
                      <button onClick={() => handleDelete(w.id)} className="text-red-400 py-1 px-2">삭제</button>
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
