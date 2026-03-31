import { getLocalDateString } from './date-utils';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export const MODELS = [
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (권장 - 빠름)' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (정교함)' },
  { id: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)' },
];

export function getApiKey() {
  return localStorage.getItem('gemini-api-key') || '';
}

export function setApiKey(key) {
  localStorage.setItem('gemini-api-key', key);
}

export function getModel() {
  return localStorage.getItem('gemini-model') || MODELS[0].id;
}

export function setModel(model) {
  localStorage.setItem('gemini-model', model);
}

export async function extractWordsFromImage(base64Image, mimeType, chapter, textbook) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('설정에서 Gemini API 키를 먼저 입력해주세요.');

  const model = getModel();
  const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;

  const prompt = `이 일본어 교재 사진에서 단어를 추출하여 JSON 배열로 반환해주세요.
필수 필드: word(일본어), reading(히라가나), meaning(한국어 뜻), pos(품사: 명사, 동사, い형용사, な형용사, 부사, 기타).
사진에 없는 단어는 절대 추가하지 마세요.`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Image,
            },
          },
        ],
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
        response_mime_type: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err.error?.message || '';
    if (response.status === 429 || msg.includes('quota')) {
      throw new Error(`쿼터 초과: 현재 모델(${model})의 사용량을 초과했습니다. 잠시 후 시도하거나 모델을 변경하세요.`);
    }
    throw new Error(msg || `API 요청 실패 (${response.status})`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!text) throw new Error('Gemini로부터 응답을 받지 못했습니다.');

  let words;
  try {
    words = JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('응답 데이터를 해석할 수 없습니다.');
    words = JSON.parse(jsonMatch[0]);
  }

  const today = getLocalDateString();

  return words.map(w => ({
    word: w.word || '',
    reading: w.reading || '',
    meaning: w.meaning || '',
    pos: w.pos || '기타',
    chapter: chapter || 0,
    textbook: textbook || '',
    createdAt: today,
  }));
}
