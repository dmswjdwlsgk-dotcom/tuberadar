'use client'
import { useState } from 'react'
import { useApi } from '@/context/ApiContext'
import { fmtNum, timeAgo } from '@/utils/youtube'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function KeywordContent() {
  const { ytKey } = useApi()
  const [keyword, setKeyword] = useState('')
  const [videos, setVideos] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = async () => {
    if (!keyword.trim() || !ytKey) return
    setLoading(true); setError('')
    try {
      // 검색
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&maxResults=20&order=viewCount&regionCode=KR&key=${ytKey}`
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const ids = (data.items || []).map(i => i.id.videoId).join(',')
      if (!ids) { setVideos([]); setStats(null); setLoading(false); return }

      // 상세 통계
      const statsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${ids}&key=${ytKey}`
      )
      const statsData = await statsRes.json()
      const items = statsData.items || []
      setVideos(items)

      // 통계 요약
      const views = items.map(v => +v.statistics.viewCount)
      const avg = views.reduce((a, b) => a + b, 0) / views.length
      const max = Math.max(...views)
      setStats({ avg, max, count: items.length, views })
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const chartData = stats ? stats.views.slice(0, 10).map((v, i) => ({
    name: `#${i + 1}`,
    views: v
  })) : []

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>🔍 키워드 소재 탐색</h1>
        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>키워드별 인기 영상과 조회수 분포를 분석합니다</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="탐색할 키워드 입력 (예: 요리, 게임, 먹방)" />
          <button className="btn-primary" onClick={search} disabled={loading || !ytKey}>
            {loading ? '⏳' : '탐색'}
          </button>
        </div>
        {error && <p style={{ margin: '8px 0 0', color: '#ff0055', fontSize: 13 }}>⚠️ {error}</p>}
      </div>

      {stats && (
        <div className="fade-in">
          {/* 요약 카드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#00f2ff' }}>{fmtNum(stats.max)}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>최고 조회수</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1337ec' }}>{fmtNum(Math.round(stats.avg))}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>평균 조회수</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>{stats.count}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>분석 영상 수</div>
            </div>
          </div>

          {/* 차트 */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>조회수 분포 (상위 10개)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => fmtNum(v)} />
                <Tooltip formatter={v => fmtNum(v)} contentStyle={{ background: '#16161d', border: '1px solid #2a2a3a' }} />
                <Bar dataKey="views" fill="#1337ec" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 영상 목록 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {videos.map((v, idx) => {
              const s = v.snippet, st = v.statistics
              const views = +st.viewCount
              return (
                <a key={v.id} href={`https://youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card" style={{ display: 'flex', gap: 14, cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#1337ec'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a3a'}
                  >
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#4b5563', minWidth: 24 }}>{idx + 1}</div>
                    <img src={s.thumbnails?.medium?.url} alt="" style={{ width: 110, height: 62, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{s.channelTitle} • {timeAgo(s.publishedAt)}</div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: views > 1000000 ? '#00f2ff' : '#e2e8f0' }}>{fmtNum(views)}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>조회수</div>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
