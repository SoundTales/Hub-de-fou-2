import { useCallback, useEffect, useRef, useState } from 'react'
import ReaderShell from './reader/ReaderShell.jsx'
import { getAudioEngine } from './reader/audioSingleton.js'
import { getTales, getEntitlements } from './api/client.js'
import IABanner from './ui/IABanner.jsx'
import Quickbar from './ui/Quickbar.jsx'
import BookmarksPanel from './ui/BookmarksPanel.jsx'
import { detectInApp } from './utils/ua.ts'
import {
  isFavorite,
  setFavorite,
  getSessionFlag,
  setSessionFlag
} from './utils/storage.ts'

export default function App() {
  const eyebrowRef = useRef(null)
  const titleRef = useRef(null)
  const actionsRef = useRef(null)
  const [showFab, setShowFab] = useState(false)
  // Fix baseUrl to work in both dev and production
  const baseUrl = import.meta.env.BASE_URL || './'
  const assetBase = (baseUrl || './').replace(/\/+$/, '')
  const wordmarkUrl = `${assetBase}/${encodeURIComponent('Sound Tales.svg')}`
  const heroImgUrl = 'https://static.wixstatic.com/media/b9ad46_9fcfea21c381472e97a9a9bc10386509~mv2.jpg'
  const [voiceExpanded, setVoiceExpanded] = useState(false)
  const [showCreditsInline, setShowCreditsInline] = useState(false)

  const artistData = {
    auteurs: [
      {
        id: 'auteur-1',
        name: 'Johnny Delaveau',
        title: 'Auteur principal',
        works: [
          { id: 'work-1', title: 'Le prix de la haine', role: 'Auteur principal' }
        ]
      }
    ],
    compositeurs: [
      {
        id: 'comp-1',
        name: 'Quentin Querel',
        title: 'Compositeur principal',
        works: [
          { id: 'work-1', title: 'Le prix de la haine', role: 'Compositeur principal' }
        ]
      }
    ],
    illustrateurs: [
      {
        id: 'illu-1',
        name: 'Dupont Dupond',
        title: 'Illustrateur principal',
        works: [
          { id: 'work-1', title: 'Le prix de la haine', role: 'Illustration principale' }
        ]
      }
    ]
  }
  const voiceData = [
    {
      id: 'voix-malone',
      name: 'Dupont Dupond',
      title: 'ComÃ©dienne voix',
      featured: true,
      roleLabel: 'Malone',
      works: [{ id: 'work-1', title: 'Le prix de la haine', role: 'Malone' }]
    },
    {
      id: 'voix-zadig',
      name: 'Dupont Dupond',
      title: 'ComÃ©dien voix',
      featured: true,
      roleLabel: 'Zadig',
      works: [{ id: 'work-1', title: 'Le prix de la haine', role: 'Zadig' }]
    },
    {
      id: 'voix-zora',
      name: 'Dupont Dupond',
      title: 'ComÃ©dienne voix',
      featured: true,
      roleLabel: 'Zora',
      works: [{ id: 'work-1', title: 'Le prix de la haine', role: 'Zora' }]
    },
    {
      id: 'voix-albar',
      name: 'Dupont Dupond',
      title: 'ComÃ©dien voix',
      featured: false,
      roleLabel: 'Albar',
      works: [{ id: 'work-1', title: 'Le prix de la haine', role: 'Albar' }]
    },
    {
      id: 'voix-evelyne',
      name: 'Dupont Dupond',
      title: 'ComÃ©dienne voix',
      featured: false,
      roleLabel: 'Evelyne',
      works: [{ id: 'work-1', title: 'Le prix de la haine', role: 'Evelyne' }]
    },
    {
      id: 'voix-elan',
      name: 'Dupont Dupond',
      title: 'ComÃ©dien voix',
      featured: false,
      roleLabel: 'Elan',
      works: [{ id: 'work-1', title: 'Le prix de la haine', role: 'Elan' }]
    }
  ]
  // Preload hero/poster images to reduce first paint latency
  useEffect(() => {
    const urls = [heroImgUrl]
    urls.forEach((src) => {
      try {
        const img = new Image()
        img.fetchPriority = 'high'
        img.src = src
      } catch {}
    })
  }, [])
  // Mark current mode for style/behavior scoping (hub vs reader)
  const [isInApp, setIsInApp] = useState(false)
  const [bannerMode, setBannerMode] = useState('hidden')
  const [isFullscreen, setIsFullscreen] = useState(() => !!(document.fullscreenElement || document.webkitFullscreenElement))
  // Hub data
  const [tales, setTales] = useState([])
  const [ents, setEnts] = useState(null)
  const [loadingTales, setLoadingTales] = useState(true)
  // Bookmarks panel state
  const [showBmPanel, setShowBmPanel] = useState(false)
  const [bmItems, setBmItems] = useState([])
  const [bmOrigin, setBmOrigin] = useState({ left: null, top: null, side: 'bottom', from: 'quickbar' })
  const [favTick, setFavTick] = useState(0)
  // Scroll-to-top visibility (quickbar)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Simple hash-based routing to isolate the reader from the hub
  const [route, setRoute] = useState(() => window.location.hash || '#/')
  const isReaderRoute = /^#\/?reader\//i.test(route)
  const isHubRoute = /^#\/?hub/i.test(route)
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Load tales + entitlements (mock)
  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const [t, e] = await Promise.all([
          getTales({ baseUrl }).catch(() => ({ tales: [] })),
          getEntitlements().catch(() => null)
        ])
        if (!alive) return
        setTales(Array.isArray(t?.tales) ? t.tales : [])
        setEnts(e)
      } finally {
        if (alive) setLoadingTales(false)
      }
    }
    load()
    return () => { alive = false }
  }, [baseUrl])

  useEffect(() => {
    try {
      if (isReaderRoute) {
        delete document.body.dataset.mode
      } else if (isHubRoute) {
        document.body.dataset.mode = 'hub'
      } else {
        document.body.dataset.mode = 'presentation'
      }
    } catch {}
    return () => { try { delete document.body.dataset.mode } catch {} }
  }, [isReaderRoute, isHubRoute])

  // Eyebrow fitter (keeps eyebrow width matching title)
  useEffect(() => {
    const eyebrow = eyebrowRef.current
    const title = titleRef.current
    if (!eyebrow || !title) return

    const norm = s => s.replace(/\s+/g, ' ').trim()
    const gaps = () => Math.max(norm(eyebrow.textContent).length - 1, 1)
    const measureTextWidth = (el) => {
      const range = document.createRange()
      range.selectNodeContents(el)
      const rect = range.getBoundingClientRect()
      return rect.width
    }
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

    const fit = () => {
      const base = parseFloat(getComputedStyle(title).fontSize) || 0
      if (!base) return

      const factor = 0.28
      eyebrow.style.setProperty('font-size', `${base * factor}px`, 'important')
      eyebrow.style.setProperty('letter-spacing', '0px', 'important')

      const wTitle = measureTextWidth(title)
      const wE0 = measureTextWidth(eyebrow)
      const g = gaps()

      let ls = (wTitle - wE0) / g
      ls = clamp(Math.max(0.5, ls), 0.5, 150)
      eyebrow.style.setProperty('letter-spacing', `${ls}px`, 'important')

      const wE1 = measureTextWidth(eyebrow)
      const delta = wTitle - wE1
      if (Math.abs(delta) > 0.5) {
        ls = clamp(ls + delta / g, 0.5, 150)
        eyebrow.style.setProperty('letter-spacing', `${ls}px`, 'important')
      }
    }

    const ro = new ResizeObserver(fit)
    ro.observe(title)
    ro.observe(eyebrow)

    if (document.fonts?.ready) document.fonts.ready.then(fit)
    window.addEventListener('resize', fit, { passive: true })
    fit()

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [])

  // Detect in-app browsers (FB/IG/Messenger WebView, Android WebView)
  useEffect(() => {
    const inApp = detectInApp()
    setIsInApp(inApp)
    if (inApp) {
      const firstDone = getSessionFlag('iab:first-action')
      setBannerMode(firstDone ? 'compact' : 'full')
    }
  }, [])

  // Banner route switch + first action compression
  useEffect(() => {
    if (isReaderRoute) {
      setBannerMode('hidden')
      return
    }
    if (isInApp) {
      const firstDone = getSessionFlag('iab:first-action')
      setBannerMode(firstDone ? 'compact' : 'full')
    }
  }, [isReaderRoute, isInApp])

  useEffect(() => {
    if (!isInApp || isReaderRoute) return
    const onFirst = () => {
      if (!getSessionFlag('iab:first-action')) {
        setSessionFlag('iab:first-action', true)
        setBannerMode('compact')
      }
      window.removeEventListener('pointerdown', onFirst, true)
      window.removeEventListener('keydown', onFirst, true)
      window.removeEventListener('touchstart', onFirst, true)
    }
    window.addEventListener('pointerdown', onFirst, true)
    window.addEventListener('keydown', onFirst, true)
    window.addEventListener('touchstart', onFirst, true)
    return () => {
      window.removeEventListener('pointerdown', onFirst, true)
      window.removeEventListener('keydown', onFirst, true)
      window.removeEventListener('touchstart', onFirst, true)
    }
  }, [isInApp, isReaderRoute])

  // Track fullscreen and keep mobile layout briefly after exiting on mobile
  useEffect(() => {
    const onFs = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement
      setIsFullscreen(!!fsEl)
      setSessionFlag('fs:active', !!fsEl)
      if (!fsEl && window.innerWidth < 769) {
        document.body.classList.add('force-mobile')
        setTimeout(() => document.body.classList.remove('force-mobile'), 1500)
      }
    }
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('webkitfullscreenchange', onFs)
    onFs()
    return () => {
      document.removeEventListener('fullscreenchange', onFs)
      document.removeEventListener('webkitfullscreenchange', onFs)
    }
  }, [])// Fullscreen helpers
  // Fallback pseudo-fullscreen for in-app browsers that don't support Fullscreen API
  const enablePseudoFullscreen = useCallback(() => {
    try {
      document.documentElement.classList.add('pseudo-fullscreen')
      document.body.classList.add('pseudo-fullscreen')
      setSessionFlag('fs:pseudo', true)
      const apply = () => {
        try { document.documentElement.style.setProperty('--inner-h', `${window.innerHeight}px`) } catch {}
        try { window.scrollTo(0, 1) } catch {}
      }
      apply()
      const onResize = () => setTimeout(apply, 100)
      const onOrient = () => setTimeout(apply, 300)
      window.addEventListener('resize', onResize, { passive: true })
      window.addEventListener('orientationchange', onOrient, { passive: true })
    } catch {}
  }, [])

  const enterFullscreen = useCallback(async () => {
    const isInAppBrowser = detectInApp()
    const el = document.documentElement
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen || el.mozRequestFullScreen
    if (typeof req === 'function') {
      try { await req.call(el) } catch {}
    }
    if (isInAppBrowser) {
      enablePseudoFullscreen()
    }
  }, [enablePseudoFullscreen])

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen()
      else if (document.webkitExitFullscreen) await document.webkitExitFullscreen()
    } catch {}
    try {
      document.documentElement.classList.remove('pseudo-fullscreen')
      document.body.classList.remove('pseudo-fullscreen')
      setSessionFlag('fs:pseudo', false)
      setSessionFlag('fs:active', false)
    } catch {}
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen().catch(() => {})
    } else {
      enterFullscreen().catch(() => {})
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen])

  const openInBrowser = () => {
    try {
      const ua = navigator.userAgent || navigator.vendor || window.opera
      const isAndroid = /Android/i.test(ua)
      const url = window.location.href.split('#')[0]
      if (isAndroid) {
        const proto = (location.protocol || 'https:').replace(':', '')
        const intent = `intent://${location.host}${location.pathname}${location.search}#Intent;scheme=${proto};package=com.android.chrome;end`
        window.location.href = intent
        setTimeout(() => {
          try { window.open(url, '_blank', 'noopener') } catch {}
        }, 400)
      } else {
        const a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.rel = 'noopener'
        document.body.appendChild(a)
        a.click()
        a.remove()
      }
    } catch {}
  }

  const copyLink = async () => {
    const url = window.location.href
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        return
      }
    } catch {}
    try {
      const tmp = document.createElement('textarea')
      tmp.value = url
      tmp.setAttribute('readonly', '')
      tmp.style.position = 'absolute'
      tmp.style.left = '-9999px'
      document.body.appendChild(tmp)
      tmp.select()
      document.execCommand('copy')
      document.body.removeChild(tmp)
    } catch {}
  }

  // Open/toggle the bookmarks popover anchored to the triggering button
  const openBookmarksPanel = (e, from = 'quickbar') => {
    // Toggle close if opened from the same origin
    if (showBmPanel && bmOrigin?.from === from) {
      setShowBmPanel(false)
      try { e?.currentTarget?.blur() } catch {}
      return
    }
    try {
      const tale = tales?.[0]
      const taleId = tale?.id || 'tale1'
      const chapters = Array.isArray(tale?.chapters) ? tale.chapters : []
      const items = []
      for (const ch of chapters) {
        const cid = String(ch?.id || '')
        if (!cid) continue
        const fav = isFavorite(taleId, cid)
        if (fav) {
          items.push({ chapterId: cid, title: ch?.title || `Chapitre ${cid}`, count: 1, pageIndex: 0 })
        }
      }
      setBmItems(items)
      // Compute anchor from triggering element
      try {
        const btn = e?.currentTarget
        if (btn) {
          const r = btn.getBoundingClientRect()
          const gap = 10
          // default: bottom placement
          let side = 'bottom'
          let left = Math.round(r.left + r.width / 2)
          let top = Math.round(r.bottom + gap)
          if (from === 'quickbar') {
            side = 'left'
            left = Math.round(r.left - gap)
            top = Math.round(r.top + r.height / 2)
          } else if (from === 'hero') {
            const landscape = (() => { try { return window.matchMedia('(orientation: landscape)').matches } catch { return false } })()
            if (window.innerWidth >= 1024 || (landscape && window.innerWidth >= 768)) {
              side = 'right'
              left = Math.round(r.right + gap)
              top = Math.round(r.top + r.height / 2)
            }
          }
          // Clamp and avoid quickbar area
          const vw = Math.max(320, window.innerWidth || 0)
          const isPortrait = (() => { try { return window.matchMedia('(orientation: portrait)').matches } catch { return vw < (window.innerHeight||0) } })()
          const margin = 16
          const panelWidthFor = (s) => {
            if (s === 'left') {
              if (isPortrait && vw <= 480) return Math.min(vw * 0.86, 320)
              if (isPortrait && vw <= 1024) return Math.min(vw * 0.80, 360)
              return Math.min(vw * 0.92, 360)
            }
            if (s === 'bottom') {
              if (isPortrait && vw <= 480) return Math.min(vw * 0.96, 420)
              if (isPortrait && vw <= 1024) return Math.min(vw * 0.92, 420)
              return Math.min(vw * 0.92, 420)
            }
            if (isPortrait && vw <= 480) return Math.min(vw * 0.92, 360)
            if (isPortrait && vw <= 1024) return Math.min(vw * 0.92, 420)
            return Math.min(vw * 0.92, 420)
          }
          const pw = panelWidthFor(side)
          // avoid quickbar column if visible
          try {
            const qbVisible = !!showFab
            const qb = document.querySelector('.quickbar')
            if (qbVisible && qb) {
              const qbr = qb.getBoundingClientRect()
              const avoidRight = Math.max(0, qbr.left - margin)
              if (side === 'bottom') {
                const centerMax = avoidRight - pw / 2
                left = Math.min(left, centerMax)
              } else if (side === 'right') {
                left = Math.min(left, avoidRight - pw)
              }
            }
          } catch {}
          if (side === 'left') {
            left = Math.max(margin + pw + 8, left)
          } else if (side === 'right') {
            left = Math.min(vw - margin - pw, left)
            left = Math.max(margin, left)
          } else {
            const minLeft = margin + pw / 2
            const maxLeft = vw - margin - pw / 2
            left = Math.max(minLeft, Math.min(left, maxLeft))
            try {
              const qbVisible = !!showFab
              const qb = document.querySelector('.quickbar')
              if (qbVisible && qb) {
                const qbr = qb.getBoundingClientRect()
                const avoidRight = Math.max(0, qbr.left - margin)
                const maxLeftQB = avoidRight - pw / 2
                left = Math.max(minLeft, Math.min(left, maxLeftQB))
              }
            } catch {}
          }
          // vertical clamp
          const minY = 40
          const maxY = Math.max(minY + 1, (window.innerHeight || 0) - 40)
          top = Math.max(minY, Math.min(top, maxY))
          setBmOrigin({ left, top, side, from })
        } else {
          setBmOrigin({ left: null, top: null, side: 'bottom', from })
        }
      } catch { setBmOrigin({ left: null, top: null, side: 'bottom', from }) }
      setShowBmPanel(true)
    } catch {
      setBmItems([])
      setShowBmPanel(true)
    }
    try { e?.currentTarget?.blur() } catch {}
  }

  // Scroll-to-top hint (hub only): shows on upward scroll, hides with quickbar
  useEffect(() => {
    if (isReaderRoute) { setShowScrollTop(false); return }
    if (!showFab) { setShowScrollTop(false) }
    let last = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0)
    let sticky = false
    let scheduled = false
    let lastRun = 0
    const THROTTLE_MS = 80
    const evalState = () => {
      const y = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0)
      const up = y < last - 4
      const down = y > last + 4
      const deep = y > 150
      if (!sticky) {
        if (deep && up && showFab) { sticky = true; setShowScrollTop(true) }
      } else {
        if (down || !showFab) { sticky = false; setShowScrollTop(false) }
      }
      last = y
      scheduled = false
      lastRun = performance.now()
    }
    const onTick = () => {
      if (scheduled) return
      const now = performance.now()
      if (now - lastRun >= THROTTLE_MS) {
        scheduled = true
        requestAnimationFrame(evalState)
      } else {
        scheduled = true
        setTimeout(() => requestAnimationFrame(evalState), THROTTLE_MS - (now - lastRun))
      }
    }
    window.addEventListener('scroll', onTick, { passive: true })
    window.addEventListener('resize', onTick, { passive: true })
    evalState()
    return () => {
      window.removeEventListener('scroll', onTick)
      window.removeEventListener('resize', onTick)
    }
  }, [isReaderRoute, showFab])

  // Sync favorites across contexts (e.g., when toggled in reader)
  useEffect(() => {
    const onStorage = (ev) => {
      try {
        if (typeof ev?.key === 'string' && ev.key.startsWith('st:fav:')) {
          setFavTick((t) => t + 1)
        }
      } catch {}
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Floating actions bar visibility when hero actions are off-screen
  useEffect(() => {
    const target = actionsRef.current
    if (isReaderRoute || !target || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((entries) => {
      const e = entries[0]
      setShowFab(!e.isIntersecting)
    }, { threshold: 0.01 })
    io.observe(target)
    return () => io.disconnect()
  }, [isReaderRoute])

  // Pre-hub blank page with a single entry button
  if (!isReaderRoute && !isHubRoute) {
    return (
      <div className="pre-hub" data-theme="osrase">
        <div className="pre-hub__inner">
          <section className="pre-hub__hero">
            <div className="pre-hub__hero-grid">
              <div className="pre-hub__media">
                <div className="pre-hub__poster">
                  <img
                    src={heroImgUrl}
                    alt="Illustration de l'univers Osrase"
                    loading="eager"
                    fetchpriority="high"
                    width="640"
                    height="800"
                  />
                </div>
              </div>
              <div className="pre-hub__hero-text">
                <p className="pre-hub__lead">
                  Deux frères en quête de vengeance sont propulsés dans la machinerie du pouvoir : l’un par le système, l’autre par la révolte. Rendez-vous au sommet.
                </p>
                <button
                  type="button"
                  className="pre-hub__cta pre-hub__cta--wide"
                  onClick={() => { window.location.hash = '#/hub' }}
                >
                  Commencer la lecture
                </button>
                <div className="pre-hub__cta-row">
                  <button
                    type="button"
                    className="pre-hub__cta-icon"
                    aria-label="Bande-annonce"
                    onClick={() => {
                      try {
                        const teaser = document.querySelector('.pre-hub__video iframe')
                        if (teaser) teaser.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      } catch {}
                    }}
                  >
                    🎬
                  </button>
                  <button
                    type="button"
                    className="pre-hub__cta-icon"
                    aria-label="Marque-page"
                    onClick={(e) => openBookmarksPanel(e, 'hero')}
                  >
                    🔖
                  </button>
                  <button
                    type="button"
                    className="pre-hub__cta-icon"
                    aria-label="Crédits"
                    onClick={() => {
                      setShowCreditsInline(v => !v)
                    }}
                  >
                    📜
                  </button>
                </div>
                <div className="pre-hub__icon-row pre-hub__icon-row--desktop" aria-hidden="true">
                  <div className="pre-hub__icon-chip">
                    <div className="pre-hub__icon pre-hub__icon--book" data-icon="📖"></div>
                    <span className="pre-hub__icon-label">26 chapitres</span>
                  </div>
                  <div className="pre-hub__icon-chip">
                    <div className="pre-hub__icon pre-hub__icon--vinyl" data-icon="💿"></div>
                    <span className="pre-hub__icon-label">8 thèmes</span>
                  </div>
                  <div className="pre-hub__icon-chip">
                    <div className="pre-hub__icon pre-hub__icon--bubble" data-icon="💬"></div>
                    <span className="pre-hub__icon-label">Dialogues</span>
                  </div>
                  <div className="pre-hub__icon-chip">
                    <div className="pre-hub__icon pre-hub__icon--photo" data-icon="📷"></div>
                    <span className="pre-hub__icon-label">20 illustrations</span>
                  </div>
                </div>
                {showCreditsInline && (
                  <div className="pre-hub__credits-inline">
                    <div className="pre-hub__credits-grid">
                      <div className="pre-hub__credit-stack">
                        <h3 className="pre-hub__credit-head">Tale</h3>
                        <ul className="pre-hub__credit-lines">
                          {artistData.auteurs.map((p) => (
                            <li key={p.id} className="pre-hub__credit-line">
                              <span className="pre-hub__credit-name">{p.name}</span>
                              <span className="pre-hub__credit-role">{p.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pre-hub__credit-stack">
                        <h3 className="pre-hub__credit-head">Sound</h3>
                        <ul className="pre-hub__credit-lines">
                          {artistData.compositeurs.map((p) => (
                            <li key={p.id} className="pre-hub__credit-line">
                              <span className="pre-hub__credit-name">{p.name}</span>
                              <span className="pre-hub__credit-role">{p.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pre-hub__credit-stack pre-hub__credit-stack--voice">
                        <h3 className="pre-hub__credit-head">Comédiens voix</h3>
                        <ul className="pre-hub__credit-lines">
                          {voiceData.map((v) => (
                            <li key={v.id} className="pre-hub__credit-line">
                              <span className="pre-hub__credit-name">{v.name}</span>
                              <span className="pre-hub__credit-role">{v.roleLabel}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="pre-hub__pillars" aria-label="Production originale">
            <p className="pre-hub__eyebrow pre-hub__eyebrow--small">PRODUCTION ORIGINALE</p>
            <div className="pre-hub__brandline">
              <img
                className="pre-hub__wordmark"
                src={wordmarkUrl}
                alt="Sound Tales"
                loading="lazy"
              />
            </div>
            <div className="pre-hub__swipe" aria-label="Parcourir l'univers">
              <div className="pre-hub__pane pre-hub__pane--chapters">
                <div className="pre-hub__chapter-grid" aria-busy={loadingTales}>
                  {(() => {
                    const raw = loadingTales ? Array.from({ length: 26 }) : (tales?.[0]?.chapters || [])
                    const base = Array.isArray(raw) ? [...raw] : []
                    const desired = 26
                    if (!loadingTales && base.length < desired) {
                      for (let i = base.length; i < desired; i += 1) {
                        base.push({ id: `placeholder-${i + 1}`, title: `Chapitre ${i + 1}` })
                      }
                    }
                    return base.slice(0, desired)
                  })().map((ch, idx) => {
                    const chapterId = String(ch?.id || idx + 1)
                    const tale = tales?.[0]
                    const taleId = tale?.id || 'tale1'
                    const unlocked = !!(ents?.tales?.[taleId] || ents?.chapters?.[`${taleId}:${chapterId}`])
                    const label = ch?.title || `Chapitre ${chapterId}`
                    const img = loadingTales ? null : (tale?.cover || `https://picsum.photos/800/450?random=${chapterId}`)
                    return (
                      <article
                        key={chapterId}
                        className={`pre-hub__chapter-card ${loadingTales ? 'is-loading' : ''}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (loadingTales) return
                          try { getAudioEngine().ensureStarted() } catch {}
                          const payload = { id: chapterId, img, title: tale?.title || 'OSRASE' }
                          try { sessionStorage.setItem('reader:splash', JSON.stringify(payload)) } catch {}
                          window.location.hash = `#/reader/${chapterId}`
                        }}
                        onKeyDown={(e) => {
                          if (loadingTales) return
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            try { getAudioEngine().ensureStarted() } catch {}
                            const payload = { id: chapterId, img, title: tale?.title || 'OSRASE' }
                            try { sessionStorage.setItem('reader:splash', JSON.stringify(payload)) } catch {}
                            window.location.hash = `#/reader/${chapterId}`
                          }
                        }}
                      >
                        <div
                          className="pre-hub__chapter-thumb"
                          style={img ? { backgroundImage: `url('${img}')` } : {}}
                          aria-hidden="true"
                        >
                          {!loadingTales && <span className="pre-hub__chapter-badge">{unlocked ? chapterId : '?'}</span>}
                        </div>
                        <div className="pre-hub__chapter-texts">
                          <p className="pre-hub__chapter-title">{`${chapterId}. ${label}`}</p>
                          {!loadingTales && (
                            <span className="pre-hub__chapter-meta">~5 min • OSRASE</span>
                          )}
                        </div>
                        {!loadingTales && (
                          <p className="pre-hub__chapter-desc">Résumé à venir.</p>
                        )}
                      </article>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      )
    }

  // Render reader shell when on reader route
  if (isReaderRoute) {
    const id = (route.match(/^#\/?reader\/(.+)$/i) || [])[1] || '1'
    return <ReaderShell chapterId={decodeURIComponent(id)} baseUrl={baseUrl} />
  }

  return (
    <div className="page" data-role="hub">
      {/* Quick actions on the right: Play, Bookmark */}
      {(!isReaderRoute) && (
        <Quickbar
          visible={showFab}
          showScrollTop={showScrollTop}
          baseUrl={baseUrl}
          onScrollTop={() => { try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch { window.scrollTo(0,0) } }}
          onPlay={(e) => {
            try { getAudioEngine().ensureStarted() } catch {}
            const primary = tales?.[0]
            const taleId = primary?.id || 'tale1'
            let prog = null
            try { prog = JSON.parse(localStorage.getItem(`reader:progress:${taleId}`) || 'null') } catch {}
            let targetChapter = primary?.chapters?.[0]?.id || '1'
            let resume = null
            if (prog && prog.chapterId) {
              targetChapter = String(prog.chapterId)
              resume = { chapterId: String(prog.chapterId), pageIndex: Math.max(0, parseInt(prog.pageIndex || 0, 10) || 0) }
            }
            const chapterId = String(targetChapter)
            const img = primary?.cover || `https://picsum.photos/800/450?random=${chapterId}`
            const payload = { id: String(chapterId), img, title: primary?.title || 'OSRASE' }
            try {
              sessionStorage.setItem('reader:splash', JSON.stringify(payload))
              if (resume) sessionStorage.setItem('reader:resume', JSON.stringify(resume))
              else sessionStorage.removeItem('reader:resume')
            } catch {}
            window.location.hash = `#/reader/${chapterId}`
            try { e?.currentTarget?.blur() } catch {}
          }}
          onOpenBookmarks={(e) => openBookmarksPanel(e, 'quickbar')}
          onToggleFullscreen={toggleFullscreen}
          fullscreenActive={isFullscreen}
        />
      )}
      <IABanner
        inApp={isInApp}
        mode={bannerMode}
        onOpen={openInBrowser}
        onCopy={copyLink}
      />
      <header className="hero">
        <div className="hero__fade" aria-hidden="true"></div>

        <div className="hero__content">
          {/* Eyebrow (top line) */}
          <span className="hero__eyebrow" ref={eyebrowRef}>
            <span className="hero__eyebrow-primary">SOUND TALES</span>
            <span className="hero__eyebrow-secondary">{' PR\u00C9SENTE'}</span>
          </span>

          {/* Main title */}
          <h1 className="hero__title" ref={titleRef}>OSRASE</h1>

          {/* Badges directly under title */}
          <div className="hero__meta">
            <span className="hero__tag">Dystopique et Aventure</span>
            <span className="hero__tag hero__tag--age">18+</span>
          </div>


          {/* Actions (CTA + bookmark) */}
          <div className="hero__actions" ref={actionsRef}>
            <button className="hero__cta" type="button"
              onClick={() => {
                try { getAudioEngine().ensureStarted() } catch {}
                const primary = tales?.[0]
                const taleId = primary?.id || 'tale1'
                let last = null
                try { last = localStorage.getItem(`reader:progress:${taleId}`) } catch {}
                const firstChapter = primary?.chapters?.[0]?.id || '1'
                const chapterId = String(last || firstChapter)
                const img = primary?.cover || `https://picsum.photos/800/450?random=${chapterId}`
                const payload = { id: String(chapterId), img, title: primary?.title || 'OSRASE' }
                try { sessionStorage.setItem('reader:splash', JSON.stringify(payload)) } catch {}
                window.location.hash = `#/reader/${chapterId}`
              }}
            >{(() => { const primary = tales?.[0]; const taleId = primary?.id || 'tale1'; try { return localStorage.getItem(`reader:progress:${taleId}`) ? 'Reprendre le tale' : 'LIRE LE TALE' } catch { return 'LIRE LE TALE' } })()}</button>
            <button className="hero__bookmark" type="button" aria-label="Ouvrir les signets" onClick={(e) => openBookmarksPanel(e, 'hero')}>
              <svg className="hero__bookmark-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

            <main className="gallery" aria-busy={loadingTales}>
        {(loadingTales ? Array.from({ length: 6 }) : (tales?.[0]?.chapters || [])).map((ch, idx) => {
          const chapterId = String(ch?.id || idx + 1)
          const tale = tales?.[0]
          const taleId = tale?.id || 'tale1'
          const unlocked = !!(ents?.tales?.[taleId] || ents?.chapters?.[`${taleId}:${chapterId}`])
          const label = ch?.title || `Chapitre ${chapterId}`
          const img = tale?.cover || `https://picsum.photos/800/450?random=${chapterId}`
          const fav = isFavorite(taleId, chapterId)
          return (
            <article
              key={chapterId}
              className={`card ${loadingTales ? "card--skeleton" : ""}` }
              role="button"
              tabIndex={0}
              onClick={() => {
                try { getAudioEngine().ensureStarted() } catch {}
                const payload = { id: chapterId, img, title: tale?.title || 'OSRASE' }
                try { sessionStorage.setItem('reader:splash', JSON.stringify(payload)) } catch {}
                window.location.hash = `#/reader/${chapterId}`
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault();
                try { getAudioEngine().ensureStarted() } catch {}
                const payload = { id: chapterId, img, title: tale?.title || 'OSRASE' }
                try { sessionStorage.setItem('reader:splash', JSON.stringify(payload)) } catch {}
                window.location.hash = `#/reader/${chapterId}`
              }}}
            >
              {!loadingTales && (
                <button
                  type="button"
                  className={`card__fav ${fav ? 'is-on' : ''}`}
                  aria-label={fav ? 'Retirer des signets' : 'Ajouter aux signets'}
                  aria-pressed={fav}
                  onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(taleId, chapterId, !fav)
                    setFavTick(t => t + 1)
                  }}
                  title={fav ? 'Retirer des signets' : 'Ajouter aux signets'}
                ><svg className="hero__bookmark-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1z" /></svg></button>
              )}
              <h2 className="card__label">{label}</h2>
              <div
                className="card__media"
                style={{ backgroundImage: `url('${img}')` }}
              >
                <div className="card__overlay"></div>
                <span className="card__badge">{unlocked ? chapterId : 'ðŸ”’'}</span>
              </div>
            </article>
          )
        })}
      </main>
      {showBmPanel && (
        <BookmarksPanel
          origin={bmOrigin}
          items={bmItems}
          onClose={() => setShowBmPanel(false)}
          onSelect={(it) => {
            try { getAudioEngine().ensureStarted() } catch {}
            const tale = tales?.[0]
            const taleId = tale?.id || 'tale1'
            const chapterId = String(it.chapterId)
            const img = tale?.cover || `https://picsum.photos/800/450?random=${chapterId}`
            const payload = { id: String(chapterId), img, title: tale?.title || 'OSRASE' }
            try {
              sessionStorage.setItem('reader:splash', JSON.stringify(payload))
              sessionStorage.setItem('reader:resume', JSON.stringify({ chapterId, pageIndex: it.pageIndex }))
            } catch {}
            window.location.hash = `#/reader/${chapterId}`
          }}
        />
      )}
      {/* Deprecated FAB removed in favor of .quickbar */}
    </div>
  )
}





















