/**
 * 문법 변형 데이터
 * 교재 기반 일본어 품사별 활용 패턴
 */

export const GRAMMAR_CATEGORIES = [
  {
    id: 'noun',
    title: '명사',
    subtitle: '名詞',
    color: 'bg-amber-50 border-amber-200',
    textColor: 'text-amber-700',
    pos: '명사',
  },
  {
    id: 'na-adj',
    title: 'な형용사',
    subtitle: 'な形容詞',
    color: 'bg-pink-50 border-pink-200',
    textColor: 'text-pink-700',
    pos: 'な형용사',
  },
  {
    id: 'i-adj',
    title: 'い형용사',
    subtitle: 'い形容詞',
    color: 'bg-sky-50 border-sky-200',
    textColor: 'text-sky-700',
    pos: 'い형용사',
  },
];

/**
 * 활용형 카드 정의
 * name: 카드 앞면에 보이는 문법 이름 (정식 명칭)
 * nameJp: 일본어 명칭
 * suffix: 어미
 * conjugate(stem): 활용형 생성
 * meaning(meaning): 한국어 뜻 변형
 */
export const GRAMMAR_CARDS = {
  noun: [
    { id: 'n01', name: '기본형', nameJp: '基本形', suffix: 'だ',
      conjugate: s => `${s}だ`, meaning: m => `${m}이다` },
    { id: 'n02', name: '부정형', nameJp: '否定形', suffix: 'ではない',
      conjugate: s => `${s}ではない`, meaning: m => `${m}이/가 아니다` },
    { id: 'n03', name: '과거형', nameJp: '過去形', suffix: 'だった',
      conjugate: s => `${s}だった`, meaning: m => `${m}이었다` },
    { id: 'n04', name: '과거부정형', nameJp: '過去否定形', suffix: 'ではなかった',
      conjugate: s => `${s}ではなかった`, meaning: m => `${m}이/가 아니었다` },
    { id: 'n05', name: '정중형', nameJp: '丁寧形', suffix: 'です',
      conjugate: s => `${s}です`, meaning: m => `${m}입니다` },
    { id: 'n06', name: '정중부정형', nameJp: '丁寧否定形', suffix: 'ではないです',
      conjugate: s => `${s}ではないです`, meaning: m => `${m}이/가 아닙니다` },
    { id: 'n07', name: '과거정중형', nameJp: '過去丁寧形', suffix: 'でした',
      conjugate: s => `${s}でした`, meaning: m => `${m}이었습니다` },
    { id: 'n08', name: '과거정중부정형', nameJp: '過去丁寧否定形', suffix: 'ではなかったです',
      conjugate: s => `${s}ではなかったです`, meaning: m => `${m}이/가 아니었습니다` },
  ],
  'na-adj': [
    { id: 'na01', name: '기본형', nameJp: '基本形', suffix: 'だ',
      conjugate: s => `${s}だ`, meaning: m => `${m}` },
    { id: 'na02', name: '부정형', nameJp: '否定形', suffix: 'ではない',
      conjugate: s => `${s}ではない`, meaning: m => `${m.replace(/다$/, '지 않다')}` },
    { id: 'na03', name: '과거형', nameJp: '過去形', suffix: 'だった',
      conjugate: s => `${s}だった`, meaning: m => `${m.replace(/다$/, '했다')}` },
    { id: 'na04', name: '과거부정형', nameJp: '過去否定形', suffix: 'ではなかった',
      conjugate: s => `${s}ではなかった`, meaning: m => `${m.replace(/다$/, '지 않았다')}` },
    { id: 'na05', name: '정중형', nameJp: '丁寧形', suffix: 'です',
      conjugate: s => `${s}です`, meaning: m => `${m.replace(/다$/, '합니다')}` },
    { id: 'na06', name: '정중부정형', nameJp: '丁寧否定形', suffix: 'ではないです',
      conjugate: s => `${s}ではないです`, meaning: m => `${m.replace(/다$/, '지 않습니다')}` },
    { id: 'na07', name: '과거정중형', nameJp: '過去丁寧形', suffix: 'でした',
      conjugate: s => `${s}でした`, meaning: m => `${m.replace(/다$/, '했습니다')}` },
    { id: 'na08', name: '과거정중부정형', nameJp: '過去丁寧否定形', suffix: 'ではなかったです',
      conjugate: s => `${s}ではなかったです`, meaning: m => `${m.replace(/다$/, '지 않았습니다')}` },
    { id: 'na09', name: '연체형', nameJp: '連体形', suffix: 'な',
      conjugate: s => `${s}な`, meaning: m => `${m.replace(/다$/, '한')}` },
    { id: 'na10', name: 'て형', nameJp: 'て形', suffix: 'で',
      conjugate: s => `${s}で`, meaning: m => `${m.replace(/다$/, '하고')}` },
  ],
  'i-adj': [
    { id: 'i01', name: '기본형', nameJp: '基本形', suffix: 'い',
      conjugate: s => `${s}い`, meaning: m => `${m}` },
    { id: 'i02', name: '부정형', nameJp: '否定形', suffix: 'くない',
      conjugate: s => `${s}くない`, meaning: m => `${m.replace(/다$/, '지 않다')}` },
    { id: 'i03', name: '과거형', nameJp: '過去形', suffix: 'かった',
      conjugate: s => `${s}かった`, meaning: m => `${m.replace(/다$/, '했다')}` },
    { id: 'i04', name: '과거부정형', nameJp: '過去否定形', suffix: 'くなかった',
      conjugate: s => `${s}くなかった`, meaning: m => `${m.replace(/다$/, '지 않았다')}` },
    { id: 'i05', name: '정중형', nameJp: '丁寧形', suffix: '+です',
      conjugate: s => `${s}いです`, meaning: m => `${m.replace(/다$/, '합니다')}` },
    { id: 'i06', name: '정중부정형', nameJp: '丁寧否定形', suffix: 'くないです',
      conjugate: s => `${s}くないです`, meaning: m => `${m.replace(/다$/, '지 않습니다')}` },
    { id: 'i07', name: '과거정중형', nameJp: '過去丁寧形', suffix: 'かったです',
      conjugate: s => `${s}かったです`, meaning: m => `${m.replace(/다$/, '했습니다')}` },
    { id: 'i08', name: '과거정중부정형', nameJp: '過去丁寧否定形', suffix: 'くなかったです',
      conjugate: s => `${s}くなかったです`, meaning: m => `${m.replace(/다$/, '지 않았습니다')}` },
    { id: 'i09', name: 'て형', nameJp: 'て形', suffix: 'くて',
      conjugate: s => `${s}くて`, meaning: m => `${m.replace(/다$/, '하고')}` },
    { id: 'i10', name: '사역형', nameJp: '使役形', suffix: 'くする',
      conjugate: s => `${s}くする`, meaning: m => `${m.replace(/다$/, '하게 하다')}` },
    { id: 'i11', name: '변화형', nameJp: '変化形', suffix: 'くなる',
      conjugate: s => `${s}くなる`, meaning: m => `${m.replace(/다$/, '해지다')}` },
  ],
};

/**
 * 단어에서 어간(stem) 추출
 */
export function getStem(word, categoryId) {
  const w = word.word || word.reading;
  if (categoryId === 'i-adj') return w.replace(/い$/, '');
  if (categoryId === 'na-adj') return w.replace(/だ$/, '');
  return w;
}

/**
 * 한자 어간 추출
 */
export function getKanjiStem(word, categoryId) {
  if (!word.kanji) return null;
  if (categoryId === 'i-adj') return word.kanji.replace(/い$/, '');
  if (categoryId === 'na-adj') return word.kanji.replace(/だ$/, '');
  return word.kanji;
}
