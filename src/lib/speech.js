let voices = [];

// 음성 목록이 처음 로드되거나 변경될 때 캐싱
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = () => {
    voices = speechSynthesis.getVoices();
  };
}

function getBestJapaneseVoice() {
  if (voices.length === 0 && typeof speechSynthesis !== 'undefined') {
    voices = speechSynthesis.getVoices();
  }
  
  // 1순위: Google TTS (안드로이드 크롬과 동일한 고품질 네트워크 음성)
  let best = voices.find(v => v.lang.includes('ja') && v.name.includes('Google'));
  
  // 2순위: Mac OS/iOS 프리미엄 고음질 음성 (Premium 등)
  if (!best) {
    best = voices.find(v => v.lang.includes('ja') && (v.name.includes('Premium') || v.name.includes('Enhanced')));
  }
  
  // 3순위: Kyoko/Otoya (Mac 기본)
  if (!best) {
    best = voices.find(v => v.lang.includes('ja') && (v.name.includes('Kyoko') || v.name.includes('Otoya')));
  }
  
  // 4순위: 사용 가능한 첫 번째 일본어 음성
  if (!best) {
    best = voices.find(v => v.lang.includes('ja'));
  }
  
  return best;
}

export function speak(text) {
  return new Promise(resolve => {
    if (typeof speechSynthesis === 'undefined') {
      resolve();
      return;
    }
    
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = 0.8;
    
    const bestVoice = getBestJapaneseVoice();
    if (bestVoice) {
      u.voice = bestVoice;
    }
    
    u.onend = resolve;
    u.onerror = resolve;
    speechSynthesis.speak(u);
  });
}
