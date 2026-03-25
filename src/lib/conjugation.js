/**
 * い형용사, な형용사, 명사의 활용형을 생성한다.
 * 각 활용형에 대해 예문, 읽기(히라가나), 한국어 뜻을 반환한다.
 */

const CONJUGABLE_POS = ['い형용사', 'な형용사', '명사'];

export function canConjugate(pos) {
  return CONJUGABLE_POS.includes(pos);
}

/**
 * 단어 객체를 받아 4가지 활용형을 반환한다.
 * @returns {{ present, negative, past, pastNegative }} 각각 { sentence, reading, meaning }
 */
export function conjugate(word) {
  const { pos, reading, kanji, meaning } = word;
  const display = kanji || reading;

  if (pos === 'い형용사') {
    return conjugateIAdj(display, reading, meaning);
  }
  if (pos === 'な형용사') {
    return conjugateNaAdj(display, reading, meaning);
  }
  if (pos === '명사') {
    return conjugateNoun(display, reading, meaning);
  }
  return null;
}

function conjugateIAdj(display, reading, meaning) {
  // いい/よい 불규칙 활용: 어간이 よ로 변형
  const isYoi = reading === 'よい' || reading === 'いい' || reading === 'いい・よい';
  const displayStem = isYoi ? '良' : (display.endsWith('い') ? display.slice(0, -1) : display);
  const readingStem = isYoi ? 'よ' : (reading.endsWith('い') ? reading.slice(0, -1) : reading);

  // いい/よい: 평서형은 いいです / 良いです, 활용은 よ- 기반
  const presentDisplay = isYoi ? '良いです' : `${display}です`;
  const presentReading = isYoi ? 'いいです' : `${reading}です`;

  return {
    present: {
      sentence: presentDisplay,
      reading: presentReading,
      label: '평서형',
    },
    negative: {
      sentence: `${displayStem}くないです`,
      reading: `${readingStem}くないです`,
      label: '부정형',
    },
    past: {
      sentence: `${displayStem}かったです`,
      reading: `${readingStem}かったです`,
      label: '과거형',
    },
    pastNegative: {
      sentence: `${displayStem}くなかったです`,
      reading: `${readingStem}くなかったです`,
      label: '과거부정형',
    },
  };
}

function conjugateNaAdj(display, reading, meaning) {
  // な형용사: 語幹 = だ 제거
  const displayStem = display.endsWith('だ') ? display.slice(0, -1) : display;
  const readingStem = reading.endsWith('だ') ? reading.slice(0, -1) : reading;

  return {
    present: {
      sentence: `${displayStem}です`,
      reading: `${readingStem}です`,
      label: '평서형',
    },
    negative: {
      sentence: `${displayStem}ではないです`,
      reading: `${readingStem}ではないです`,
      label: '부정형',
    },
    past: {
      sentence: `${displayStem}でした`,
      reading: `${readingStem}でした`,
      label: '과거형',
    },
    pastNegative: {
      sentence: `${displayStem}ではなかったです`,
      reading: `${readingStem}ではなかったです`,
      label: '과거부정형',
    },
  };
}

function conjugateNoun(display, reading, meaning) {
  return {
    present: {
      sentence: `${display}です`,
      reading: `${reading}です`,
      label: '평서형',
    },
    negative: {
      sentence: `${display}ではないです`,
      reading: `${reading}ではないです`,
      label: '부정형',
    },
    past: {
      sentence: `${display}でした`,
      reading: `${reading}でした`,
      label: '과거형',
    },
    pastNegative: {
      sentence: `${display}ではなかったです`,
      reading: `${reading}ではなかったです`,
      label: '과거부정형',
    },
  };
}
