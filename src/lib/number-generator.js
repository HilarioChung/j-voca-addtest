export const CATEGORIES = ['date', 'price', 'weekday', 'time', 'counter'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(array) {
  return array[getRandomInt(0, array.length - 1)];
}

const MONTHS = [
  { k: "1月", r: "いちがつ" }, { k: "2月", r: "にがつ" }, { k: "3月", r: "さんがつ" },
  { k: "4月", r: "しがつ" }, { k: "5月", r: "ごがつ" }, { k: "6月", r: "ろくがつ" },
  { k: "7月", r: "しちがつ" }, { k: "8月", r: "はちがつ" }, { k: "9月", r: "くがつ" },
  { k: "10月", r: "じゅうがつ" }, { k: "11月", r: "じゅういちがつ" }, { k: "12月", r: "じゅうにがつ" }
];

const DAYS = {
  1: { k: "1日", r: "ついたち" },
  2: { k: "2日", r: "ふつか" },
  3: { k: "3日", r: "みっか" },
  4: { k: "4日", r: "よっか" },
  5: { k: "5日", r: "いつか" },
  6: { k: "6日", r: "むいか" },
  7: { k: "7日", r: "なのか" },
  8: { k: "8日", r: "ようか" },
  9: { k: "9日", r: "ここのか" },
  10: { k: "10日", r: "とおか" },
  14: { k: "14日", r: "じゅうよっか" },
  20: { k: "20日", r: "はつか" },
  24: { k: "24日", r: "にじゅうよっか" }
};

// basic numbers for generic usage
const NUMBERS = {
  1: "いち", 2: "に", 3: "さん", 4: "よん", 5: "ご", 
  6: "ろく", 7: "なな", 8: "はち", 9: "きゅう", 10: "じゅう"
};

function getNumberReading(num) {
  if (num === 0) return "ぜろ";
  if (num <= 10) {
    if (num === 4) return "よん"; // or し, but よん is standard for basic counting
    if (num === 7) return "なな"; // or しち
    if (num === 9) return "きゅう"; // or く
    return NUMBERS[num];
  }
  let res = "";
  const tens = Math.floor(num / 10);
  const ones = num % 10;
  if (tens === 1) res += "じゅう";
  else if (tens > 1) res += NUMBERS[tens] + "じゅう";
  
  if (ones > 0) {
    res += NUMBERS[ones];
  }
  return res;
}

function getDay(day) {
  if (DAYS[day]) return DAYS[day];
  // build regular day
  let reading = getNumberReading(day);
  // specific adjustments for 17, 19, 27, 29
  if (day === 17) reading = "じゅうしち";
  if (day === 19) reading = "じゅうく";
  if (day === 27) reading = "にじゅうしち";
  if (day === 29) reading = "にじゅうく";
  
  return { k: `${day}日`, r: `${reading}にち` };
}

function generateDate() {
  const m = getRandomInt(1, 12);
  const maxDays = [2, 4, 6, 9, 11].includes(m) ? (m===2 ? 28 : 30) : 31;
  const d = getRandomInt(1, maxDays);
  
  const month = MONTHS[m - 1];
  const day = getDay(d);
  
  return {
    question: `${m}월 ${d}일은?`,
    kanji: `${month.k}${day.k}`,
    reading: `${month.r}${day.r}`
  };
}

const WEEKDAYS = [
  { q: "월요일은?", k: "月曜日", r: "げつようび" },
  { q: "화요일은?", k: "火曜日", r: "かようび" },
  { q: "수요일은?", k: "水曜日", r: "すいようび" },
  { q: "목요일은?", k: "木曜日", r: "もくようび" },
  { q: "금요일은?", k: "金曜日", r: "きんようび" },
  { q: "토요일은?", k: "土曜日", r: "どようび" },
  { q: "일요일은?", k: "日曜日", r: "にちようび" },
];

function generateWeekday() {
  return getRandomItem(WEEKDAYS);
}

const COUNTERS = {
  1: { k: "一つ", r: "ひとつ" },
  2: { k: "二つ", r: "ふたつ" },
  3: { k: "三つ", r: "みっつ" },
  4: { k: "四つ", r: "よっつ" },
  5: { k: "五つ", r: "いつつ" },
  6: { k: "六つ", r: "むっつ" },
  7: { k: "七つ", r: "ななつ" },
  8: { k: "八つ", r: "やっつ" },
  9: { k: "九つ", r: "ここのつ" },
  10: { k: "十", r: "とお" },
};
const OBJECTS = [
  { q: "사과", k: "りんご", r: "りんご" }, { q: "귤", k: "みかん", r: "みかん" }, { q: "가방", k: "かばん", r: "かばん" }, { q: "책상", k: "つくえ", r: "つくえ" }
];

function generateCounter(nouns = []) {
  const num = getRandomInt(1, 10);
  let obj = getRandomItem(OBJECTS);
  
  let validNouns = nouns;
  if (nouns && nouns.length > 0) {
    // 사람이나 동물 등을 나타내는 단어는 '개(~つ)' 단위를 쓰기 어색하므로 제외
    validNouns = nouns.filter(n => {
      const m = n.meaning || '';
      return !/(사람|명|형|누나|오빠|언니|동생|아버지|어머니|아빠|엄마|할아버지|할머니|가족|부모|친구|선생님|학생|남편|아내|딸|아들|아이|어른|남자|여자|소년|소녀|개|고양이|동물|새|물고기|마리|권|인물|직원|손님)/.test(m);
    });
  }

  if (validNouns && validNouns.length > 0) {
    const dbNoun = getRandomItem(validNouns);
    obj = {
      q: dbNoun.meaning || dbNoun.word || '?',
      k: dbNoun.kanji || dbNoun.word || '?',
      r: dbNoun.reading || dbNoun.word || '?'
    };
  }

  const counter = COUNTERS[num];
  
  return {
    question: `${obj.q} ${num}개는?`,
    kanji: `${obj.k} ${counter.k}`,
    reading: `${obj.r} ${counter.r}`
  };
}

const HOURS = {
  1: "いち", 2: "に", 3: "さん", 4: "よ", 5: "ご", 6: "ろく",
  7: "しち", 8: "はち", 9: "く", 10: "じゅう", 11: "じゅういち", 12: "じゅうに"
};

const MINUTES = {
  1: "いっぷん", 2: "にふん", 3: "さんぷん", 4: "よんぷん", 5: "ごふん",
  6: "ろっぷん", 7: "ななふん", 8: "はっぷん", 9: "きゅうふん", 10: "じゅっぷん"
};

function getMinuteReading(m) {
  if (m === 0) return "";
  if (m <= 10) return MINUTES[m];
  if (m === 30) return "はん"; // Randomly we could use 'han', but we can just do 30 min. Let's do normal reading.
  
  let res = "";
  const tens = Math.floor(m / 10);
  const ones = m % 10;
  
  if (tens === 1) res += "じゅう";
  else if (tens > 1) res += NUMBERS[tens] + "じゅう";
  
  if (ones === 0) {
    // e.g. 20 -> にじゅっぷん
    if (tens === 2) return "にじゅっぷん";
    if (tens === 3) return "さんじゅっぷん";
    if (tens === 4) return "よんじゅっぷん";
    if (tens === 5) return "ごじゅっぷん";
  } else {
    res += MINUTES[ones];
  }
  return res;
}

function generateTime() {
  const h = getRandomInt(1, 12);
  const minOptions = [0, 5, 10, 15, 20, 30, 45, 50, getRandomInt(1, 59)];
  let m = getRandomItem(minOptions);
  
  const hourReading = HOURS[h] + "じ";
  let minReading = getMinuteReading(m);
  
  if (m === 30 && Math.random() > 0.5) minReading = "はん";
  
  let qMin = m === 0 ? "정각" : `${m}분`;
  let kMin = m === 0 ? "" : (minReading === "はん" ? "半" : `${m}分`);
  
  return {
    question: `${h}시 ${qMin}은?`,
    kanji: `${h}時${kMin}`,
    reading: `${hourReading}${minReading}`
  };
}

function getPriceReading(price) {
  if (price === 0) return "ぜろえん";
  
  let p = price;
  let res = "";
  
  const man = Math.floor(p / 10000);
  p = p % 10000;
  if (man > 0) {
    if (man === 1) res += "いちまん";
    else res += getNumberReading(man) + "まん";
  }
  
  const sen = Math.floor(p / 1000);
  p = p % 1000;
  if (sen > 0) {
    if (sen === 3) res += "さんぜん";
    else if (sen === 8) res += "はっせん";
    else if (sen === 1) res += "せん";
    else res += NUMBERS[sen] + "せん";
  }
  
  const hyaku = Math.floor(p / 100);
  p = p % 100;
  if (hyaku > 0) {
    if (hyaku === 1) res += "ひゃく";
    else if (hyaku === 3) res += "さんびゃく";
    else if (hyaku === 6) res += "ろっぴゃく";
    else if (hyaku === 8) res += "はっぴゃく";
    else res += NUMBERS[hyaku] + "ひゃく";
  }
  
  if (p > 0) {
    res += getNumberReading(p);
  }
  
  return res + "えん";
}

function generatePrice() {
  // Common price patterns
  const patterns = [
    () => getRandomInt(1, 9) * 100, // 100~900
    () => getRandomInt(1, 9) * 1000, // 1000~9000
    () => getRandomInt(1, 9) * 1000 + getRandomInt(1, 9) * 100, // 1100~9900
    () => getRandomInt(1, 9) * 10000, // 10000~90000
    () => getRandomInt(100, 99999) // completely random up to 99999
  ];
  
  const price = getRandomItem(patterns)();
  
  return {
    question: `${price.toLocaleString()}엔은?`,
    kanji: `${price}円`,
    reading: getPriceReading(price)
  };
}

export function generateRandomQuestion(nouns = []) {
  const category = getRandomItem(CATEGORIES);
  switch (category) {
    case 'date': return generateDate();
    case 'price': return generatePrice();
    case 'weekday': return generateWeekday();
    case 'time': return generateTime();
    case 'counter': return generateCounter(nouns);
    default: return generateDate();
  }
}
