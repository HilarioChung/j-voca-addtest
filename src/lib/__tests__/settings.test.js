import { describe, it, expect, beforeEach, vi } from 'vitest';

const store = {};
const mockLocalStorage = {
  getItem: vi.fn((key) => store[key] ?? null),
  setItem: vi.fn((key, val) => { store[key] = String(val); }),
  removeItem: vi.fn((key) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
};
vi.stubGlobal('localStorage', mockLocalStorage);

const { getFontSize, setFontSize, KEYS } = await import('../settings');

beforeEach(() => {
  mockLocalStorage.clear();
  vi.clearAllMocks();
});

describe('fontSize', () => {
  it('기본값은 "base"', () => {
    expect(getFontSize()).toBe('base');
  });

  it('설정된 크기 반환', () => {
    setFontSize('large');
    expect(getFontSize()).toBe('large');
  });

  it('다른 크기로 변경 가능', () => {
    setFontSize('xlarge');
    expect(getFontSize()).toBe('xlarge');
    setFontSize('xxlarge');
    expect(getFontSize()).toBe('xxlarge');
  });
});
