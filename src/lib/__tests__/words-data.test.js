import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, '../../../public/data/words.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const isPositiveInt = v => Number.isInteger(v) && v > 0;

describe('public/data/words.json integrity', () => {
  it('words 배열과 lastId가 있다', () => {
    expect(Array.isArray(data.words)).toBe(true);
    expect(data.words.length).toBeGreaterThan(0);
    expect(Number.isInteger(data.lastId)).toBe(true);
  });

  it('모든 단어에 step이 양의 정수로 들어 있다', () => {
    const bad = data.words.filter(w => !isPositiveInt(w.step));
    expect(bad.map(w => w.id)).toEqual([]);
  });

  it('모든 단어의 chapter가 양의 정수다', () => {
    const bad = data.words.filter(w => !isPositiveInt(w.chapter));
    expect(bad.map(w => w.id)).toEqual([]);
  });

  it('id가 양의 정수이며 중복이 없다', () => {
    const ids = data.words.map(w => w.id);
    expect(ids.every(isPositiveInt)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('lastId는 최대 id 이상이다', () => {
    const maxId = Math.max(...data.words.map(w => w.id));
    expect(data.lastId).toBeGreaterThanOrEqual(maxId);
  });

  it('Step 1과 Step 2 단어가 모두 존재한다', () => {
    const step1 = data.words.filter(w => w.step === 1);
    const step2 = data.words.filter(w => w.step === 2);
    expect(step1.length).toBeGreaterThan(900);
    expect(step2.length).toBeGreaterThanOrEqual(127);

    const step2Ch1 = step2.filter(w => w.chapter === 1);
    const step2Ch2 = step2.filter(w => w.chapter === 2);
    expect(step2Ch1.length).toBeGreaterThanOrEqual(68);
    expect(step2Ch2.length).toBeGreaterThanOrEqual(59);
  });

  it('47개 반의어 데이터가 온전히 보존되어 있다', () => {
    const antonymWords = data.words.filter(w => w.antonym);
    expect(antonymWords.length).toBe(47);
    for (const w of antonymWords) {
      expect(typeof w.antonym).toBe('string');
      expect(typeof w.antonymReading).toBe('string');
      expect(typeof w.antonymMeaning).toBe('string');
    }
  });
});
