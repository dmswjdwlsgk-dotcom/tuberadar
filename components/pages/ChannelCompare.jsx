'use client'
import { useState } from 'react'
import { useApi } from '@/context/ApiContext'
import { getChannelInfo, fmtNum, estimateRevenue } from '@/utils/youtube'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'

const COLORS = ['#1337ec', '#00f2ff', '#ff0055', '#f59e0b']

export default function ChannelCompare() {
  const { ytKey } = useApi()
  const [inputs, setInputs] = useState(['', '', '', ''])
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchChannels = async () => {
    const ids = inputs.filter(i => i.trim())
    if (!ids.length || !ytKey) return
    setLoading(true); setError('')
    try {
      const results = await Promise.all(
        ids.map(async (input) => {
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
          return getChannelInfo(id, ytKey)
        })
      )
      setChannels(results.filter(Boolean))
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const radarData = channels.length > 0 ? [
    { metric: '구독자', ...Object.fromEntries(channels.map((c, i) => [c.snippet.title, normalizeMax(channels.map(ch => +ch.statistics.subscriberCount), +c.statistics.subscriberCount)])) },
    { metric: '조회수', ...Object.fromEntries(channels.map((c, i) => [c.snippet.title, normalizeMax(channels.map(ch => +ch.statistics.viewCount), +c.statistics.viewCount)])) },
    { metric: '영상수', ...Object.fromEntries(channels.map((c, i) => [c.snippet.title, normalizeMax(channels.map(ch => +ch.statistics.videoCount), +c.statistics.videoCount)])) },
    { metric: '영상당조회', ...Object.fromEntries(channels.map((c) => [c.snippet.title, normalizeMax(channels.map(ch => (+ch.statistics.viewCount / Math.max(1, +ch.statistics.videoCount))), (+c.statistics.viewCount / Math.max(1, +c.statistics.videoCount)))])) },
  ] : []

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>⚡ 채널 비교 분석</h1>
        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>최대 4개 채널을 나란히 비교하세요</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 14 }}>
          {inputs.map((v, i) => (
            <input
              key={i}
              className="input"
              value={v}
              onChange={e => { const n = [...inputs]; n[i] = e.target.value; setInputs(n) }}
              placeholder={`채널 ${i + 1} (ID/@핸들)`}
            />
          ))}
        </div>
        <button className="btn-primary" onClick={fetchChannels} disabled={loading || !ytKey}>
          {loading ? '⏳ 분석 중...' : '📊 비교 분석'}
        </button>
        {error && <p style={{ margin: '8px 0 0', color: '#ff0055', fontSize: 13 }}>⚠️ {error}</p>}
      </div>

      {channels.length > 0 && (
        <div className="fade-in">
          {/* 카드 비교 */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${channels.length}, 1fr)`, gap: 12, marginBottom: 24 }}>
            {channels.map((ch, i) => (
              <div key={ch.id} className="card" style={{ borderColor: COLORS[i] + '60', textAlign: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i], margin: '0 auto 10px' }} />
                <img src={ch.snippet.thumbnails?.medium?.url} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', marginBottom: 10 }} />
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.snippet.title}</div>
                <StatRow label="구독자" value={fmtNum(ch.statistics.subscriberCount)} />
                <StatRow label="총 조회수" value={fmtNum(ch.statistics.viewCount)} />
                <StatRow label="영상 수" value={fmtNum(ch.statistics.videoCount)} />
                <StatRow label="영상당 조회" value={fmtNum(Math.round(+ch.statistics.viewCount / Math.max(1, +ch.statistics.videoCount)))} />
                <StatRow label="월 추정 수익" value={`$${fmtNum(estimateRevenue(+ch.statistics.viewCount / 365 * 30, ''))}`} />
              </div>
            ))}
          </div>

          {/* 바 차트 */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>구독자 비교</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={channels.map(ch => ({ name: ch.snippet.title.slice(0, 10), subs: +ch.statistics.subscriberCount }))}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => fmtNum(v)} />
                <Tooltip formatter={v => fmtNum(v)} contentStyle={{ background: '#16161d', border: '1px solid #2a2a3a' }} />
                {channels.map((ch, i) => <Bar key={ch.id} dataKey="subs" fill={COLORS[i]} radius={[4,4,0,0]} />)}
                <Bar dataKey="subs" fill="#1337ec" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 레이더 차트 */}
          {channels.length >= 2 && (
            <div className="card">
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>종합 역량 비교</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#2a2a3a" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis tick={false} />
                  {channels.map((ch, i) => (
                    <Radar key={ch.id} name={ch.snippet.title} dataKey={ch.snippet.title} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
                  ))}
                  <Tooltip contentStyle={{ background: '#16161d', border: '1px solid #2a2a3a' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function normalizeMax(arr, val) {
  const max = Math.max(...arr)
  if (!max) return 0
  return Math.round((val / max) * 100)
}

function StatRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #2a2a3a', fontSize: 13 }}>
      <span style={{ color: '#6b7280' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  )
}
