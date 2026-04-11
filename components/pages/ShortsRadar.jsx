'use client'
import { useState, useEffect } from 'react'
import { useApi } from '@/context/ApiContext'
import { fmtNum, timeAgo } from '@/utils/youtube'

export default function ShortsRadar() {
  const { ytKey } = useApi()
  const [query, setQuery] = useState('#shorts')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const PRESETS = ['#shorts', '쇼츠', '먹방 shorts', '게임 shorts', '일상 shorts', '챌린지 shorts', 'ASMR shorts']

  const search = async (q) => {
    if (!ytKey) return
    setLoading(true); setError('')
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&videoDuration=short&maxResults=50&order=viewCount&regionCode=KR&key=${ytKey}`
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const ids = (data.items || []).map(i => i.id.videoId).join(',')
      if (!ids) { setVideos([]); setLoading(false); return }

      const statsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${ids}&key=${ytKey}`
      )
      const statsData = await statsRes.json()
      // Shorts 필터: duration <= 60초
      const shorts = (statsData.items || []).filter(v => {
        const d = v.contentDetails?.duration || ''
        const m = d.match(/PT(?:(\d+)M)?(?:(\d+)S)?/)
        if (!m) return false
        const mins = parseInt(m[1] || 0), secs = parseInt(m[2] || 0)
        return mins === 0 && secs <= 60
      })
      setVideos(shorts)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  useEffect(() => { if (ytKey) search(query) }, [ytKey])

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>⚡ 자동 탐색 (Shorts)</h1>
        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>실시간 인기 쇼츠 자동 탐색</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input className="input" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search(query)} placeholder="키워드 검색" />
          <button className="btn-primary" onClick={() => search(query)} disabled={loading}>검색</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESETS.map(p => (
            <button key={p} className={query === p ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: 12, padding: '4px 10px' }}
              onClick={() => { setQuery(p); search(p) }}>{p}</button>
          ))}
        </div>
      </div>

      {error && <div style={{ color: '#ff0055', marginBottom: 16 }}>⚠️ {error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>
          <div className="spin" style={{ display: 'inline-block', fontSize: 32 }}>⚡</div>
          <div style={{ marginTop: 12 }}>쇼츠 탐색 중...</div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 12, color: '#6b7280', fontSize: 13 }}>
            {videos.length}개 쇼츠 발견
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {videos.map((v, idx) => {
              const s = v.snippet, st = v.statistics
              const views = +st.viewCount
              const isViral = views > 100000
              return (
                <a key={v.id} href={`https://youtube.com/shorts/${v.id}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card" style={{ padding: 12, cursor: 'pointer', transition: 'border-color 0.15s', position: 'relative' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#1337ec'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a3a'}
                  >
                    {isViral && <div style={{ position: 'absolute', top: 8, right: 8 }}><span className="viral-badge">🔥</span></div>}
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 4 }}>#{idx+1}</div>
                    <img src={s.thumbnails?.medium?.url || s.thumbnails?.default?.url} alt="" style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover', borderRadius: 6, marginBottom: 8, background: '#2a2a3a' }} />
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{s.channelTitle}</div>
                    <div className={isViral ? 'tag-neon' : 'tag'} style={{ display: 'inline-block' }}>{fmtNum(views)}</div>
                  </div>
                </a>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
