# TubeRadar

YouTube 채널 분석 & 트렌드 모니터링 대시보드

Next.js 기반의 유튜브 데이터 분석 도구로, YouTube Data API와 Google Gemini AI를 활용합니다.

## 주요 기능

**채널 관리**
- **모니터링 리스트** — 채널 ID/핸들로 채널 등록 및 구독자·조회수 추적
- **채널 비교 분석** — 최대 4개 채널을 바차트·레이더 차트로 비교
- **채널 급등 레이더** — 인기 영상 기반 급성장 채널 탐지
- **업로드 시간 분석** — 채널의 요일·시간대별 업로드 패턴 히트맵
- **채널 수익 분석** — 카테고리 CPM 기반 예상 수익 계산

**키워드 탐색**
- **키워드 소재 탐색** — 키워드 검색으로 관련 영상 조회수·통계 분석
- **키워드 채널 찾기** — 키워드로 관련 채널 검색 및 구독자순 정렬

**아이디어 · 추천**
- **유튜브 추천 소재** — Gemini AI가 키워드 기반 콘텐츠 아이디어 생성
- **추천 채널 팩** — 카테고리 선택 시 AI + YouTube 검색으로 추천 채널 제공

**AI 스튜디오**
- **레퍼런스 스튜디오** — 영상 검색 후 선택 영상들을 Gemini AI로 분석 (바이럴 요인 포함)
- **유튜브 대본 추출** — 영상 자막 추출 + AI 번역·요약
- **썸네일 다운로드** — 유튜브 영상 썸네일을 5가지 해상도로 다운로드

**트렌드 분석**
- **Shorts 레이더** — 키워드/해시태그 기반 인기 숏츠 탐색
- **실시간 국가 트렌드** — 12개국 YouTube 인기 동영상 실시간 조회
- **실시간 카테고리 트렌드** — 카테고리별 YouTube 인기 동영상 조회
- **커뮤니티 핫게시글** — 클리앙·루리웹·디시인사이드·더쿠 등 15개 커뮤니티 인기 게시글

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
| Google Gemini API | AI 분석 기능 (선택) | [Google AI Studio](https://aistudio.google.com/) |

> Gemini API 키 없이도 기본 분석 기능은 사용 가능합니다.

## 빌드

```bash
npm run build
npm run start
```
