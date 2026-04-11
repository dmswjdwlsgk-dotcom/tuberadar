'use client'
import { useState } from 'react'
import { useApi } from '@/context/ApiContext'

export default function ApiSettings({ onClose }) {
  const { ytKey, geminiKey, saveYtKey, saveGeminiKey, clearKeys } = useApi()
  const [yt, setYt] = useState(ytKey)
  const [gem, setGem] = useState(geminiKey)
  const [showYt, setShowYt] = useState(false)
  const [showGem, setShowGem] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    saveYtKey(yt.trim())
    saveGeminiKey(gem.trim())
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose?.() }, 1000)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>⚙️ API 키 설정</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>각자의 API 키를 입력하세요. 브라우저에만 저장됩니다.</p>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 20 }}>✕</button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* YouTube API Key */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#e2e8f0' }}>
              YouTube Data API v3 키
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showYt ? 'text' : 'password'}
                className="input"
                value={yt}
                onChange={e => setYt(e.target.value)}
                placeholder="AIza..."
                style={{ paddingRight: 40 }}
              />
              <button
                onClick={() => setShowYt(v => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14 }}
              >
                {showYt ? '🙈' : '👁️'}
              </button>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#6b7280' }}>
              Google Cloud Console → YouTube Data API v3 활성화 → 사용자 인증 정보 → API 키 생성
            </p>
          </div>

          {/* Gemini API Key */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#e2e8f0' }}>
              Gemini API 키 <span style={{ color: '#6b7280', fontSize: 11, fontWeight: 400 }}>(AI 기능 전용)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showGem ? 'text' : 'password'}
                className="input"
                value={gem}
                onChange={e => setGem(e.target.value)}
                placeholder="AIza..."
                style={{ paddingRight: 40 }}
              />
              <button
                onClick={() => setShowGem(v => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14 }}
              >
                {showGem ? '🙈' : '👁️'}
              </button>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#6b7280' }}>
              Google AI Studio (aistudio.google.com) → Get API key
            </p>
          </div>

          {/* 안내 */}
          <div style={{ background: '#1e1e28', borderRadius: 8, padding: 12, border: '1px solid #2a2a3a' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              🔒 입력한 키는 이 브라우저의 localStorage에만 저장되며 외부로 전송되지 않습니다.<br/>
              🎉 모든 기능을 제한 없이 사용할 수 있습니다.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={!yt.trim()}>
              {saved ? '✅ 저장됨!' : '저장하기'}
            </button>
            {(ytKey || geminiKey) && (
              <button className="btn-secondary" onClick={() => { clearKeys(); setYt(''); setGem('') }}>
                초기화
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
