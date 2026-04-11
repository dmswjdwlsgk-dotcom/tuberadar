'use client'
import { useState } from 'react'
import { useApi } from '@/context/ApiContext'
import { getChannelInfo, fmtNum, estimateRevenue, CATEGORY_MAP } from '@/utils/youtube'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const CPM_TABLE = [
  { category: '과학/기술', id: '28', cpm: 8, color: '#00f2ff' },
  { category: '교육', id: '27', cpm: 7, color: '#1337ec' },
  { category: '뉴스/정치', id: '25', cpm: 6, color: '#8b5cf6' },
  { category: '엔터테인먼트', id: '24', cpm: 4, color: '#f59e0b' },
  { category: '음악', id: '10', cpm: 3, color: '#ec4899' },
  { category: '스포츠', id: '17', cpm: 3, color: '#22c55e' },
  { category: '게임', id: '20', cpm: 2.5, color: '#ef4444' },
  { category: '인물/블로그', id: '22', cpm: 2, color: '#94a3b8' },
]

export default function RevenueAnalysis() {
  const { ytKey } = useApi()
  const [input, setInput] = useState('')
  const [channel, setChannel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyze = async () => {
    if (!input.trim() || !ytKey) return
    setLoading(true); setError('')
    try {
      let id = input.trim()
      if (id.startsWith('@') || (!id.startsWith('UC') && !id.startsWith('http'))) {
        const q = id.startsWith('@') ? id.slice(1) : id
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(q)}&maxResults=1&key=${ytKey}`
        )
        const d = await res.json()
        if (d.error) throw new Error(d.error.message)
        if (d.items?.length) id = d.items[0].snippet.channelId
      }
      const ch = await getChannelInfo(id, ytKey)
      if (!ch) throw new Error('채널을 찾을 수 없습니다')
      setChannel(ch)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const getMonthlyRevenue = (ch) => {
    const views = +ch.statistics.viewCount
    const age = Math.max(1, (Date.now() - new Date(ch.snippet.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
    const monthlyViews = views / age

    return CPM_TABLE.map(row => ({
      ...row,
      monthly: Math.round((monthlyViews / 1000) * row.cpm * 0.55 * 1400),
      yearly: Math.round((monthlyViews * 12 / 1000) * row.cpm * 0.55 * 1400),
    }))
  }

  const chartData = channel ? Array.from({ length: 12 }, (_, i) => {
    const month = new Date(); month.setMonth(month.getMonth() - (11 - i))
    const views = +channel.statistics.viewCount
    const monthlyViews = views / 24 * (0.7 + Math.random() * 0.6)
    const rev = Math.round((monthlyViews / 1000) * 2 * 0.55 * 1400)
    return { month: `${month.getMonth() + 1}월`, revenue: rev }
  }) : []

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>💰 채널 수익 분석</h1>
        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>CPM 기반 추정 수익을 카테고리별로 분석합니다 (실제 수익과 다를 수 있음)</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && analyze()} placeholder="채널 ID, @핸들 입력" />
          <button className="btn-primary" onClick={analyze} disabled={loading || !ytKey}>{loading ? '⏳' : '분석'}</button>
        </div>
        {error && <p style={{ margin: '8px 0 0', color: '#ff0055', fontSize: 13 }}>⚠️ {error}</p>}
      </div>

      {channel && (
        <div className="fade-in">
          {/* 채널 정보 */}
          <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
            <img src={channel.snippet.thumbnails?.medium?.url} alt="" style={{ width: 64, height: 64, borderRadius: '50%' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{channel.snippet.title}</div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>구독자 {fmtNum(channel.statistics.subscriberCount)} • 영상 {fmtNum(channel.statistics.videoCount)}개</div>
            </div>
          </div>

          {/* 수익 차트 */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>월별 추정 수익 (원, 일반 카테고리 기준)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1337ec" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1337ec" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `₩${fmtNum(v)}`} />
                <Tooltip formatter={v => [`₩${v.toLocaleString()}`, '추정 수익']} contentStyle={{ background: '#16161d', border: '1px solid #2a2a3a' }} />
                <Area type="monotone" dataKey="revenue" stroke="#1337ec" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* CPM 테이블 */}
          <div className="card">
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>카테고리별 예상 수익</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {getMonthlyRevenue(channel).map(row => (
                <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#1e1e28', borderRadius: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{row.category}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>CPM ${row.cpm}</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: row.color }}>₩{row.monthly.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>월 추정</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>₩{row.yearly.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>연 추정</div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 12, color: '#4b5563' }}>
              ※ 위 수익은 공개 CPM 데이터 기반 추정치이며 실제 수익과 차이가 있을 수 있습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
