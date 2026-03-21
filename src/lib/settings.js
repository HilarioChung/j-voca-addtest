// 학습 설정 유틸리티 — localStorage 기반 설정 읽기/쓰기

const KEYS = {
  FONT_SIZE: 'font-size',
};

/** 글자 크기 설정 조회 */
export function getFontSize() {
  return localStorage.getItem(KEYS.FONT_SIZE) || 'base';
}

/** 글자 크기 설정 저장 */
export function setFontSize(size) {
  localStorage.setItem(KEYS.FONT_SIZE, size);
}

export { KEYS };
