'use client'
import { useState, useEffect, useCallback } from 'react'
import { useApi } from '@/context/ApiContext'
import { getTrendingVideos, getVideoCategories, fmtNum, timeAgo, CATEGORY_MAP } from '@/utils/youtube'

export default function CategoryTrend() {
  const { ytKey } = useApi()
  const [categories, setCategories] = useState([])
  const [selectedCat, setSelectedCat] = useState('')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    if (!ytKey) return
    getVideoCategories(ytKey).then(data => {
      const cats = (data.items || []).filter(c => c.snippet.assignable)
      setCategories(cats)
    }).catch(() => {})
  }, [ytKey])

  const fetchTrending = useCallback(async (catId) => {
    if (!ytKey) return
    setLoading(true); setError('')
    try {
      const data = await getTrendingVideos(ytKey, 'KR', catId, 50)
      setVideos(data.items || [])
      setLastUpdated(new Date())
    } catch (e) { setError(e.message) }
    setLoading(false)
  }, [ytKey])

  useEffect(() => {
    if (ytKey) fetchTrending(selectedCat)
  }, [ytKey, selectedCat])

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>📊 실시간 카테고리 트렌드</h1>
          <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>
            YouTube 카테고리별 실시간 인기 영상 • KR
            {lastUpdated && <span> • {lastUpdated.toLocaleTimeString()} 기준</span>}
          </p>
        </div>
        <button className="btn-secondary" onClick={() => fetchTrending(selectedCat)} disabled={loading}>
          {loading ? '⏳' : '🔄 새로고침'}
        </button>
      </div>

      {/* 카테고리 탭 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button
          onClick={() => setSelectedCat('')}
          style={{
            padding: '6px 14px', borderRadius: 20, border: '1px solid',
            borderColor: selectedCat === '' ? '#1337ec' : '#2a2a3a',
            background: selectedCat === '' ? '#1337ec' : '#1e1e28',
            color: selectedCat === '' ? '#fff' : '#94a3b8',
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}
        >
          전체
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: '1px solid',
              borderColor: selectedCat === cat.id ? '#1337ec' : '#2a2a3a',
              background: selectedCat === cat.id ? '#1337ec' : '#1e1e28',
              color: selectedCat === cat.id ? '#fff' : '#94a3b8',
              cursor: 'pointer', fontSize: 13,
            }}
          >
            {cat.snippet.title}
          </button>
        ))}
      </div>

      {error && <div style={{ color: '#ff0055', marginBottom: 16, fontSize: 14 }}>⚠️ {error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>
          <div style={{ fontSize: 32, marginBottom: 12, display: 'inline-block' }} className="spin">⏳</div>
          <div>트렌드 분석 중...</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {videos.map((v, idx) => {
            const s = v.snippet, st = v.statistics
            const views = +st.viewCount, likes = +st.likeCount
            const isViral = views > 500000
            return (
              <a
                key={v.id}
                href={`https://youtube.com/watch?v=${v.id}`}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#1337ec'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a3a'}
                >
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#4b5563', minWidth: 28, textAlign: 'center' }}>{idx + 1}</div>
                  <img
                    src={s.thumbnails?.medium?.url || s.thumbnails?.default?.url}
                    alt=""
                    style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 6, flexShrink: 0, background: '#2a2a3a' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      {isViral && <span className="viral-badge">VIRAL</span>}
                      <span className="tag" style={{ fontSize: 11 }}>{CATEGORY_MAP[s.categoryId] || '기타'}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{s.channelTitle} • {timeAgo(s.publishedAt)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: isViral ? '#00f2ff' : '#e2e8f0' }}>{fmtNum(views)}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>조회수</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{fmtNum(likes)}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>좋아요</div>
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
