'use client'
import { useState, useEffect } from 'react'

const COMMUNITIES = [
  { id: 'clien',      label: '클리앙',      icon: '🖥️', color: '#10b981' },
  { id: 'ruliweb',    label: '루리웹',      icon: '🎮', color: '#6366f1' },
  { id: 'dcinside',   label: '디시인사이드', icon: '📋', color: '#3b82f6' },
  { id: 'theqoo',     label: '더쿠',        icon: '💗', color: '#ec4899' },
  { id: 'arca_live',  label: '아카라이브',  icon: '🌿', color: '#14b8a6' },
  { id: 'ppomppu',    label: '뽐뿌',        icon: '🛒', color: '#f97316' },
  { id: 'inven',      label: '인벤',        icon: '⚔️', color: '#22c55e' },
  { id: 'mlbpark',    label: '엠팍',        icon: '⚾', color: '#ef4444' },
  { id: 'nate_pann',  label: '네이트 판',   icon: '💬', color: '#a855f7' },
  { id: 'bobaedream', label: '보배드림',    icon: '🚗', color: '#06b6d4' },
  { id: 'humoruniv',  label: '웃긴대학',    icon: '😂', color: '#eab308' },
  { id: 'cook82',     label: '82쿡',        icon: '🍳', color: '#f43f5e' },
  { id: 'todayhumor', label: '오늘의유머',  icon: '🤣', color: '#d946ef' },
  { id: 'slrclub',    label: 'SLR클럽',     icon: '📷', color: '#6b7280' },
  { id: 'gasengi',    label: '가생이',      icon: '🌐', color: '#78716c' },
]

function timeAgo(dateStr) {
  if (!dateStr) return ''
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return '방금'
    if (m < 60) return `${m}분 전`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}시간 전`
    return `${Math.floor(h / 24)}일 전`
  } catch { return dateStr }
}

export default function CommunityPosts() {
  const [selected, setSelected] = useState('clien')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  const comm = COMMUNITIES.find(c => c.id === selected)

  const fetchPosts = async (id, force = false) => {
    setLoading(true); setError(''); setPosts([])
    try {
      const res = await fetch(`/api/community?id=${id}${force ? '&force=true' : ''}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '불러오기 실패')
      setPosts(data.posts || [])
      setLastUpdated(new Date(data.updated_at))
      if (data.error) setError(`⚠️ 일부 오류: ${data.error}`)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(() => { fetchPosts(selected) }, [selected])

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>💬 커뮤니티 핫게시글</h1>
          <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>
            국내 커뮤니티 실시간 인기 게시글
            {lastUpdated && <span> · {lastUpdated.toLocaleTimeString()} 기준</span>}
          </p>
        </div>
        <button className="btn-secondary" onClick={() => fetchPosts(selected, true)} disabled={loading}>
          {loading ? '⏳' : '🔄 새로고침'}
        </button>
      </div>

      {/* 커뮤니티 탭 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {COMMUNITIES.map(c => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 14px', borderRadius: 20, border: '1px solid',
              borderColor: selected === c.id ? c.color : '#2a2a3a',
              background: selected === c.id ? c.color + '25' : '#1e1e28',
              color: selected === c.id ? '#fff' : '#94a3b8',
              cursor: 'pointer', fontSize: 13,
              fontWeight: selected === c.id ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'rgba(255,0,85,0.3)', marginBottom: 16 }}>
          <p style={{ margin: 0, color: '#ff0055', fontSize: 13 }}>⚠️ {error}</p>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6b7280' }}>
            사이트 구조 변경 또는 접근 차단으로 스크래핑이 실패했을 수 있습니다.
          </p>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>
          <div className="spin" style={{ fontSize: 32 }}>{comm?.icon}</div>
          <div style={{ marginTop: 12 }}>{comm?.label} 게시글 불러오는 중...</div>
        </div>
      ) : posts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {posts.map((post, idx) => (
            <a
              key={idx}
              href={post.link}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '13px 14px', borderRadius: 8,
                  border: '1px solid transparent', transition: 'all 0.12s', cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#16161d'; e.currentTarget.style.borderColor = '#2a2a3a' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#4b5563', minWidth: 26, paddingTop: 2 }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.title}
                  </div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#4b5563', flexWrap: 'wrap' }}>
                    <span>{comm?.icon} {comm?.label}</span>
                    {post.author && <span>· {post.author}</span>}
                    {post.time && <span>· {timeAgo(post.time) || post.time}</span>}
                    {post.views && <span>· 조회 {post.views}</span>}
                    {post.likes && <span>· 추천 {post.likes}</span>}
                  </div>
                </div>
                <span style={{ color: '#4b5563', fontSize: 14, paddingTop: 3, flexShrink: 0 }}>→</span>
              </div>
            </a>
          ))}
        </div>
      ) : !loading && !error ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#4b5563' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{comm?.icon}</div>
          <div>게시글을 가져올 수 없습니다</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>새로고침을 눌러보거나 다른 커뮤니티를 선택해주세요</div>
        </div>
      ) : null}
    </div>
  )
}
