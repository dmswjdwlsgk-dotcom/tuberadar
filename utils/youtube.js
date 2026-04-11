const BASE = 'https://www.googleapis.com/youtube/v3'

export async function ytFetch(path, apiKey) {
  const sep = path.includes('?') ? '&' : '?'
  const res = await fetch(`${BASE}${path}${sep}key=${apiKey}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error.message || 'YouTube API 오류')
  return data
}

export function fmtNum(n) {
  if (!n && n !== 0) return '-'
  n = Number(n)
  if (n >= 1e8) return (n / 1e8).toFixed(1) + '억'
  if (n >= 1e4) return (n / 1e4).toFixed(1) + '만'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toLocaleString()
}

export function fmtDuration(iso) {
  if (!iso) return '-'
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return '-'
  const h = parseInt(m[1] || 0), min = parseInt(m[2] || 0), s = parseInt(m[3] || 0)
  if (h > 0) return `${h}:${String(min).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${min}:${String(s).padStart(2,'0')}`
}

export function timeAgo(dateStr) {
  if (!dateStr) return '-'
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}일 전`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `${mo}개월 전`
  return `${Math.floor(mo / 12)}년 전`
}

export const CATEGORY_MAP = {
  '1':'영화/애니','2':'자동차','10':'음악','15':'반려동물',
  '17':'스포츠','19':'여행','20':'게임','22':'인물/블로그',
  '23':'코미디','24':'엔터테인먼트','25':'뉴스/정치','26':'노하우/스타일',
  '27':'교육','28':'과학/기술','29':'비영리/사회운동'
}

export function estimateRevenue(views, category) {
  const cpmMap = {
    '28':8,'27':7,'25':6,'24':4,'10':3,'17':3,'20':2.5,
    '22':2,'26':2,'15':1.5,'1':1.5,'2':1.5,'23':1.5,
  }
  const cpm = cpmMap[category] || 2
  return Math.round((views / 1000) * cpm * 0.55)
}

export async function getChannelInfo(channelId, apiKey) {
  const data = await ytFetch(
    `/channels?part=statistics,snippet,brandingSettings&id=${channelId}`,
    apiKey
  )
  return data.items?.[0] || null
}

export async function getChannelByHandle(handle, apiKey) {
  // @handle 형식 처리
  const query = handle.startsWith('@') ? handle : `@${handle}`
  const data = await ytFetch(
    `/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=1`,
    apiKey
  )
  if (!data.items?.length) return null
  const id = data.items[0].snippet.channelId
  return getChannelInfo(id, apiKey)
}

export async function searchChannels(query, apiKey, maxResults = 10) {
  const data = await ytFetch(
    `/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=${maxResults}&regionCode=KR`,
    apiKey
  )
  return data.items || []
}

export async function getTrendingVideos(apiKey, regionCode = 'KR', categoryId = '', maxResults = 50) {
  let path = `/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=${regionCode}&maxResults=${maxResults}`
  if (categoryId) path += `&videoCategoryId=${categoryId}`
  return ytFetch(path, apiKey)
}

export async function getVideoCategories(apiKey, regionCode = 'KR') {
  return ytFetch(`/videoCategories?part=snippet&regionCode=${regionCode}`, apiKey)
}

export async function getVideoDetails(videoIds, apiKey) {
  const ids = Array.isArray(videoIds) ? videoIds.join(',') : videoIds
  return ytFetch(`/videos?part=snippet,statistics,contentDetails&id=${ids}`, apiKey)
}

export async function searchVideos(query, apiKey, options = {}) {
  const { maxResults = 20, order = 'relevance', type = 'video', regionCode = 'KR' } = options
  return ytFetch(
    `/search?part=snippet&q=${encodeURIComponent(query)}&type=${type}&maxResults=${maxResults}&order=${order}&regionCode=${regionCode}`,
    apiKey
  )
}

export async function getChannelVideos(channelId, apiKey, maxResults = 30) {
  // 채널의 uploads 플레이리스트 ID 얻기
  const ch = await getChannelInfo(channelId, apiKey)
  if (!ch) return []
  const uploadsId = ch.contentDetails?.relatedPlaylists?.uploads
  if (!uploadsId) {
    // fallback: search
    const s = await ytFetch(
      `/search?part=snippet&channelId=${channelId}&type=video&maxResults=${maxResults}&order=date`,
      apiKey
    )
    return s.items || []
  }
  const pl = await ytFetch(
    `/playlistItems?part=snippet,contentDetails&playlistId=${uploadsId}&maxResults=${maxResults}`,
    apiKey
  )
  return pl.items || []
}
