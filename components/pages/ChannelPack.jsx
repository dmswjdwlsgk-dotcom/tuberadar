'use client'
import { useState } from 'react'
import { useApi } from '@/context/ApiContext'
import { getChannelRecommendations } from '@/utils/gemini'
import { searchChannels, fmtNum } from '@/utils/youtube'

const CATEGORIES = ['게임', '먹방', '여행', '교육', 'IT/기술', '뷰티', '운동/건강', '재테크', '음악', '요리', '육아', '반려동물', '뉴스', '엔터테인먼트']

export default function ChannelPack() {
  const { ytKey, geminiKey } = useApi()
  const [selectedCat, setSelectedCat] = useState('게임')
  const [aiRecs, setAiRecs] = useState([])
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    setLoading(true); setError(''); setAiRecs([]); setChannels([])
    try {
      if (geminiKey) {
        const recs = await getChannelRecommendations(selectedCat, geminiKey)
        setAiRecs(recs)
      }
      if (ytKey) {
        const results = await searchChannels(selectedCat, ytKey, 10)
        // 채널 상세 정보
        const ids = results.map(r => r.snippet.channelId).join(',')
        if (ids) {
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${ids}&key=${ytKey}`
          )
          const data = await res.json()
          setChannels(data.items || [])
        }
      }
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>📦 추천 채널 팩</h1>
        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>카테고리별 추천 채널 묶음과 AI 분석</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setSelectedCat(c)} style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid', borderColor: selectedCat === c ? '#1337ec' : '#2a2a3a', background: selectedCat === c ? '#1337ec' : '#1e1e28', color: selectedCat === c ? '#fff' : '#94a3b8', cursor: 'pointer', fontSize: 13 }}>
              {c}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={generate} disabled={loading || (!ytKey && !geminiKey)}>
          {loading ? '⏳ 분석 중...' : `📦 ${selectedCat} 채널 팩 생성`}
        </button>
        {error && <p style={{ margin: '8px 0 0', color: '#ff0055', fontSize: 13 }}>⚠️ {error}</p>}
      </div>

      {/* 실제 채널 목록 */}
      {channels.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 600 }}>🔴 유튜브 인기 채널 ({selectedCat})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {channels.map(ch => (
              <a key={ch.id} href={`https://youtube.com/channel/${ch.id}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#1337ec'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a3a'}
                >
                  <img src={ch.snippet.thumbnails?.medium?.url} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', marginBottom: 8 }} />
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.snippet.title}</div>
                  <div style={{ fontSize: 13, color: '#00f2ff', fontWeight: 700 }}>{fmtNum(ch.statistics.subscriberCount)}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>구독자</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* AI 추천 채널 타입 */}
      {aiRecs.length > 0 && (
        <div>
          <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 600 }}>✨ AI 추천 채널 유형</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {aiRecs.map((rec, i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                  <div style={{ background: '#1337ec', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700, height: 'fit-content' }}>#{i+1}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{rec.type}</div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>{rec.description}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: rec.growth_potential >= 80 ? '#00f2ff' : '#1337ec' }}>{rec.growth_potential}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>성장지수</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span className="tag">📅 {rec.upload_frequency}</span>
                  <span className="tag">🎬 {rec.content_style}</span>
                  {rec.keywords?.map(k => <span key={k} className="tag-neon">{k}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
