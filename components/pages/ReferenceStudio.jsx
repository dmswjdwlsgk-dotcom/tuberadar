'use client'
import { useState } from 'react'
import { useApi } from '@/context/ApiContext'
import { fmtNum, timeAgo } from '@/utils/youtube'
import { analyzeReference, analyzeViralFactor } from '@/utils/gemini'

export default function ReferenceStudio() {
  const { ytKey, geminiKey } = useApi()
  const [query, setQuery] = useState('')
  const [videos, setVideos] = useState([])
  const [selected, setSelected] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [viralAnalysis, setViralAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const search = async () => {
    if (!query.trim() || !ytKey) return
    setLoading(true); setError(''); setSelected([]); setAnalysis(null)
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=20&order=viewCount&regionCode=KR&key=${ytKey}`
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const ids = (data.items || []).map(i => i.id.videoId).join(',')
      if (!ids) { setVideos([]); setLoading(false); return }

      const statsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${ids}&key=${ytKey}`
      )
      const statsData = await statsRes.json()
      setVideos(statsData.items || [])
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 10 ? [...prev, id] : prev
    )
  }

  const analyze = async () => {
    if (!selected.length || !geminiKey) return
    setAnalyzing(true); setAnalysis(null)
    try {
      const selectedVideos = videos.filter(v => selected.includes(v.id))
      const titles = selectedVideos.map(v => v.snippet.title)
      const result = await analyzeReference(titles, geminiKey)
      setAnalysis(result)

      // 첫 번째 영상 바이럴 분석
      if (selectedVideos.length > 0) {
        const v = selectedVideos[0]
        const vResult = await analyzeViralFactor(v.snippet.title, v.statistics.viewCount, v.statistics.likeCount, geminiKey)
        setViralAnalysis(vResult)
      }
    } catch (e) { setError(e.message) }
    setAnalyzing(false)
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>🎬 레퍼런스 스튜디오</h1>
        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>참고 영상을 분석해 나만의 콘텐츠 전략을 수립하세요</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input className="input" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="레퍼런스 영상 검색" />
          <button className="btn-primary" onClick={search} disabled={loading || !ytKey}>{loading ? '⏳' : '검색'}</button>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>최대 10개 영상을 선택 후 AI 분석을 실행하세요</p>
      </div>

      {error && <div style={{ color: '#ff0055', marginBottom: 16 }}>⚠️ {error}</div>}

      {videos.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>선택됨: {selected.length}/10</span>
            <button
              className="btn-primary"
              onClick={analyze}
              disabled={selected.length === 0 || analyzing || !geminiKey}
              style={{ opacity: !geminiKey ? 0.5 : 1 }}
            >
              {analyzing ? '✨ 분석 중...' : `✨ ${selected.length}개 AI 분석`}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {videos.map(v => {
              const isSelected = selected.includes(v.id)
              return (
                <div key={v.id} onClick={() => toggleSelect(v.id)} style={{
                  display: 'flex', gap: 12, padding: 12, borderRadius: 10, cursor: 'pointer',
                  border: `1px solid ${isSelected ? '#1337ec' : '#2a2a3a'}`,
                  background: isSelected ? 'rgba(19,55,236,0.1)' : '#16161d',
                  transition: 'all 0.15s',
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${isSelected ? '#1337ec' : '#4b5563'}`, background: isSelected ? '#1337ec' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, fontSize: 12 }}>
                    {isSelected && '✓'}
                  </div>
                  <img src={v.snippet.thumbnails?.medium?.url} alt="" style={{ width: 100, height: 56, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{v.snippet.title}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{v.snippet.channelTitle} • {fmtNum(v.statistics.viewCount)} 조회 • {timeAgo(v.snippet.publishedAt)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {analysis && (
        <div className="fade-in">
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>✨ AI 레퍼런스 분석 결과</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div className="card">
              <div style={{ fontSize: 12, color: '#00f2ff', fontWeight: 600, marginBottom: 8 }}>🔍 공통 패턴</div>
              <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {analysis.patterns?.map((p, i) => <li key={i} style={{ fontSize: 13 }}>{p}</li>)}
              </ul>
            </div>
            <div className="card">
              <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, marginBottom: 8 }}>📐 제목 공식</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{analysis.title_formula}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>🎣 효과적인 훅</div>
              <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {analysis.hooks?.map((h, i) => <li key={i} style={{ fontSize: 13 }}>{h}</li>)}
              </ul>
            </div>
            <div className="card">
              <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, marginBottom: 8 }}>👥 타겟 시청자</div>
              <div style={{ fontSize: 13 }}>{analysis.audience}</div>
            </div>
          </div>
          <div className="card" style={{ borderColor: 'rgba(19,55,236,0.4)' }}>
            <div style={{ fontSize: 12, color: '#1337ec', fontWeight: 600, marginBottom: 10 }}>💡 나만의 영상 아이디어</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analysis.suggestions?.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ background: '#1337ec', color: '#fff', borderRadius: 4, padding: '1px 6px', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i+1}</span>
                  <span style={{ fontSize: 14 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
