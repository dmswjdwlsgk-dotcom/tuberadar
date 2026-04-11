'use client'
import { useState } from 'react'
import { useApi } from '@/context/ApiContext'

const SIZES = [
  { label: 'Max (1280×720)', key: 'maxres', suffix: 'maxresdefault' },
  { label: 'SD (640×480)', key: 'sd', suffix: 'sddefault' },
  { label: 'HQ (480×360)', key: 'hq', suffix: 'hqdefault' },
  { label: 'MQ (320×180)', key: 'mq', suffix: 'mqdefault' },
  { label: 'Default (120×90)', key: 'default', suffix: 'default' },
]

export default function ThumbnailDownload() {
  const { ytKey } = useApi()
  const [url, setUrl] = useState('')
  const [videoId, setVideoId] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const extractId = (input) => {
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtu\.be\/([^?]+)/,
      /youtube\.com\/shorts\/([^?]+)/,
    ]
    for (const p of patterns) {
      const m = input.match(p)
      if (m) return m[1]
    }
    return input.trim()
  }

  const fetch_ = async () => {
    if (!url.trim()) return
    setLoading(true); setError('')
    const id = extractId(url)
    if (!id) { setError('올바른 YouTube URL을 입력해주세요'); setLoading(false); return }

    if (ytKey) {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${ytKey}`
        )
        const data = await res.json()
        if (data.items?.[0]) setVideoTitle(data.items[0].snippet.title)
      } catch {}
    }

    setVideoId(id)
    setLoading(false)
  }

  const getThumbnailUrl = (id, suffix) =>
    `https://img.youtube.com/vi/${id}/${suffix}.jpg`

  const download = async (id, suffix, label) => {
    try {
      const imgUrl = getThumbnailUrl(id, suffix)
      const response = await fetch(imgUrl)
      const blob = await response.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `thumbnail_${id}_${suffix}.jpg`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      // 직접 링크로 열기 (CORS 이슈 시)
      window.open(getThumbnailUrl(id, suffix), '_blank')
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>🖼️ 썸네일 다운로드</h1>
        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>YouTube 영상 썸네일을 다양한 해상도로 다운로드합니다</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetch_()} placeholder="YouTube URL 또는 영상 ID 입력" />
          <button className="btn-primary" onClick={fetch_} disabled={loading}>{loading ? '⏳' : '불러오기'}</button>
        </div>
        {error && <p style={{ margin: '8px 0 0', color: '#ff0055', fontSize: 13 }}>⚠️ {error}</p>}
      </div>

      {videoId && (
        <div className="fade-in">
          {videoTitle && <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 15 }}>🎬 {videoTitle}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {SIZES.map(size => (
              <div key={size.key} className="card">
                <img
                  src={getThumbnailUrl(videoId, size.suffix)}
                  alt={size.label}
                  style={{ width: '100%', borderRadius: 8, marginBottom: 12, background: '#2a2a3a', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{size.label}</span>
                  <button
                    className="btn-primary"
                    style={{ fontSize: 12, padding: '5px 12px' }}
                    onClick={() => download(videoId, size.suffix, size.label)}
                  >
                    ⬇️ 다운로드
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
