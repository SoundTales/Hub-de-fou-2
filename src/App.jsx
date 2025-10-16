import { useEffect, useRef, useState } from 'react'
import ReaderShell from './reader/ReaderShell.jsx'
import { getAudioEngine } from './reader/audioSingleton.js'
import { getTales, getEntitlements } from './api/client.js'
import HubSplashLogo from './HubSplashLogo.jsx'

export default function App() {
  const eyebrowRef = useRef(null)
  const titleRef = useRef(null)
  const actionsRef = useRef(null)
  const [showFab, setShowFab] = useState(false)
  const [showGate, setShowGate] = useState(true)
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

  const startGate = async () => {
    if (gateState !== 'idle') return
    // Instantly switch to logo state (no crossfade with the message)
    setGateState('logo')
    // Detect in-app browsers
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    const isInAppBrowser = /FBAN|FBAV|Instagram|Messenger|Line\//i.test(userAgent) || /; wv\)/i.test(userAgent)

    // Add no-scroll class only when safe (desktop/regular browsers)
    if (!isInAppBrowser && window.innerWidth > 768) {
      document.body.classList.add('no-scroll')
    }
    
    // Don't await here to preserve user gesture chain for audio
    try { getAudioEngine().ensureStarted() } catch {} ; enterFullscreen()
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      setGateState('finishing')
      // Remove no-scroll class when gate is finishing
      document.body.classList.remove('no-scroll')
      // keep DOM long enough for CSS fade (500ms) to complete comfortably
      setTimeout(() => setShowGate(false), 650)
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
            <button className="hero__bookmark" type="button" aria-label="Ajouter aux favoris">
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
      {showGate && (
        <div className={`gate ${gateState === 'starting' ? 'is-starting' : ''} ${(gateState === 'logo' || gateState === 'finishing') ? 'is-logo' : ''} ${gateState === 'finishing' ? 'is-finishing' : ''}`}>
          <button className="gate__hit" aria-label="Lancer la liseuse" onClick={startGate}>
            <span className="gate__msg">Touchez l'écran pour lancer la liseuse</span>
            <HubSplashLogo baseUrl={baseUrl} />
          </button>
        </div>
      )}

      {showFab && (
        <div className="fab" role="region" aria-label="Actions rapides">
          <button className="hero__cta" type="button">LIRE LE TALE</button>
          <button className="hero__bookmark" type="button" aria-label="Ajouter aux favoris">
            <svg className="hero__bookmark-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
















