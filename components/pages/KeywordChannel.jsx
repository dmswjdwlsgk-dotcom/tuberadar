'use client'
import { useState } from 'react'
import { useApi } from '@/context/ApiContext'
import { fmtNum } from '@/utils/youtube'

export default function KeywordChannel() {
  const { ytKey } = useApi()
  const [keyword, setKeyword] = useState('')
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('subscribers')

  const search = async () => {
    if (!keyword.trim() || !ytKey) return
    setLoading(true); setError('')
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=channel&maxResults=20&regionCode=KR&key=${ytKey}`
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)

      const ids = (data.items || []).map(i => i.snippet.channelId).join(',')
      if (!ids) { setChannels([]); setLoading(false); return }

      const statsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${ids}&key=${ytKey}`
      )
      const statsData = await statsRes.json()
      setChannels(statsData.items || [])
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const sorted = [...channels].sort((a, b) => {
    if (sortBy === 'subscribers') return (+b.statistics.subscriberCount) - (+a.statistics.subscriberCount)
    if (sortBy === 'views') return (+b.statistics.viewCount) - (+a.statistics.viewCount)
    if (sortBy === 'videos') return (+b.statistics.videoCount) - (+a.statistics.videoCount)
    return 0
  })

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>🔎 키워드 채널 찾기</h1>
        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>키워드로 관련 채널을 검색하고 비교합니다</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="채널 키워드 검색 (예: 요리, 여행, IT)" />
          <button className="btn-primary" onClick={search} disabled={loading || !ytKey}>{loading ? '⏳' : '검색'}</button>
        </div>
        {error && <p style={{ margin: '8px 0 0', color: '#ff0055', fontSize: 13 }}>⚠️ {error}</p>}
      </div>

      {channels.length > 0 && (
        <div className="fade-in">
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: '#6b7280', alignSelf: 'center' }}>정렬:</span>
            {[['subscribers', '구독자순'], ['views', '조회수순'], ['videos', '영상수순']].map(([v, l]) => (
              <button key={v} className={sortBy === v ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setSortBy(v)}>{l}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sorted.map((ch, idx) => (
              <a key={ch.id} href={`https://youtube.com/channel/${ch.id}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#1337ec'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a3a'}
                >
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#4b5563', minWidth: 24 }}>{idx + 1}</div>
                  <img src={ch.snippet.thumbnails?.medium?.url || ch.snippet.thumbnails?.default?.url} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{ch.snippet.title}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.snippet.description?.slice(0, 80) || '-'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{fmtNum(ch.statistics.subscriberCount)}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>구독자</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{fmtNum(ch.statistics.viewCount)}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>조회수</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{fmtNum(ch.statistics.videoCount)}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>영상</div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
