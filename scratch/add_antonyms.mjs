import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'public/data/words.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const antonyms = {
  1: { antonym: '少ない', antonymReading: 'すくない', antonymMeaning: '적다' }, // 多い
  2: { antonym: '重い', antonymReading: 'おもい', antonymMeaning: '무겁다' }, // 軽い
  3: { antonym: '広い', antonymReading: 'ひろい', antonymMeaning: '넓다' }, // 狭い
  4: { antonym: '黒い', antonymReading: 'くろい', antonymMeaning: '검다' }, // 白い
  5: { antonym: '低い・安い', antonymReading: 'ひくい・やすい', antonymMeaning: '낮다 / 싸다' }, // 高い
  6: { antonym: '短い', antonymReading: 'みじかい', antonymMeaning: '짧다' }, // 長い
  7: { antonym: '狭い', antonymReading: 'せまい', antonymMeaning: '좁다' }, // 広い
  8: { antonym: '太い', antonymReading: 'ふとい', antonymMeaning: '굵다' }, // 細い
  9: { antonym: '高い', antonymReading: 'たかい', antonymMeaning: '비싸다 / 높다' }, // 安い
  10: { antonym: '安全だ', antonymReading: 'あんぜんだ', antonymMeaning: '안전하다' }, // 危ない
  11: { antonym: 'まずい', antonymReading: 'まずい', antonymMeaning: '맛없다' }, // おいしい
  12: { antonym: 'つまらない', antonymReading: 'つまらない', antonymMeaning: '지루하다' }, // たのしい
  13: { antonym: 'あたたかい', antonymReading: 'あたたかい', antonymMeaning: '따뜻하다' }, // つめたい
  14: { antonym: '古い', antonymReading: 'ふるい', antonymMeaning: '낡다, 오래되다' }, // あたらしい
  15: { antonym: 'つまらない', antonymReading: 'つまらない', antonymMeaning: '재미없다' }, // おもしろい
  16: { antonym: 'やさしい', antonymReading: 'やさしい', antonymMeaning: '쉽다' }, // むずかしい
  107: { antonym: 'さむい', antonymReading: 'さむい', antonymMeaning: '춥다' }, // あつい
  108: { antonym: 'あたらしい', antonymReading: 'あたらしい', antonymMeaning: '새롭다' }, // ふるい
  109: { antonym: 'わるい', antonymReading: 'わるい', antonymMeaning: '나쁘다' }, // いい・よい
  110: { antonym: 'あたたかい', antonymReading: 'あたたかい', antonymMeaning: '따뜻하다' }, // すずしい
  111: { antonym: 'くらい', antonymReading: 'くらい', antonymMeaning: '어둡다' }, // あかるい
  112: { antonym: 'ながい', antonymReading: 'ながい', antonymMeaning: '길다' }, // みじかい
  113: { antonym: 'たかい', antonymReading: 'たかい', antonymMeaning: '높다' }, // ひくい
  114: { antonym: 'しろい', antonymReading: 'しろい', antonymMeaning: '하얗다' }, // くろい
  115: { antonym: 'ちいさい', antonymReading: 'ちいさい', antonymMeaning: '작다' }, // おおきい
  140: { antonym: '寒い', antonymReading: 'さむい', antonymMeaning: '춥다' }, // 暑い
  153: { antonym: '少ない', antonymReading: 'すくない', antonymMeaning: '적다' }, // 多い
  178: { antonym: '小さい', antonymReading: 'ちいさい', antonymMeaning: '작다' }, // 大きい
  179: { antonym: '白い', antonymReading: 'しろい', antonymMeaning: '하얗다' }, // 黒い
  193: { antonym: '涼しい', antonymReading: 'すずしい', antonymMeaning: '시원하다' }, // 暖かい
  341: { antonym: 'すずしい', antonymReading: 'すずしい', antonymMeaning: '시원하다' }, // あたたかい
};

let count = 0;
data.words.forEach(word => {
  if (antonyms[word.id]) {
    word.antonym = antonyms[word.id].antonym;
    word.antonymReading = antonyms[word.id].antonymReading;
    word.antonymMeaning = antonyms[word.id].antonymMeaning;
    count++;
  }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`Updated ${count} adjectives with antonyms.`);
