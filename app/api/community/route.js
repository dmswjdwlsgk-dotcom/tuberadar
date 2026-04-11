import * as cheerio from 'cheerio'

const CACHE = new Map() // { id: { data, savedAt } }
const CACHE_TTL = 60 * 60 * 1000 // 1시간

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
}

async function fetchHTML(url, extraHeaders = {}) {
  const res = await fetch(url, {
    headers: { ...HEADERS, ...extraHeaders },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

// 각 커뮤니티 스크래퍼
const SCRAPERS = {
  clien: async () => {
    const html = await fetchHTML('https://www.clien.net/service/board/park')
    const $ = cheerio.load(html)
    const posts = []
    $('.list_item').each((i, el) => {
      if (i >= 30) return false
      const title = $(el).find('.list_title').text().trim()
      const link = 'https://www.clien.net' + ($(el).find('a.list_subject').attr('href') || '')
      const author = $(el).find('.list_author span').first().text().trim()
      const time = $(el).find('.list_time span').attr('title') || $(el).find('.list_time').text().trim()
      const views = $(el).find('.list_hit').text().trim()
      const likes = $(el).find('.list_symph').text().trim()
      if (title) posts.push({ title, link, author, time, views, likes })
    })
    return posts
  },

  ruliweb: async () => {
    const html = await fetchHTML('https://bbs.ruliweb.com/community/board/300148')
    const $ = cheerio.load(html)
    const posts = []
    $('tr.table_body').each((i, el) => {
      if (i >= 30) return false
      const title = $(el).find('.title_wrapper a.deco').text().trim()
        || $(el).find('a.deco').text().trim()
      const href = $(el).find('a.deco').attr('href') || ''
      const link = href.startsWith('http') ? href : 'https://bbs.ruliweb.com' + href
      const author = $(el).find('.nick').text().trim()
      const views = $(el).find('.num.hit').text().trim()
      const likes = $(el).find('.num.recom').text().trim()
      const time = $(el).find('.time').text().trim()
      if (title) posts.push({ title, link, author, time, views, likes })
    })
    return posts
  },

  dcinside: async () => {
    const html = await fetchHTML('https://gall.dcinside.com/board/lists/?id=hit', {
      'Referer': 'https://gall.dcinside.com',
    })
    const $ = cheerio.load(html)
    const posts = []
    $('tr.ub-content').each((i, el) => {
      if (i >= 30) return false
      const title = $(el).find('.gall-tit a').first().text().trim()
      const href = $(el).find('.gall-tit a').first().attr('href') || ''
      const link = href.startsWith('http') ? href : 'https://gall.dcinside.com' + href
      const author = $(el).find('.gall-writer .nick').text().trim()
        || $(el).find('.gall-writer').text().trim()
      const views = $(el).find('.gall-count').text().trim()
      const likes = $(el).find('.gall-recommend').text().trim()
      const time = $(el).find('.gall-date').text().trim()
      if (title) posts.push({ title, link, author, time, views, likes })
    })
    return posts
  },

  theqoo: async () => {
    const html = await fetchHTML('https://theqoo.net/hot')
    const $ = cheerio.load(html)
    const posts = []
    $('table.list_table tr').each((i, el) => {
      if (i >= 30) return false
      const title = $(el).find('.title a').text().trim()
        || $(el).find('td.title a').text().trim()
      const href = $(el).find('td.title a').attr('href') || ''
      const link = href.startsWith('http') ? href : 'https://theqoo.net' + href
      const views = $(el).find('.view').text().trim()
      const likes = $(el).find('.recommend').text().trim()
      const time = $(el).find('.time').text().trim()
      if (title) posts.push({ title, link, author: '', time, views, likes })
    })
    return posts
  },

  arca_live: async () => {
    const html = await fetchHTML('https://arca.live/b/breaking')
    const $ = cheerio.load(html)
    const posts = []
    $('a.vrow').each((i, el) => {
      if (i >= 30) return false
      const title = $(el).find('.title').text().trim()
      const href = $(el).attr('href') || ''
      const link = href.startsWith('http') ? href : 'https://arca.live' + href
      const views = $(el).find('.col-view').text().trim()
      const likes = $(el).find('.col-rate').text().trim()
      const time = $(el).find('.col-time time').attr('datetime') || ''
      if (title) posts.push({ title, link, author: '', time, views, likes })
    })
    return posts
  },

  inven: async () => {
    const html = await fetchHTML('https://www.inven.co.kr/community/best')
    const $ = cheerio.load(html)
    const posts = []
    $('tr.listitem, ul.result-list li').each((i, el) => {
      if (i >= 30) return false
      const title = $(el).find('.subject a, .tit a').text().trim()
      const href = $(el).find('.subject a, .tit a').attr('href') || ''
      const link = href.startsWith('http') ? href : 'https://www.inven.co.kr' + href
      const author = $(el).find('.name').text().trim()
      const views = $(el).find('.hit').text().trim()
      const likes = $(el).find('.like').text().trim()
      const time = $(el).find('.date').text().trim()
      if (title) posts.push({ title, link, author, time, views, likes })
    })
    return posts
  },

  ppomppu: async () => {
    const html = await fetchHTML('https://www.ppomppu.co.kr/zboard/zboard.php?id=ppomppu')
    const $ = cheerio.load(html)
    const posts = []
    $('tr.baseList, tr[class^="baseList"]').each((i, el) => {
      if (i >= 30) return false
      const titleEl = $(el).find('a[href*="view.php"]')
      const title = titleEl.text().trim()
      const href = titleEl.attr('href') || ''
      const link = href.startsWith('http') ? href : 'https://www.ppomppu.co.kr/zboard/' + href
      const author = $(el).find('.list_name').text().trim()
      const views = $(el).find('td:nth-child(6)').text().trim()
      const likes = $(el).find('td:nth-child(7)').text().trim()
      const time = $(el).find('td:nth-child(5)').text().trim()
      if (title) posts.push({ title, link, author, time, views, likes })
    })
    return posts
  },

  mlbpark: async () => {
    const html = await fetchHTML('https://mlbpark.donga.com/mp/b.php?b=bullpen')
    const $ = cheerio.load(html)
    const posts = []
    $('tr.list').each((i, el) => {
      if (i >= 30) return false
      const titleEl = $(el).find('td.title a')
      const title = titleEl.text().trim()
      const href = titleEl.attr('href') || ''
      const link = href.startsWith('http') ? href : 'https://mlbpark.donga.com' + href
      const author = $(el).find('.writer').text().trim()
      const views = $(el).find('.count').text().trim()
      const time = $(el).find('.time').text().trim()
      if (title) posts.push({ title, link, author, time, views, likes: '' })
    })
    return posts
  },

  nate_pann: async () => {
    const html = await fetchHTML('https://pann.nate.com/talk/ranking/daily')
    const $ = cheerio.load(html)
    const posts = []
    $('ul.post-list li, .list-container li').each((i, el) => {
      if (i >= 30) return false
      const titleEl = $(el).find('a.pann-txt, .tit a').first()
      const title = titleEl.text().trim()
      const href = titleEl.attr('href') || ''
      const link = href.startsWith('http') ? href : 'https://pann.nate.com' + href
      const author = $(el).find('.name').text().trim()
      const views = $(el).find('.view').text().trim()
      const likes = $(el).find('.good').text().trim()
      if (title) posts.push({ title, link, author, time: '', views, likes })
    })
    return posts
  },

  bobaedream: async () => {
    const html = await fetchHTML('https://www.bobaedream.co.kr/list?code=best')
    const $ = cheerio.load(html)
    const posts = []
    $('table.bodList tbody tr').each((i, el) => {
      if (i >= 30) return false
      const titleEl = $(el).find('a.bsubject')
      const title = titleEl.text().trim()
      const href = titleEl.attr('href') || ''
      const link = href.startsWith('http') ? href : 'https://www.bobaedream.co.kr' + href
      const author = $(el).find('.author').text().trim()
      const views = $(el).find('.count').text().trim()
      const time = $(el).find('.date').text().trim()
      if (title) posts.push({ title, link, author, time, views, likes: '' })
    })
    return posts
  },

  humoruniv: async () => {
    const html = await fetchHTML('https://www.humoruniv.com/board/humor/list.html')
    const $ = cheerio.load(html)
    const posts = []
    $('tr.list').each((i, el) => {
      if (i >= 30) return false
      const titleEl = $(el).find('td.subject a')
      const title = titleEl.text().trim()
      const href = titleEl.attr('href') || ''
      const link = href.startsWith('http') ? href : 'https://www.humoruniv.com' + href
      const author = $(el).find('td.id').text().trim()
      const views = $(el).find('td.hit').text().trim()
      const time = $(el).find('td.date').text().trim()
      if (title) posts.push({ title, link, author, time, views, likes: '' })
    })
    return posts
  },

  cook82: async () => {
    const html = await fetchHTML('https://www.82cook.com/entiz/list.php?bn=15')
    const $ = cheerio.load(html)
    const posts = []
    $('tr.list').each((i, el) => {
      if (i >= 30) return false
      const titleEl = $(el).find('td.subject a')
      const title = titleEl.text().trim()
      const href = titleEl.attr('href') || ''
      const link = href.startsWith('http') ? href : 'https://www.82cook.com' + href
      const author = $(el).find('td.id').text().trim()
      const views = $(el).find('td.count').text().trim()
      const time = $(el).find('td.date').text().trim()
      if (title) posts.push({ title, link, author, time, views, likes: '' })
    })
    return posts
  },

  slrclub: async () => {
    const html = await fetchHTML('https://www.slrclub.com/bbs/zboard.php?id=hot_article')
    const $ = cheerio.load(html)
    const posts = []
    $('tr.list').each((i, el) => {
      if (i >= 30) return false
      const titleEl = $(el).find('td.subject a, td.title a')
      const title = titleEl.text().trim()
      const href = titleEl.attr('href') || ''
      const link = href.startsWith('http') ? href : 'https://www.slrclub.com' + href
      const views = $(el).find('td.count').text().trim()
      const time = $(el).find('td.date').text().trim()
      if (title) posts.push({ title, link, author: '', time, views, likes: '' })
    })
    return posts
  },

  todayhumor: async () => {
    const html = await fetchHTML('https://www.todayhumor.co.kr/board/list.php?table=bestofbest')
    const $ = cheerio.load(html)
    const posts = []
    $('tr.view').each((i, el) => {
      if (i >= 30) return false
      const titleEl = $(el).find('td.subject a')
      const title = titleEl.clone().children().remove().end().text().trim()
      const href = titleEl.attr('href') || ''
      const link = href.startsWith('http') ? href : 'https://www.todayhumor.co.kr' + href
      const author = $(el).find('td.writerInfo .nameWrap').text().trim()
      const views = $(el).find('td.hits').text().trim()
      const likes = $(el).find('td.recomm').text().trim()
      const time = $(el).find('td.date').text().trim()
      if (title) posts.push({ title, link, author, time, views, likes })
    })
    return posts
  },

  gasengi: async () => {
    const html = await fetchHTML('https://www.gasengi.com/main/board.php?bo_table=commu07')
    const $ = cheerio.load(html)
    const posts = []
    $('tr.bo_notice, tr:not(.head)').each((i, el) => {
      if (i >= 30) return false
      const titleEl = $(el).find('.bo_tit a, td.td_subject a')
      const title = titleEl.first().text().trim()
      const href = titleEl.first().attr('href') || ''
      const link = href.startsWith('http') ? href : 'https://www.gasengi.com' + href
      const author = $(el).find('.sv_member').text().trim()
      const views = $(el).find('td.td_num2').text().trim()
      const time = $(el).find('td.td_datetime').text().trim()
      if (title) posts.push({ title, link, author, time, views, likes: '' })
    })
    return posts
  },
}

export async function GET(request) {
  const { searchParams } = request.nextUrl
  const id = searchParams.get('id') || 'clien'
  const force = searchParams.get('force') === 'true'

  // 캐시 확인
  if (!force && CACHE.has(id)) {
    const cached = CACHE.get(id)
    if (Date.now() - cached.savedAt < CACHE_TTL) {
      return Response.json({ posts: cached.data, cached: true, updated_at: new Date(cached.savedAt).toISOString() })
    }
  }

  const scraper = SCRAPERS[id]
  if (!scraper) {
    return Response.json({ error: `지원하지 않는 커뮤니티: ${id}` }, { status: 400 })
  }

  try {
    const posts = await scraper()
    CACHE.set(id, { data: posts, savedAt: Date.now() })
    return Response.json({
      posts,
      cached: false,
      updated_at: new Date().toISOString(),
    })
  } catch (e) {
    console.error(`[community] ${id} 스크래핑 실패:`, e.message)
    // 캐시된 데이터라도 반환
    if (CACHE.has(id)) {
      const cached = CACHE.get(id)
      return Response.json({ posts: cached.data, cached: true, error: e.message, updated_at: new Date(cached.savedAt).toISOString() })
    }
    return Response.json({ error: e.message, posts: [] }, { status: 500 })
  }
}
