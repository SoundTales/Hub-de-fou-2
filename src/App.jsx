import { useEffect, useRef, useState } from 'react'
import ReaderShell from './reader/ReaderShell.jsx'
import { getAudioEngine } from './reader/audioSingleton.js'
import { createPortal } from 'react-dom'
import { getTales, getEntitlements } from './api/client.js'
import HubSplashLogo from './HubSplashLogo.jsx'

export default function App() {
  const eyebrowRef = useRef(null)
  const titleRef = useRef(null)
  const actionsRef = useRef(null)
  const gateRef = useRef(null)
  const [showFab, setShowFab] = useState(false)
  const [showGate, setShowGate] = useState(() => {
    try { return sessionStorage.getItem('hub:gateDismissed') === '1' ? false : true } catch { return true }
  })
  const [gateState, setGateState] = useState('idle')
  // Fix baseUrl to work in both dev and production
  const baseUrl = import.meta.env.BASE_URL || './'
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
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Lock body scroll while gate is visible (all devices/in-app too)
  useEffect(() => {
    try {
      if (showGate) document.body.classList.add('no-scroll')
      else document.body.classList.remove('no-scroll')
    } catch {}
    return () => { try { document.body.classList.remove('no-scroll') } catch {} }
  }, [showGate])

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
  const isReaderRoute = /^#\/?reader\//i.test(route)

  useEffect(() => {
    if (!isReaderRoute) {
      try { document.body.dataset.mode = 'hub' } catch {}
    }
    return () => { try { delete document.body.dataset.mode } catch {} }
  }, [isReaderRoute])

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
    const ua = navigator.userAgent || navigator.vendor || window.opera
    const inApp = /FBAN|FBAV|Instagram|Messenger|Line\//i.test(ua) || /; wv\)/i.test(ua) || /FB_IAB/i.test(ua)
    setIsInApp(inApp)
    if (inApp) {
      const firstDone = localStorage.getItem('iab:firstActionDone') === '1'
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
      const firstDone = localStorage.getItem('iab:firstActionDone') === '1'
      setBannerMode(firstDone ? 'compact' : 'full')
    }
  }, [isReaderRoute, isInApp])

  useEffect(() => {
    if (!isInApp || isReaderRoute) return
    const onFirst = () => {
      if (localStorage.getItem('iab:firstActionDone') !== '1') {
        try { localStorage.setItem('iab:firstActionDone','1') } catch {}
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
      try { sessionStorage.setItem('hub:fs', fsEl ? '1' : '0') } catch {}
      if (!fsEl && window.innerWidth < 769) {
        document.body.classList.add('force-mobile')
        setTimeout(() => document.body.classList.remove('force-mobile'), 1500)
      }
    }
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('webkitfullscreenchange', onFs)
    // initialize state
    onFs()
    return () => {
      document.removeEventListener('fullscreenchange', onFs)
      document.removeEventListener('webkitfullscreenchange', onFs)
    }
  }, [])// Gate helpers: fullscreen + one-shot audio signature
  // Fallback pseudo-fullscreen for in-app browsers that don't support Fullscreen API
  const enablePseudoFullscreen = () => {
    try {
      document.documentElement.classList.add('pseudo-fullscreen')
      document.body.classList.add('pseudo-fullscreen')
      try { sessionStorage.setItem('hub:pseudoFS','1') } catch {}
      const apply = () => {
        try { document.documentElement.style.setProperty('--inner-h', `${window.innerHeight}px`) } catch {}
        try { window.scrollTo(0, 1) } catch {}
      }
      apply()
      // Update on viewport changes
      const onResize = () => setTimeout(apply, 100)
      const onOrient = () => setTimeout(apply, 300)
      window.addEventListener('resize', onResize, { passive: true })
      window.addEventListener('orientationchange', onOrient, { passive: true })
    } catch {}
  }

  const enterFullscreen = async () => {
    // Detect in-app browsers (Facebook, Instagram, etc.)
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    const isInAppBrowser = /FBAN|FBAV|Instagram|Messenger|Line\//i.test(userAgent) ||
                          /; wv\)/i.test(userAgent) || // Android WebView
                          /FB_IAB|FBAN|FBAV/i.test(userAgent)

    // Always try the Fullscreen API on user gesture
    const el = document.documentElement
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen || el.mozRequestFullScreen
    if (typeof req === 'function') {
      try { await req.call(el) } catch {}
    }

    // In in-app browsers, fall back to pseudo-fullscreen to maximize viewport
    if (isInAppBrowser) {
      enablePseudoFullscreen()
    }
  }

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen()
      else if (document.webkitExitFullscreen) await document.webkitExitFullscreen()
    } catch {}
    try {
      document.documentElement.classList.remove('pseudo-fullscreen')
      document.body.classList.remove('pseudo-fullscreen')
      sessionStorage.setItem('hub:pseudoFS','0')
      sessionStorage.setItem('hub:fs','0')
    } catch {}
  }

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
        let fav = false
        try { fav = (localStorage.getItem(`hub:fav:${taleId}:${cid}`) === '1') } catch { fav = false }
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
            const qbVisible = !!(showFab && !showGate)
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
              const qbVisible = !!(showFab && !showGate)
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
    if (isReaderRoute || showGate) { setShowScrollTop(false); return }
    // If quickbar is off, also hide scrolltop to keep sync
    if (!showFab) { setShowScrollTop(false) }
    let last = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0)
    let sticky = false, ticking = false
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
      last = y; ticking = false
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(evalState) } }
    const onResize = onScroll
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    evalState()
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize) }
  }, [isReaderRoute, showGate, showFab])

  // Sync favorites across contexts (e.g., when toggled in reader)
  useEffect(() => {
    const onStorage = (ev) => {
      try {
        if (typeof ev?.key === 'string' && ev.key.startsWith('hub:fav:')) {
          setFavTick((t) => t + 1)
        }
      } catch {}
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const startGate = async () => {
    if (gateState !== 'idle') return
    // Lock layout immediately to prevent any underlay paint during viewport changes
    try {
      document.documentElement.classList.add('gate-lock')
      document.body.classList.add('gate-lock')
    } catch {}
    // Detect in-app browsers
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    const isInAppBrowser = /FBAN|FBAV|Instagram|Messenger|Line\//i.test(userAgent) || /; wv\)/i.test(userAgent)

    // Add no-scroll class only when safe (desktop/regular browsers)
    if (!isInAppBrowser && window.innerWidth > 768) {
      document.body.classList.add('no-scroll')
    }
    // Add structural veil immediately to avoid any flash during viewport changes
    try {
      let veil = document.getElementById('gate-veil')
      if (!veil) {
        veil = document.createElement('div')
        veil.id = 'gate-veil'
        Object.assign(veil.style, {
          position: 'fixed', left: '0', top: '0', right: '0', bottom: '0',
          background: '#424242', zIndex: '99999', pointerEvents: 'none'
        })
        document.body.appendChild(veil)
      }
    } catch {}
    // Force a reflow so veil/gate-lock are painted before fullscreen height change
    try { void document.body.offsetHeight } catch {}

    // Lock gate element size to visual viewport during transition
    const lockGateSize = () => {
      try {
        const h = (window.visualViewport && Math.ceil(window.visualViewport.height)) || window.innerHeight || 0
        const el = gateRef.current
        if (el && h) {
          el.style.height = h + 'px'
          el.style.minHeight = h + 'px'
          el.style.width = '100vw'
        }
      } catch {}
    }
    lockGateSize()
    const __gateSizeCleanups = []
    try {
      const onVv = () => lockGateSize()
      if (window.visualViewport && typeof window.visualViewport.addEventListener === 'function') {
        window.visualViewport.addEventListener('resize', onVv, { passive: true })
        __gateSizeCleanups.push(() => window.visualViewport.removeEventListener('resize', onVv))
      }
      const onWin = () => lockGateSize()
      window.addEventListener('resize', onWin, { passive: true })
      __gateSizeCleanups.push(() => window.removeEventListener('resize', onWin))
    } catch {}

    // Request fullscreen within the same gesture (do not await)
    try { enterFullscreen() } catch {}
    // Prime audio in the same gesture chain
    try { getAudioEngine().ensureStarted() } catch {}
    // Switch to logo once guard layers are active and FS requested
    setGateState('logo')
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      setGateState('finishing')
      // Remove no-scroll class when gate is finishing
      document.body.classList.remove('no-scroll')
      // Persist dismissal and keep DOM long enough for CSS fade (500ms)
      try { sessionStorage.setItem('hub:gateDismissed','1') } catch {}
      setTimeout(() => {
        try {
          const veil = document.getElementById('gate-veil')
          if (veil) veil.remove()
          // cleanup gate sizing locks
          for (const fn of __gateSizeCleanups) { try { fn() } catch {} }
          const el = gateRef.current
          if (el) { el.style.height = ''; el.style.minHeight = ''; el.style.width = '' }
          document.documentElement.classList.remove('gate-lock')
          document.body.classList.remove('gate-lock')
        } catch {}
        setShowGate(false)
      }, 650)
    }

    try {
      // Always try audio on user gesture (works in most in-app browsers)
      const possiblePaths = [
        `${baseUrl}signature.mp3`,
        `./signature.mp3`,
        `/Hub-de-fou-2/signature.mp3`,
        `signature.mp3`
      ]
      
      let audioLoaded = false
      const audio = new Audio()
      
      // Standard audio settings
      audio.preload = 'auto'
      audio.volume = 1.0
      audio.muted = false
      // Improve mobile / in-app compatibility
      // playsInline is a no-op for audio but harmless and helps on some WebViews
      try { audio.playsInline = true } catch {}
      
      for (const path of possiblePaths) {
        try {
          audio.src = path
          // Kick playback immediately within the gesture chain
          audio.load()
          const playPromise = audio.play()
          if (playPromise !== undefined) {
            await playPromise
          }
          audioLoaded = true
          break
        } catch {
          // Try next path
          continue
        }
      }
      
      if (audioLoaded) {
        audio.addEventListener('ended', finish, { once: true })
        try {
          const playPromise = audio.play()
          if (playPromise !== undefined) {
            await playPromise
          }
        } catch (playError) {
          console.warn('Audio play failed:', playError)
        }
        setTimeout(finish, 4000)
      } else {
        console.warn('Could not load signature.mp3')
        setTimeout(finish, 4000)
      }
    } catch (error) {
      console.warn('Audio setup failed:', error)
      setTimeout(finish, 4000)
    }
  }

  // On hub refresh: keep hub (no gate) and try to restore fullscreen state
  useEffect(() => {
    if (isReaderRoute) return
    try {
      const dismissed = sessionStorage.getItem('hub:gateDismissed') === '1'
      if (dismissed) setShowGate(false)
      const wasFS = sessionStorage.getItem('hub:fs') === '1'
      const wasPseudo = sessionStorage.getItem('hub:pseudoFS') === '1'
      if (wasFS) {
        enterFullscreen().catch(() => { if (wasPseudo) enablePseudoFullscreen() })
      } else if (wasPseudo) {
        enablePseudoFullscreen()
      }
    } catch {}
  }, [isReaderRoute])

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

  // Render reader shell when on reader route
  if (isReaderRoute) {
    const id = (route.match(/^#\/?reader\/(.+)$/i) || [])[1] || '1'
    return <ReaderShell chapterId={decodeURIComponent(id)} baseUrl={baseUrl} />
  }

  return (
    <div className="page" data-role="hub">
      {/* Quick actions on the right: Play, Bookmark */}
      {(!isReaderRoute) && (
        <div
          className={`quickbar ${(showFab && !showGate) ? 'is-on' : 'is-off'}`}
          role="region"
          aria-label="Actions rapides"
          aria-hidden={!(showFab && !showGate)}
        >
          {/* Scroll-to-top at the top of the stack */}
          <button
            className={`qbtn ${showScrollTop ? '' : 'is-hidden'}`}
            type="button"
            onClick={(e) => { try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch { window.scrollTo(0,0) } finally { try { e.currentTarget.blur() } catch {} } }}
            aria-hidden={!showScrollTop}
            aria-label="Remonter en haut"
            title="Remonter"
          >
            <span className="qicon">↑</span>
          </button>
          <button
            className="qbtn qbtn--primary"
            type="button"
            onClick={(e) => {
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
              try { e.currentTarget.blur() } catch {}
            }}
            aria-label="Lire/Reprendre"
            title="Lire/Reprendre"
          >
            <img className="qicon qicon--svg" src={`${baseUrl}icons/play.svg`} alt="" aria-hidden="true" />
          </button>
          <button
            className="qbtn qbtn--bookmark"
            type="button"
            onClick={(e) => openBookmarksPanel(e, 'quickbar')}
            aria-label="Signets: chapitres favoris"
            title="Ouvrir les signets"
          >
            <span className="qicon" aria-hidden="true">🔖</span>
          </button>
        </div>
      )}
      {!isReaderRoute && !showGate && (
        <button
          className="fs-btn"
          type="button"
          aria-label={isFullscreen ? 'Quitter le plein \u00E9cran' : 'Activer le plein \u00E9cran'}
          onClick={isFullscreen ? exitFullscreen : enterFullscreen}
          title={isFullscreen ? 'Quitter le plein \u00E9cran' : 'Activer le plein \u00E9cran'}
        >
          {isFullscreen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 4H4v5" />
              <path d="M15 4h5v5" />
              <path d="M4 15v5h5" />
              <path d="M20 15v5h-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 9V4h5" />
              <path d="M20 9V4h-5" />
              <path d="M4 15v5h5" />
              <path d="M20 15v5h-5" />
            </svg>
          )}
        </button>
      )}
      {isInApp && bannerMode === 'full' && (
        <div className="iab-banner" role="region" aria-label="Ouvrir dans le navigateur">
          <p className="iab-text">Pour profiter du plein \u00E9cran, lancez la liseuse dans votre navigateur pr\u00E9f\u00E9r\u00E9.</p>
          <div className="iab-actions">
            <button className="iab-btn" type="button" onClick={openInBrowser}>Ouvrir dans le navigateur</button>
            <button className="iab-btn iab-btn--ghost" type="button" onClick={copyLink}>Copier le lien</button>
          </div>
        </div>
      )}
      {isInApp && bannerMode === 'compact' && (
        <div className="iab-banner iab-banner--compact" role="region" aria-label="Ouvrir dans le navigateur">
          <button className="iab-btn" type="button" onClick={openInBrowser}>Ouvrir dans le navigateur</button>
        </div>
      )}<header className="hero">
        <div className="hero__fade" aria-hidden="true"></div>

        <div className="hero__content">
          {/* Eyebrow (top line) */}
          <span className="hero__eyebrow" ref={eyebrowRef}>
            <span className="hero__eyebrow-primary">SOUND TALES</span>
            <span className="hero__eyebrow-secondary"> PRÉSENTE</span>
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
          const fav = (() => { try { return localStorage.getItem(`hub:fav:${taleId}:${chapterId}`) === '1' } catch { return false } })()
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
                    try {
                      const key = `hub:fav:${taleId}:${chapterId}`
                      if (localStorage.getItem(key) === '1') localStorage.removeItem(key)
                      else localStorage.setItem(key, '1')
                    } catch {}
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
                <span className="card__badge">{unlocked ? chapterId : '🔒'}</span>
              </div>
            </article>
          )
        })}
      </main>
      {showBmPanel && (
        <div className="bm-mask" role="dialog" aria-modal="true" aria-label="Signets" onClick={() => setShowBmPanel(false)}>
          <div
            className={`bm-panel ${bmOrigin.side ? `bm--${bmOrigin.side}` : ''} ${bmOrigin.from ? `bm-from-${bmOrigin.from}` : ''}`}
            role="document"
            style={(() => {
              const s = {}
              if (typeof bmOrigin.left === 'number') s['--bm-left'] = bmOrigin.left + 'px'
              if (typeof bmOrigin.top === 'number') s['--bm-top'] = bmOrigin.top + 'px'
              return s
            })()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bm-head">
              <div className="bm-title">Signets</div>
              <button className="bm-close" aria-label="Fermer" onClick={() => setShowBmPanel(false)}>×</button>
            </div>
            <div className="bm-list">
              {bmItems.length === 0 && (
                <div className="bm-empty">Aucun chapitre en signet</div>
              )}
              {bmItems.map(it => (
                <button key={it.chapterId} className="bm-item" onClick={() => {
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
                }}>
                  <span className="bm-label">{it.title}</span>
                  <span className="bm-badge" aria-label={`${it.count} page(s) marquée(s)`}>{it.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {showGate && createPortal(
        <div ref={gateRef} className={`gate ${gateState === 'starting' ? 'is-starting' : ''} ${(gateState === 'logo' || gateState === 'finishing') ? 'is-logo' : ''} ${gateState === 'finishing' ? 'is-finishing' : ''}`}>
          <button className="gate__hit" aria-label="Lancer la liseuse" onClick={startGate}>
            <div className="gate__center">
              <span className="gate__msg">Touchez l'écran pour lancer la liseuse</span>
              <HubSplashLogo baseUrl={baseUrl} />
            </div>
          </button>
        </div>, document.body)
      }

      {/* Deprecated FAB removed in favor of .quickbar */}
    </div>
  )
}





















