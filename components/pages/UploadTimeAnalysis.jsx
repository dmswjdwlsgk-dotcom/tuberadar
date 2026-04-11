'use client'
import { useState } from 'react'
import { useApi } from '@/context/ApiContext'
import { fmtNum } from '@/utils/youtube'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const HOURS = Array.from({ length: 24 }, (_, i) => `${i}시`)

export default function UploadTimeAnalysis() {
  const { ytKey } = useApi()
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyze = async () => {
    if (!input.trim() || !ytKey) return
    setLoading(true); setError('')
    try {
      let id = input.trim()
      if (!id.startsWith('UC')) {
        const q = id.startsWith('@') ? id.slice(1) : id
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(q)}&maxResults=1&key=${ytKey}`
        )
        const d = await res.json()
        if (d.error) throw new Error(d.error.message)
        if (d.items?.length) id = d.items[0].snippet.channelId
      }

      // 채널 정보로 uploads 플레이리스트 찾기
      const chRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=${id}&key=${ytKey}`
      )
      const chData = await chRes.json()
      if (chData.error) throw new Error(chData.error.message)
      const ch = chData.items?.[0]
      if (!ch) throw new Error('채널을 찾을 수 없습니다')

      const uploadsId = ch.contentDetails?.relatedPlaylists?.uploads
      if (!uploadsId) throw new Error('업로드 플레이리스트를 찾을 수 없습니다')

      // 최근 50개 영상 가져오기
      const plRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsId}&maxResults=50&key=${ytKey}`
      )
      const plData = await plRes.json()
      if (plData.error) throw new Error(plData.error.message)
      const items = plData.items || []

      // 통계 계산
      const dayCount = Array(7).fill(0)
      const hourCount = Array(24).fill(0)
      const dayViews = Array(7).fill(0)
      const dayViewsCount = Array(7).fill(0)
      const videoIds = []

      items.forEach(item => {
        const date = new Date(item.snippet.publishedAt)
        const day = date.getDay(), hour = date.getHours()
        dayCount[day]++
        hourCount[hour]++
        videoIds.push(item.contentDetails?.videoId || item.snippet?.resourceId?.videoId)
      })

      // 영상 통계 가져오기
      if (videoIds.length > 0) {
        const vRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.filter(Boolean).join(',')}&key=${ytKey}`
        )
        const vData = await vRes.json()
        ;(vData.items || []).forEach(v => {
          const date = new Date(v.snippet.publishedAt)
          const day = date.getDay()
          dayViews[day] += +v.statistics.viewCount
          dayViewsCount[day]++
        })
      }

      const bestDay = dayCount.indexOf(Math.max(...dayCount))
      const bestHour = hourCount.indexOf(Math.max(...hourCount))
      const bestViewDay = dayViewsCount.map((c, i) => c > 0 ? dayViews[i] / c : 0).indexOf(
        Math.max(...dayViewsCount.map((c, i) => c > 0 ? dayViews[i] / c : 0))
      )

      setResult({
        channelTitle: ch.snippet.title,
        thumbnail: ch.snippet.thumbnails?.medium?.url,
        dayCount,
        hourCount,
        dayViews: dayViewsCount.map((c, i) => c > 0 ? Math.round(dayViews[i] / c) : 0),
        bestDay,
        bestHour,
        bestViewDay,
        totalAnalyzed: items.length,
      })
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const maxDay = result ? Math.max(...result.dayCount) : 1
  const maxHour = result ? Math.max(...result.hourCount) : 1

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>🕐 업로드 시간 분석</h1>
        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>채널의 최적 업로드 요일과 시간대를 분석합니다</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && analyze()} placeholder="채널 ID, @핸들 입력" />
          <button className="btn-primary" onClick={analyze} disabled={loading || !ytKey}>{loading ? '⏳ 분석 중...' : '분석'}</button>
        </div>
        {error && <p style={{ margin: '8px 0 0', color: '#ff0055', fontSize: 13 }}>⚠️ {error}</p>}
      </div>

      {result && (
        <div className="fade-in">
          <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
            <img src={result.thumbnail} alt="" style={{ width: 48, height: 48, borderRadius: '50%' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{result.channelTitle}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>최근 {result.totalAnalyzed}개 영상 분석</div>
            </div>
          </div>

          {/* 추천 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            <div className="card" style={{ textAlign: 'center', borderColor: '#1337ec60' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>📅</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#00f2ff' }}>{DAYS[result.bestDay]}요일</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>가장 많이 업로드한 요일</div>
            </div>
            <div className="card" style={{ textAlign: 'center', borderColor: '#1337ec60' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>⏰</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#00f2ff' }}>{result.bestHour}시</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>가장 많이 업로드한 시간</div>
            </div>
            <div className="card" style={{ textAlign: 'center', borderColor: '#22c55e60' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🏆</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>{DAYS[result.bestViewDay]}요일</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>평균 조회수 최고 요일</div>
            </div>
          </div>

          {/* 요일별 업로드 횟수 */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>요일별 업로드 횟수</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 100 }}>
              {result.dayCount.map((cnt, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{cnt}</div>
                  <div style={{
                    width: '100%', borderRadius: '4px 4px 0 0',
                    height: `${Math.max(4, (cnt / maxDay) * 70)}px`,
                    background: i === result.bestDay ? '#00f2ff' : '#1337ec',
                    opacity: i === result.bestDay ? 1 : 0.5,
                    transition: 'height 0.3s',
                  }} />
                  <div style={{ fontSize: 12, fontWeight: i === result.bestDay ? 700 : 400, color: i === result.bestDay ? '#00f2ff' : '#94a3b8' }}>
                    {DAYS[i]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 시간별 */}
          <div className="card">
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>시간대별 업로드 횟수 (24시간)</h3>
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 80 }}>
              {result.hourCount.map((cnt, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '100%', borderRadius: '2px 2px 0 0',
                    height: `${Math.max(2, (cnt / maxHour) * 60)}px`,
                    background: i === result.bestHour ? '#ff0055' : '#1337ec',
                    opacity: i === result.bestHour ? 1 : 0.4,
                  }} />
                  {(i % 6 === 0) && <div style={{ fontSize: 9, color: '#6b7280', marginTop: 3 }}>{i}시</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
