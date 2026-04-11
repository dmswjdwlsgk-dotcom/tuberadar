'use client'
import { useState } from 'react'
import { useApi } from '@/context/ApiContext'
import { getContentIdeas } from '@/utils/gemini'

export default function ContentIdeas() {
  const { geminiKey } = useApi()
  const [keyword, setKeyword] = useState('')
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(null)

  const PRESETS = ['먹방', '여행', '게임', '공부', 'IT/테크', '재테크', '운동', '뷰티', '육아', '반려동물']

  const generate = async (kw) => {
    if (!kw.trim() || !geminiKey) return
    setLoading(true); setError(''); setIdeas([])
    try {
      const result = await getContentIdeas(kw, geminiKey)
      setIdeas(result)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>💡 유튜브 추천 소재</h1>
        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>AI가 트렌드를 분석해 콘텐츠 아이디어를 추천합니다</p>
      </div>

      {!geminiKey && (
        <div className="card" style={{ borderColor: 'rgba(255,0,85,0.3)', marginBottom: 20 }}>
          <p style={{ margin: 0, color: '#ff0055', fontSize: 14 }}>⚠️ Gemini API 키가 필요합니다. 우측 상단 ⚙️ 설정에서 입력해주세요.</p>
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input className="input" value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && generate(keyword)} placeholder="콘텐츠 키워드 입력 (예: 먹방, 게임, 여행)" />
          <button className="btn-primary" onClick={() => generate(keyword)} disabled={loading || !geminiKey}>{loading ? '✨ 생성 중...' : 'AI 추천'}</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESETS.map(p => (
            <button key={p} className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => { setKeyword(p); generate(p) }}>{p}</button>
          ))}
        </div>
      </div>

      {error && <div style={{ color: '#ff0055', marginBottom: 16, fontSize: 14 }}>⚠️ {error}</div>}

      {loading && (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
          <div>AI가 콘텐츠 아이디어를 생성하고 있습니다...</div>
        </div>
      )}

      {ideas.length > 0 && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ideas.map((idea, i) => (
            <div key={i} className="card" style={{ cursor: 'pointer', transition: 'border-color 0.15s', borderColor: expanded === i ? '#1337ec' : '#2a2a3a' }}
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ background: '#1337ec', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>#{i + 1}</span>
                    {idea.viral_score >= 80 && <span className="viral-badge">🔥 VIRAL {idea.viral_score}</span>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{idea.title}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>{idea.reason}</div>
                </div>
                <div style={{ fontSize: 20, color: '#6b7280', flexShrink: 0 }}>
                  {expanded === i ? '▲' : '▼'}
                </div>
              </div>

              {/* 바이럴 점수 바 */}
              <div style={{ marginTop: 12, background: '#1e1e28', borderRadius: 4, height: 4 }}>
                <div style={{ height: '100%', borderRadius: 4, width: `${idea.viral_score || 0}%`, background: idea.viral_score >= 80 ? '#ff0055' : '#1337ec', transition: 'width 0.5s' }} />
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>바이럴 예상 점수: {idea.viral_score}/100</div>

              {expanded === i && (
                <div className="fade-in" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {idea.hook && (
                    <div style={{ background: '#1e1e28', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontSize: 12, color: '#00f2ff', fontWeight: 600, marginBottom: 6 }}>🎣 도입부 훅</div>
                      <div style={{ fontSize: 14 }}>"{idea.hook}"</div>
                    </div>
                  )}
                  {idea.points?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>📌 핵심 포인트</div>
                      <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {idea.points.map((p, j) => <li key={j} style={{ fontSize: 14 }}>{p}</li>)}
                      </ul>
                    </div>
                  )}
                  {idea.thumbnail_tip && (
                    <div style={{ background: 'rgba(255,0,85,0.08)', border: '1px solid rgba(255,0,85,0.2)', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#ff0055', fontWeight: 600, marginBottom: 4 }}>🖼️ 썸네일 팁</div>
                      <div style={{ fontSize: 13 }}>{idea.thumbnail_tip}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
