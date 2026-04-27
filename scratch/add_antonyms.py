import json
import os

data_path = os.path.join('public', 'data', 'words.json')

with open(data_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

antonyms = {
  1: {"antonym": "少ない", "antonymReading": "すくない", "antonymMeaning": "적다"},
  2: {"antonym": "重い", "antonymReading": "おもい", "antonymMeaning": "무겁다"},
  3: {"antonym": "広い", "antonymReading": "ひろい", "antonymMeaning": "넓다"},
  4: {"antonym": "黒い", "antonymReading": "くろい", "antonymMeaning": "검다"},
  5: {"antonym": "低い・安い", "antonymReading": "ひくい・やすい", "antonymMeaning": "낮다 / 싸다"},
  6: {"antonym": "短い", "antonymReading": "みじかい", "antonymMeaning": "짧다"},
  7: {"antonym": "狭い", "antonymReading": "せまい", "antonymMeaning": "좁다"},
  8: {"antonym": "太い", "antonymReading": "ふとい", "antonymMeaning": "굵다"},
  9: {"antonym": "高い", "antonymReading": "たかい", "antonymMeaning": "비싸다 / 높다"},
  10: {"antonym": "安全だ", "antonymReading": "あんぜんだ", "antonymMeaning": "안전하다"},
  11: {"antonym": "まずい", "antonymReading": "まずい", "antonymMeaning": "맛없다"},
  12: {"antonym": "つまらない", "antonymReading": "つまらない", "antonymMeaning": "지루하다"},
  13: {"antonym": "あたたかい", "antonymReading": "あたたかい", "antonymMeaning": "따뜻하다"},
  14: {"antonym": "古い", "antonymReading": "ふるい", "antonymMeaning": "낡다, 오래되다"},
  15: {"antonym": "つまらない", "antonymReading": "つまらない", "antonymMeaning": "재미없다"},
  16: {"antonym": "やさしい", "antonymReading": "やさしい", "antonymMeaning": "쉽다"},
  107: {"antonym": "さむい", "antonymReading": "さむい", "antonymMeaning": "춥다"},
  108: {"antonym": "あたらしい", "antonymReading": "あたらしい", "antonymMeaning": "새롭다"},
  109: {"antonym": "わるい", "antonymReading": "わるい", "antonymMeaning": "나쁘다"},
  110: {"antonym": "あたたかい", "antonymReading": "あたたかい", "antonymMeaning": "따뜻하다"},
  111: {"antonym": "くらい", "antonymReading": "くらい", "antonymMeaning": "어둡다"},
  112: {"antonym": "ながい", "antonymReading": "ながい", "antonymMeaning": "길다"},
  113: {"antonym": "たかい", "antonymReading": "たかい", "antonymMeaning": "높다"},
  114: {"antonym": "しろい", "antonymReading": "しろい", "antonymMeaning": "하얗다"},
  115: {"antonym": "ちいさい", "antonymReading": "ちいさい", "antonymMeaning": "작다"},
  140: {"antonym": "寒い", "antonymReading": "さむい", "antonymMeaning": "춥다"},
  153: {"antonym": "少ない", "antonymReading": "すくない", "antonymMeaning": "적다"},
  178: {"antonym": "小さい", "antonymReading": "ちいさい", "antonymMeaning": "작다"},
  179: {"antonym": "白い", "antonymReading": "しろい", "antonymMeaning": "하얗다"},
  193: {"antonym": "涼しい", "antonymReading": "すずしい", "antonymMeaning": "시원하다"},
  341: {"antonym": "すずしい", "antonymReading": "すずしい", "antonymMeaning": "시원하다"}
}

count = 0
for word in data.get('words', []):
    wid = int(word.get('id', 0))
    if wid in antonyms:
        word['antonym'] = antonyms[wid]['antonym']
        word['antonymReading'] = antonyms[wid]['antonymReading']
        word['antonymMeaning'] = antonyms[wid]['antonymMeaning']
        count += 1

with open(data_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Updated {count} adjectives with antonyms.")
