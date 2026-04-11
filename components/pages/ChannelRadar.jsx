'use client'
import { useState, useEffect } from 'react'
import { useApi } from '@/context/ApiContext'
import { fmtNum, CATEGORY_MAP } from '@/utils/youtube'

export default function ChannelRadar() {
  const { ytKey } = useApi()
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  const CATEGORIES = Object.entries(CATEGORY_MAP).map(([id, name]) => ({ id, name }))

  const fetchRadar = async () => {
    if (!ytKey) return
    setLoading(true); setError('')
    try {
      // 인기 영상에서 채널 추출
      let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=KR&maxResults=50&key=${ytKey}`
      if (selectedCat) url += `&videoCategoryId=${selectedCat}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)

      // 채널별로 집계
      const channelMap = new Map()
      ;(data.items || []).forEach(v => {
        const cid = v.snippet.channelId
        if (!channelMap.has(cid)) {
          channelMap.set(cid, {
            id: cid,
            title: v.snippet.channelTitle,
            totalViews: 0,
            maxViews: 0,
            videoCount: 0,
            category: CATEGORY_MAP[v.snippet.categoryId] || '기타',
          })
        }
        const ch = channelMap.get(cid)
        const views = +v.statistics.viewCount
        ch.totalViews += views
        ch.maxViews = Math.max(ch.maxViews, views)
        ch.videoCount++
      })

      // 채널 구독자 정보 가져오기
      const ids = [...channelMap.keys()].slice(0, 20).join(',')
      const chRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${ids}&key=${ytKey}`
      )
      const chData = await chRes.json()
      ;(chData.items || []).forEach(ch => {
        const entry = channelMap.get(ch.id)
        if (entry) {
          entry.subscribers = +ch.statistics.subscriberCount
          entry.thumbnail = ch.snippet.thumbnails?.medium?.url
        }
      })

      const result = [...channelMap.values()].filter(c => c.subscribers)
        .sort((a, b) => b.totalViews - a.totalViews)
      setChannels(result)
      setLastUpdated(new Date())
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  useEffect(() => { if (ytKey) fetchRadar() }, [ytKey, selectedCat])

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>📡 채널 급등 레이더</h1>
          <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>
            현재 유튜브 인기 영상에서 활발한 채널을 감지합니다
            {lastUpdated && <span> • {lastUpdated.toLocaleTimeString()} 기준</span>}
          </p>
        </div>
        <button className="btn-secondary" onClick={fetchRadar} disabled={loading}>
          {loading ? '⏳' : '🔄 새로고침'}
        </button>
      </div>

      {/* 카테고리 필터 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button onClick={() => setSelectedCat('')} style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid', borderColor: !selectedCat ? '#1337ec' : '#2a2a3a', background: !selectedCat ? '#1337ec' : '#1e1e28', color: !selectedCat ? '#fff' : '#94a3b8', cursor: 'pointer', fontSize: 12 }}>
          전체
        </button>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setSelectedCat(c.id)} style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid', borderColor: selectedCat === c.id ? '#1337ec' : '#2a2a3a', background: selectedCat === c.id ? '#1337ec' : '#1e1e28', color: selectedCat === c.id ? '#fff' : '#94a3b8', cursor: 'pointer', fontSize: 12 }}>
            {c.name}
          </button>
        ))}
      </div>

      {error && <div style={{ color: '#ff0055', marginBottom: 16 }}>⚠️ {error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>
          <div className="spin" style={{ display: 'inline-block', fontSize: 32 }}>📡</div>
          <div style={{ marginTop: 12 }}>레이더 스캔 중...</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {channels.map((ch, idx) => (
            <a key={ch.id} href={`https://youtube.com/channel/${ch.id}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.15s', position: 'relative' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#1337ec'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a3a'}
              >
                {idx < 3 && (
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <span className="viral-badge">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} TOP{idx+1}</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                  {ch.thumbnail && <img src={ch.thumbnail} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.title}</div>
                    <div className="tag" style={{ fontSize: 11, display: 'inline-block', marginTop: 3 }}>{ch.category}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
                  <div style={{ background: '#1e1e28', borderRadius: 8, padding: '8px 4px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#00f2ff' }}>{fmtNum(ch.subscribers)}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>구독자</div>
                  </div>
                  <div style={{ background: '#1e1e28', borderRadius: 8, padding: '8px 4px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1337ec' }}>{fmtNum(ch.totalViews)}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>인기영상 조회</div>
                  </div>
                  <div style={{ background: '#1e1e28', borderRadius: 8, padding: '8px 4px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{ch.videoCount}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>인기 영상</div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
