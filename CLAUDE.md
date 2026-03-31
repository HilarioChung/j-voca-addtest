# J-VOCA Project Context

## Overview
일본어 교재 사진 OCR + FSRS 간격반복 복습 PWA 단어장.

## Tech Stack
- **Frontend**: React 19 + Tailwind CSS 4 + Vite 6
- **Data**: IndexedDB (Dexie v4) + GitHub Contents API 동기화
- **Algorithm**: FSRS (ts-fsrs) — 간격반복 스케줄링
- **AI**: Gemini Vision API (교재 사진 OCR)
- **Deploy**: GitHub Pages + GitHub Actions

## Project Structure
```
src/
  App.jsx                    # 라우터 + 네비게이션
  main.jsx                   # 엔트리포인트
  components/
    Dashboard.jsx            # 홈 대시보드
    WordInput.jsx            # 사진 촬영 → 단어 추출
    WordList.jsx             # 단어 목록 + 검색 + 플래시카드
    ReviewSession.jsx        # FSRS 복습 세션 (모름/애매/앎)
    FlashCard.jsx            # 플래시카드 UI
    BrowseModal.jsx          # Lesson별 단어 탐색
    Settings.jsx             # API 키/PAT 설정
    Statistics.jsx           # 학습 통계 차트
    WeakWords.jsx            # 오답노트
  lib/
    db.js                    # Dexie DB (words, reviews, reviewLogs)
    fsrs.js                  # FSRS 래퍼 (gradeCard, isDue, createInitialReview)
    review-utils.js          # 복습 큐 생성
    gemini.js                # Gemini Vision API 호출
    github.js                # GitHub Contents API CRUD
    speech.js                # Web Speech API TTS
    stats.js                 # 학습 통계 계산
    word-utils.js            # 단어 유틸리티
    weak-utils.js            # 취약 단어 판별
    shuffle.js               # Fisher-Yates 셔플
    __tests__/               # Vitest 테스트
public/
  data/words.json            # 단어 데이터 (GitHub 동기화 대상)
  sw.js                      # Service Worker
  manifest.json              # PWA manifest
```

## DB Schema (Dexie v3)
- **words**: `id, chapter, textbook, createdAt` — 단어 데이터
- **reviews**: `wordId, due, last_review, state` — FSRS 카드 상태
- **reviewLogs**: `++id, wordId, review_date, grade` — 복습 이력

## Commands
```bash
npm run dev -- --host    # 로컬 개발 서버
npm run build            # 프로덕션 빌드
npm test                 # Vitest 테스트 실행
npm run test:watch       # Vitest 워치 모드
```

## Key Patterns
- 컴포넌트는 `lazy()` + `Suspense`로 코드 스플리팅
- Vite base path: `/j-voca/`
- 복습 평가: again(모름) / good(애매) / easy(앎) 3단계
- DB 마이그레이션: SM-2 → FSRS (v2→v3)
- 설정값(API키, PAT)은 `localStorage`에 저장
