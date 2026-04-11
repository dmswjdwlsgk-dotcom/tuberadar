'use client'
import { useState } from 'react'
import { ApiProvider, useApi } from '@/context/ApiContext'
import Sidebar from '@/components/Sidebar'
import ApiSettings from '@/components/ApiSettings'
import MonitoringList from '@/components/pages/MonitoringList'
import ChannelCompare from '@/components/pages/ChannelCompare'
import ChannelRadar from '@/components/pages/ChannelRadar'
import UploadTimeAnalysis from '@/components/pages/UploadTimeAnalysis'
import RevenueAnalysis from '@/components/pages/RevenueAnalysis'
import KeywordContent from '@/components/pages/KeywordContent'
import KeywordChannel from '@/components/pages/KeywordChannel'
import ContentIdeas from '@/components/pages/ContentIdeas'
import ChannelPack from '@/components/pages/ChannelPack'
import ReferenceStudio from '@/components/pages/ReferenceStudio'
import ScriptExtract from '@/components/pages/ScriptExtract'
import ThumbnailDownload from '@/components/pages/ThumbnailDownload'
import ShortsRadar from '@/components/pages/ShortsRadar'
import CountryTrend from '@/components/pages/CountryTrend'
import CategoryTrend from '@/components/pages/CategoryTrend'
import CommunityPosts from '@/components/pages/CommunityPosts'

const PAGE_MAP = {
  monitoring: MonitoringList,
  compare: ChannelCompare,
  radar: ChannelRadar,
  'upload-time': UploadTimeAnalysis,
  revenue: RevenueAnalysis,
  'keyword-content': KeywordContent,
  'keyword-channel': KeywordChannel,
  'content-ideas': ContentIdeas,
  'channel-pack': ChannelPack,
  reference: ReferenceStudio,
  script: ScriptExtract,
  thumbnail: ThumbnailDownload,
  shorts: ShortsRadar,
  'country-trend': CountryTrend,
  'category-trend': CategoryTrend,
  community: CommunityPosts,
}

function App() {
  const [activePage, setActivePage] = useState('category-trend')
  const [showSettings, setShowSettings] = useState(false)
  const { ytKey, geminiKey } = useApi()

  const Page = PAGE_MAP[activePage] || CategoryTrend

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0f0f12' }}>
      <Sidebar active={activePage} onSelect={setActivePage} />

      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '10px 20px', borderBottom: '1px solid #2a2a3a',
          background: '#0f0f12', position: 'sticky', top: 0, zIndex: 10, gap: 10,
        }}>
          {!ytKey && (
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,0,85,0.1)', border: '1px solid rgba(255,0,85,0.3)', borderRadius: 8, padding: '6px 12px' }}>
              <span style={{ color: '#ff0055', fontSize: 13 }}>⚠️ API 키를 설정해주세요</span>
            </div>
          )}
          {ytKey && !geminiKey && (
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '6px 12px' }}>
              <span style={{ color: '#f59e0b', fontSize: 13 }}>💡 Gemini 키 설정 시 AI 기능 사용 가능</span>
            </div>
          )}
          <button
            onClick={() => setShowSettings(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#1e1e28', border: '1px solid #2a2a3a',
              borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
              color: '#94a3b8', fontSize: 13, fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1337ec'; e.currentTarget.style.color = '#e2e8f0' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a3a'; e.currentTarget.style.color = '#94a3b8' }}
          >
            ⚙️ API 설정
          </button>
        </div>

        <div style={{ flex: 1 }}>
          <Page />
        </div>
      </main>

      {showSettings && <ApiSettings onClose={() => setShowSettings(false)} />}
    </div>
  )
}

export default function MainLayout() {
  return (
    <ApiProvider>
      <App />
    </ApiProvider>
  )
}
