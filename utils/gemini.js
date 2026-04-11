const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

async function geminiGenerate(prompt, geminiKey, model = 'gemini-2.0-flash') {
  const res = await fetch(`${BASE}/${model}:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    })
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message || 'Gemini API 오류')
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export async function getContentIdeas(keyword, geminiKey) {
  const prompt = `당신은 유튜브 크리에이터 전문 컨설턴트입니다.
키워드 "${keyword}"에 대한 유튜브 영상 아이디어 5개를 추천해주세요.

각 아이디어를 다음 JSON 배열 형식으로 반환하세요:
[
  {
    "title": "영상 제목 (클릭을 유도하는 제목)",
    "hook": "도입부 훅 (첫 10초 멘트)",
    "points": ["핵심 포인트1", "핵심 포인트2", "핵심 포인트3"],
    "thumbnail_tip": "썸네일 제작 팁",
    "viral_score": 85,
    "reason": "추천 이유"
  }
]

JSON만 반환하세요.`
  const text = await geminiGenerate(prompt, geminiKey)
  const match = text.match(/\[[\s\S]+\]/)
  if (!match) return []
  return JSON.parse(match[0])
}

export async function analyzeViralFactor(title, views, likes, geminiKey) {
  const prompt = `유튜브 영상을 분석해주세요.
제목: "${title}"
조회수: ${views}
좋아요: ${likes}

다음 JSON 형식으로 분석 결과를 반환하세요:
{
  "viral_score": 75,
  "factors": ["바이럴 요인1", "바이럴 요인2", "바이럴 요인3"],
  "strength": "주요 강점",
  "weakness": "개선할 점",
  "suggestion": "다음 영상 제작 제안"
}
JSON만 반환하세요.`
  const text = await geminiGenerate(prompt, geminiKey)
  const match = text.match(/\{[\s\S]+\}/)
  if (!match) return null
  return JSON.parse(match[0])
}

export async function translateScript(text, geminiKey, targetLang = '한국어') {
  const prompt = `다음 텍스트를 ${targetLang}로 자연스럽게 번역해주세요. 번역문만 반환하세요.\n\n${text}`
  return geminiGenerate(prompt, geminiKey)
}

export async function summarizeScript(text, geminiKey) {
  const prompt = `다음 유튜브 영상 대본을 분석하여 아래 JSON 형식으로 반환하세요:
{
  "summary": "3줄 요약",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "topics": ["주제1", "주제2"],
  "tone": "영상 톤/스타일",
  "target": "타겟 시청자"
}
대본:
${text.slice(0, 3000)}

JSON만 반환하세요.`
  const text2 = await geminiGenerate(prompt, geminiKey)
  const match = text2.match(/\{[\s\S]+\}/)
  if (!match) return null
  return JSON.parse(match[0])
}

export async function getChannelRecommendations(category, geminiKey) {
  const prompt = `유튜브 "${category}" 분야에서 성장 중인 채널 타입 5가지를 추천해주세요.
각 채널 타입에 대해 다음 JSON 배열 형식으로 반환하세요:
[
  {
    "type": "채널 타입명",
    "description": "어떤 채널인지 설명",
    "content_style": "콘텐츠 스타일",
    "upload_frequency": "추천 업로드 주기",
    "growth_potential": 85,
    "keywords": ["키워드1", "키워드2"]
  }
]
JSON만 반환하세요.`
  const text = await geminiGenerate(prompt, geminiKey)
  const match = text.match(/\[[\s\S]+\]/)
  if (!match) return []
  return JSON.parse(match[0])
}

export async function analyzeReference(titles, geminiKey) {
  const prompt = `다음 유튜브 영상 제목들을 분석하여 공통 패턴과 인사이트를 제공해주세요.

제목 목록:
${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

다음 JSON 형식으로 반환하세요:
{
  "patterns": ["패턴1", "패턴2", "패턴3"],
  "title_formula": "제목 공식",
  "hooks": ["효과적인 훅1", "훅2"],
  "content_type": "주요 콘텐츠 유형",
  "audience": "타겟 시청자 분석",
  "suggestions": ["나만의 영상 아이디어1", "아이디어2", "아이디어3"]
}
JSON만 반환하세요.`
  const text = await geminiGenerate(prompt, geminiKey)
  const match = text.match(/\{[\s\S]+\}/)
  if (!match) return null
  return JSON.parse(match[0])
}
