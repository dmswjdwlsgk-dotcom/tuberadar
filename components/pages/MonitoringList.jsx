'use client'
import { useState, useEffect } from 'react'
import { useApi } from '@/context/ApiContext'
import { getChannelInfo, fmtNum, timeAgo } from '@/utils/youtube'

const STORAGE_KEY = 'tr_monitoring'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}
function save(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

export default function MonitoringList() {
  const { ytKey } = useApi()
  const [channels, setChannels] = useState(load)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const addChannel = async () => {
    if (!input.trim() || !ytKey) return
    setLoading(true); setError('')
    try {
      let id = input.trim()
      // URL에서 채널 ID 추출
      const urlMatch = id.match(/youtube\.com\/channel\/(UC[A-Za-z0-9_-]+)/)
      if (urlMatch) id = urlMatch[1]
      const handleMatch = id.match(/youtube\.com\/@([^/?]+)/)
      if (handleMatch) id = '@' + handleMatch[1]

      // @handle이면 검색으로 ID 찾기
      if (id.startsWith('@') || !id.startsWith('UC')) {
        const q = id.startsWith('@') ? id.slice(1) : id
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(q)}&maxResults=1&key=${ytKey}`
        )
        const d = await res.json()
        if (d.error) throw new Error(d.error.message)
        if (!d.items?.length) throw new Error('채널을 찾을 수 없습니다')
        id = d.items[0].snippet.channelId
      }

      if (channels.find(c => c.id === id)) { setError('이미 추가된 채널입니다'); setLoading(false); return }

      const ch = await getChannelInfo(id, ytKey)
      if (!ch) throw new Error('채널 정보를 가져올 수 없습니다')

      const entry = {
        id: ch.id,
        title: ch.snippet.title,
        thumbnail: ch.snippet.thumbnails?.medium?.url || ch.snippet.thumbnails?.default?.url,
        subscribers: ch.statistics.subscriberCount,
        views: ch.statistics.viewCount,
        videoCount: ch.statistics.videoCount,
        addedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      }
      const updated = [...channels, entry]
      setChannels(updated); save(updated); setInput('')
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const removeChannel = (id) => {
    const updated = channels.filter(c => c.id !== id)
    setChannels(updated); save(updated)
  }

  const refreshAll = async () => {
    if (!ytKey || !channels.length) return
    setRefreshing(true)
    try {
      const updated = await Promise.all(
        channels.map(async ch => {
          try {
            const info = await getChannelInfo(ch.id, ytKey)
            if (!info) return ch
            return {
              ...ch,
              subscribers: info.statistics.subscriberCount,
              views: info.statistics.viewCount,
              videoCount: info.statistics.videoCount,
              lastUpdated: new Date().toISOString(),
            }
          } catch { return ch }
        })
      )
      setChannels(updated); save(updated)
    } catch {}
    setRefreshing(false)
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>📋 내 모니터링 리스트</h1>
        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>관심 채널을 등록하고 통계를 한눈에 확인하세요</p>
      </div>

      {/* 추가 */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addChannel()}
            placeholder="채널 ID, @핸들, 또는 YouTube URL 입력"
          />
          <button className="btn-primary" onClick={addChannel} disabled={loading || !ytKey}>
            {loading ? '⏳' : '+ 추가'}
          </button>
        </div>
        {error && <p style={{ margin: '8px 0 0', color: '#ff0055', fontSize: 13 }}>⚠️ {error}</p>}
      </div>

      {/* 목록 */}
      {channels.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button className="btn-secondary" onClick={refreshAll} disabled={refreshing}>
            {refreshing ? '⏳ 새로고침 중...' : '🔄 전체 새로고침'}
          </button>
        </div>
      )}

      {channels.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: '#4b5563' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 15 }}>아직 등록된 채널이 없습니다</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>채널 ID나 @핸들을 입력해서 추가해보세요</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {channels.map(ch => (
            <div key={ch.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <img src={ch.thumbnail} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', background: '#2a2a3a' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>마지막 업데이트: {timeAgo(ch.lastUpdated)}</div>
              </div>
              <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
                <Stat label="구독자" value={fmtNum(ch.subscribers)} />
                <Stat label="조회수" value={fmtNum(ch.views)} />
                <Stat label="영상" value={fmtNum(ch.videoCount)} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href={`https://youtube.com/channel/${ch.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  보기
                </a>
                <button
                  className="btn-secondary"
                  style={{ fontSize: 12, padding: '6px 10px', color: '#ff0055', borderColor: 'rgba(255,0,85,0.3)' }}
                  onClick={() => removeChannel(ch.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#6b7280' }}>{label}</div>
    </div>
  )
}
