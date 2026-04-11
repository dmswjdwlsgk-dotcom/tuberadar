'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const ApiContext = createContext(null)

export function ApiProvider({ children }) {
  const [ytKey, setYtKey] = useState('')
  const [geminiKey, setGeminiKey] = useState('')

  useEffect(() => {
    setYtKey(localStorage.getItem('tr_yt_key') || '')
    setGeminiKey(localStorage.getItem('tr_gemini_key') || '')
  }, [])

  const saveYtKey = (k) => { setYtKey(k); localStorage.setItem('tr_yt_key', k) }
  const saveGeminiKey = (k) => { setGeminiKey(k); localStorage.setItem('tr_gemini_key', k) }
  const clearKeys = () => {
    setYtKey(''); setGeminiKey('')
    localStorage.removeItem('tr_yt_key')
    localStorage.removeItem('tr_gemini_key')
  }

  return (
    <ApiContext.Provider value={{ ytKey, geminiKey, saveYtKey, saveGeminiKey, clearKeys }}>
      {children}
    </ApiContext.Provider>
  )
}

export const useApi = () => useContext(ApiContext)
