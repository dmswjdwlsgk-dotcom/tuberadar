'use client'
import { useState } from 'react'
import { useApi } from '@/context/ApiContext'
import { translateScript, summarizeScript } from '@/utils/gemini'

export default function ScriptExtract() {
  const { ytKey, geminiKey } = useApi()
  const [url, setUrl] = useState('')
  const [videoInfo, setVideoInfo] = useState(null)
  const [captions, setCaptions] = useState('')
  const [translation, setTranslation] = useState('')
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('original')

  const extractVideoId = (url) => {
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtu\.be\/([^?]+)/,
      /youtube\.com\/shorts\/([^?]+)/,
    ]
    for (const p of patterns) {
      const m = url.match(p)
      if (m) return m[1]
    }
    return url.trim()
  }

  const fetch_ = async () => {
    if (!url.trim() || !ytKey) return
    setLoading(true); setError(''); setCaptions(''); setTranslation(''); setSummary(null); setVideoInfo(null)
    try {
      const videoId = extractVideoId(url)
      // 영상 정보 가져오기
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${ytKey}`
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const video = data.items?.[0]
      if (!video) throw new Error('영상을 찾을 수 없습니다')
      setVideoInfo(video)

      // YouTube 자막은 직접 API로 가져올 수 없어 youtube-transcript 방식 사용
      // 대신 영상 설명을 대본 대용으로 제공
      const desc = video.snippet.description || ''
      if (desc.length > 100) {
        setCaptions(desc)
      } else {
        setCaptions(`[영상 제목]
${video.snippet.title}

[채널]
${video.snippet.channelTitle}

[설명]
${desc || '(설명 없음)'}

※ YouTube API는 자막 직접 추출을 지원하지 않습니다.
영상 URL을 youtube-transcript-api 등으로 처리하거나,
영상을 직접 시청하여 대본을 확인해주세요.`)
      }
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const translate = async () => {
    if (!captions || !geminiKey) return
    setAiLoading(true)
    try {
      const result = await translateScript(captions, geminiKey)
      setTranslation(result)
      setTab('translation')
    } catch (e) { setError(e.message) }
    setAiLoading(false)
  }

  const summarize = async () => {
    if (!captions || !geminiKey) return
    setAiLoading(true)
    try {
      const result = await summarizeScript(captions, geminiKey)
      setSummary(result)
      setTab('summary')
    } catch (e) { setError(e.message) }
    setAiLoading(false)
  }

  const copyText = () => {
    const text = tab === 'original' ? captions : tab === 'translation' ? translation : JSON.stringify(summary, null, 2)
    navigator.clipboard.writeText(text).then(() => alert('복사됐습니다!'))
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>📄 유튜브 대본 추출</h1>
        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>영상 정보 추출 + AI 번역/요약</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetch_()} placeholder="YouTube URL 또는 영상 ID 입력" />
          <button className="btn-primary" onClick={fetch_} disabled={loading || !ytKey}>{loading ? '⏳' : '추출'}</button>
        </div>
        {error && <p style={{ margin: '8px 0 0', color: '#ff0055', fontSize: 13 }}>⚠️ {error}</p>}
      </div>

      {videoInfo && (
        <div className="fade-in">
          {/* 영상 정보 */}
          <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
            <img src={videoInfo.snippet.thumbnails?.medium?.url} alt="" style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 6 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{videoInfo.snippet.title}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{videoInfo.snippet.channelTitle}</div>
            </div>
          </div>

          {/* 탭 */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[['original', '원문'], ['translation', 'AI 번역'], ['summary', 'AI 요약']].map(([v, l]) => (
              <button key={v} className={tab === v ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => setTab(v)}>{l}</button>
            ))}
          </div>

          {/* AI 액션 */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {geminiKey ? (
              <>
                <button className="btn-secondary" onClick={translate} disabled={aiLoading} style={{ fontSize: 13 }}>🌏 한국어 번역</button>
                <button className="btn-secondary" onClick={summarize} disabled={aiLoading} style={{ fontSize: 13 }}>📊 AI 분석/요약</button>
              </>
            ) : (
              <span style={{ fontSize: 13, color: '#6b7280' }}>AI 기능을 사용하려면 Gemini API 키를 설정하세요</span>
            )}
            {captions && <button className="btn-secondary" onClick={copyText} style={{ fontSize: 13, marginLeft: 'auto' }}>📋 복사</button>}
          </div>

          {aiLoading && <div style={{ textAlign: 'center', padding: 30, color: '#6b7280' }}>✨ AI 처리 중...</div>}

          {/* 컨텐츠 */}
          <div className="card" style={{ background: '#0d0d11' }}>
            {tab === 'original' && (
              <pre style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: '#e2e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 500, overflowY: 'auto' }}>
                {captions || '내용 없음'}
              </pre>
            )}
            {tab === 'translation' && (
              <pre style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: '#e2e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 500, overflowY: 'auto' }}>
                {translation || 'AI 번역 버튼을 눌러주세요'}
              </pre>
            )}
            {tab === 'summary' && summary && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <SummaryItem label="📝 요약" value={summary.summary} />
                <SummaryItem label="🎯 톤/스타일" value={summary.tone} />
                <SummaryItem label="👥 타겟 시청자" value={summary.target} />
                {summary.keywords?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>🔑 키워드</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {summary.keywords.map(k => <span key={k} className="tag-neon">{k}</span>)}
                    </div>
                  </div>
                )}
                {summary.topics?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>📌 주제</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {summary.topics.map(t => <span key={t} className="tag">{t}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}
            {tab === 'summary' && !summary && (
              <div style={{ color: '#6b7280', fontSize: 13 }}>AI 분석/요약 버튼을 눌러주세요</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, lineHeight: 1.7 }}>{value}</div>
    </div>
  )
}
