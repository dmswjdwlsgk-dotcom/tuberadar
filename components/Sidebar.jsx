'use client'
import { useState } from 'react'

const MENU = [
  {
    group: '채널 관리',
    items: [
      { id: 'monitoring', icon: '📋', label: '내 모니터링 리스트' },
      { id: 'compare', icon: '⚡', label: '채널 비교 분석' },
      { id: 'radar', icon: '📡', label: '채널 급등 레이더' },
      { id: 'upload-time', icon: '🕐', label: '업로드 시간 분석' },
      { id: 'revenue', icon: '💰', label: '채널 수익 분석' },
    ]
  },
  {
    group: '키워드 탐색',
    items: [
      { id: 'keyword-content', icon: '🔍', label: '키워드 소재 탐색' },
      { id: 'keyword-channel', icon: '🔎', label: '키워드 채널 찾기' },
    ]
  },
  {
    group: '아이디어·추천',
    items: [
      { id: 'content-ideas', icon: '💡', label: '유튜브 추천 소재' },
      { id: 'channel-pack', icon: '📦', label: '추천 채널 팩' },
    ]
  },
  {
    group: 'AI 스튜디오',
    items: [
      { id: 'reference', icon: '🎬', label: '레퍼런스 스튜디오' },
      { id: 'script', icon: '📄', label: '유튜브 대본 추출' },
      { id: 'thumbnail', icon: '🖼️', label: '썸네일 다운로드' },
    ]
  },
  {
    group: '트렌드 분석',
    items: [
      { id: 'shorts', icon: '⚡', label: '자동 탐색 (Shorts)' },
      { id: 'country-trend', icon: '🌍', label: '실시간 국가 트렌드' },
      { id: 'category-trend', icon: '📊', label: '실시간 카테고리 트렌드' },
      { id: 'community', icon: '💬', label: '커뮤니티 핫게시글' },
    ]
  }
]

export default function Sidebar({ active, onSelect }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside style={{
      width: collapsed ? 60 : 220,
      minWidth: collapsed ? 60 : 220,
      background: '#0d0d11',
      borderRight: '1px solid #2a2a3a',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      overflow: 'hidden',
      position: 'sticky',
      top: 0,
    }}>
      {/* 로고 */}
      <div style={{
        padding: '16px 12px',
        borderBottom: '1px solid #2a2a3a',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        minHeight: 64,
      }} onClick={() => setCollapsed(c => !c)}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, minWidth: 36,
          background: 'linear-gradient(135deg,#1337ec,#00f2ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>📡</div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>TUBE</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#00f2ff', lineHeight: 1.2 }}>RADAR</div>
          </div>
        )}
      </div>

      {/* 메뉴 */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {MENU.map(section => (
          <div key={section.group}>
            {!collapsed && (
              <div style={{ fontSize: 10, color: '#4b5563', fontWeight: 600, letterSpacing: '0.08em', padding: '10px 8px 4px', textTransform: 'uppercase' }}>
                {section.group}
              </div>
            )}
            {section.items.map(item => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: collapsed ? 0 : 10,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  width: '100%',
                  padding: collapsed ? '10px 0' : '8px 10px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 0.15s',
                  background: active === item.id ? '#1337ec' : 'transparent',
                  color: active === item.id ? '#fff' : '#94a3b8',
                }}
                title={collapsed ? item.label : ''}
                onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.background = '#1e1e28'; e.currentTarget.style.color = '#e2e8f0' }}
                onMouseLeave={e => { if (active !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' } }}
              >
                <span style={{ fontSize: 15, minWidth: 20, textAlign: 'center' }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* 하단 */}
      {!collapsed && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #2a2a3a', fontSize: 11, color: '#4b5563' }}>
          TubeRadar Clone
        </div>
      )}
    </aside>
  )
}
