'use client'
import { useState, useEffect } from 'react'
import { useApi } from '@/context/ApiContext'
import { getTrendingVideos, fmtNum, timeAgo, CATEGORY_MAP } from '@/utils/youtube'

const COUNTRIES = [
  { code: 'KR', name: '🇰🇷 한국' },
  { code: 'US', name: '🇺🇸 미국' },
  { code: 'JP', name: '🇯🇵 일본' },
  { code: 'GB', name: '🇬🇧 영국' },
  { code: 'DE', name: '🇩🇪 독일' },
  { code: 'FR', name: '🇫🇷 프랑스' },
  { code: 'IN', name: '🇮🇳 인도' },
  { code: 'BR', name: '🇧🇷 브라질' },
  { code: 'CA', name: '🇨🇦 캐나다' },
  { code: 'AU', name: '🇦🇺 호주' },
  { code: 'MX', name: '🇲🇽 멕시코' },
  { code: 'TH', name: '🇹🇭 태국' },
]

export default function CountryTrend() {
  const { ytKey } = useApi()
  const [selectedCountry, setSelectedCountry] = useState('KR')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!ytKey) return
    setLoading(true); setError('')
    getTrendingVideos(ytKey, selectedCountry, '', 50)
      .then(data => { setVideos(data.items || []) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [ytKey, selectedCountry])

  const countryName = COUNTRIES.find(c => c.code === selectedCountry)?.name || selectedCountry

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>🌍 실시간 국가 트렌드</h1>
        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>국가별 실시간 인기 영상 Top 50</p>
      </div>

      {/* 국가 선택 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {COUNTRIES.map(c => (
          <button
            key={c.code}
            onClick={() => setSelectedCountry(c.code)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: '1px solid',
              borderColor: selectedCountry === c.code ? '#1337ec' : '#2a2a3a',
              background: selectedCountry === c.code ? '#1337ec' : '#1e1e28',
              color: selectedCountry === c.code ? '#fff' : '#94a3b8',
              cursor: 'pointer', fontSize: 13, fontWeight: selectedCountry === c.code ? 600 : 400,
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {error && <div style={{ color: '#ff0055', marginBottom: 16 }}>⚠️ {error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>
          <div style={{ fontSize: 32, marginBottom: 12, display: 'inline-block' }} className="spin">🌍</div>
          <div>{countryName} 트렌드 로딩 중...</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {videos.map((v, idx) => {
            const s = v.snippet, st = v.statistics
            const views = +st.viewCount
            const isViral = views > 1000000
            return (
              <a
                key={v.id}
                href={`https://youtube.com/watch?v=${v.id}`}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.15s', height: '100%' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#1337ec'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a3a'}
                >
                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    <img
                      src={s.thumbnails?.medium?.url}
                      alt=""
                      style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8, background: '#2a2a3a' }}
                    />
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                      #{idx + 1}
                    </div>
                    {isViral && (
                      <div style={{ position: 'absolute', top: 8, right: 8 }}>
                        <span className="viral-badge">VIRAL</span>
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{s.channelTitle} • {timeAgo(s.publishedAt)}</div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span className={isViral ? 'tag-neon' : 'tag'}>{fmtNum(views)} 조회</span>
                    <span className="tag">{CATEGORY_MAP[s.categoryId] || '기타'}</span>
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
