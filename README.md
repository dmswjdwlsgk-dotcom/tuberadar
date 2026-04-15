# TubeRadar

YouTube 채널 분석 & 트렌드 모니터링 대시보드

Next.js 기반의 유튜브 데이터 분석 도구로, YouTube Data API와 Google Gemini AI를 활용해 채널 성장 추이, 키워드 탐색, 트렌드 분석 등 다양한 기능을 제공합니다.

## 주요 기능

**채널 관리**
- 내 모니터링 리스트 — 주요 채널 등록 및 성과 추적
- 채널 비교 분석 — 여러 채널 지표 비교
- 채널 급등 레이더 — 급성장 채널 감지
- 업로드 시간 분석 — 최적 업로드 시간대 분석
- 채널 수익 분석 — 예상 수익 및 수익성 분석

**키워드 탐색**
- 키워드 소재 탐색 — 키워드 기반 콘텐츠 아이디어 발굴
- 키워드 채널 찾기 — 키워드와 관련된 채널 검색

**아이디어 · 추천**
- 유튜브 추천 소재 — AI 기반 콘텐츠 아이디어 추천
- 추천 채널 팩 — 니치별 추천 채널 묶음

**AI 스튜디오**
- 레퍼런스 스튜디오 — 참고 영상 분석
- 유튜브 대본 추출 — 영상 자막/스크립트 추출
- 썸네일 다운로드 — 썸네일 이미지 저장

**트렌드 분석**
- Shorts 자동 탐색 — 급상승 숏츠 탐색
- 실시간 국가 트렌드 — 국가별 인기 동영상 트렌드
- 실시간 카테고리 트렌드 — 카테고리별 트렌드 분석
- 커뮤니티 핫게시글 — 채널 커뮤니티 인기 게시글

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4, Recharts, Lucide React
- **API**: YouTube Data API v3, Google Gemini AI
- **기타**: Axios, Cheerio

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

### 3. API 키 설정

앱 우측 상단 **⚙️ API 설정** 버튼을 클릭하여 API 키를 입력합니다.

| 키 | 용도 | 발급처 |
|---|---|---|
| YouTube Data API v3 | 채널·영상 데이터 조회 | [Google Cloud Console](https://console.cloud.google.com/) |
| Google Gemini API | AI 기반 분석 기능 (선택) | [Google AI Studio](https://aistudio.google.com/) |

> Gemini API 키 없이도 기본 분석 기능은 사용 가능합니다.

## 빌드

```bash
npm run build
npm run start
```
