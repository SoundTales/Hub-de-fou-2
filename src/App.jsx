import { useEffect, useRef, useState } from 'react'

export default function App() {
  const eyebrowRef = useRef(null)
  const titleRef = useRef(null)
  const actionsRef = useRef(null)
  const [showFab, setShowFab] = useState(false)
  const [showGate, setShowGate] = useState(true)
  const [gateState, setGateState] = useState('idle')
  // Fix baseUrl to work in both dev and production
  const baseUrl = import.meta.env.BASE_URL || './'

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

  // Gate helpers: fullscreen + one-shot audio signature
  const enterFullscreen = async () => {
    const el = document.documentElement
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen || el.mozRequestFullScreen
    if (typeof req === 'function') {
      try { await req.call(el) } catch {}
    }
  }

  const startGate = async () => {
    if (gateState !== 'idle') return
    setGateState('starting')
    await enterFullscreen()
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      setGateState('finishing')
      // keep DOM long enough for CSS fade (900ms) to complete comfortably
      setTimeout(() => setShowGate(false), 1100)
    }
    try {
      // Try multiple possible paths for the audio file
      const possiblePaths = [
        `${baseUrl}signature.mp3`,
        `./signature.mp3`,
        `/Hub-de-fou-2/signature.mp3`,
        `signature.mp3`
      ]
      
      let audioLoaded = false
      const audio = new Audio()
      
      for (const path of possiblePaths) {
        try {
          audio.src = path
          await new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', resolve, { once: true })
            audio.addEventListener('error', reject, { once: true })
            audio.load()
          })
          audioLoaded = true
          break
        } catch {
          continue
        }
      }
      
      if (audioLoaded) {
        audio.addEventListener('ended', finish, { once: true })
        await audio.play()
        // Start fading out after 4 seconds
        setTimeout(finish, 4000)
      } else {
        console.warn('Could not load signature.mp3')
        setTimeout(finish, 4000)
      }
    } catch (error) {
      console.warn('Audio playback failed:', error)
      setTimeout(finish, 4000)
    }
  }

  // Floating actions bar visibility when hero actions are off-screen
  useEffect(() => {
    const target = actionsRef.current
    if (!target || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((entries) => {
      const e = entries[0]
      setShowFab(!e.isIntersecting)
    }, { threshold: 0.01 })
    io.observe(target)
    return () => io.disconnect()
  }, [])

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__fade" aria-hidden="true"></div>

        <div className="hero__content">
          {/* Eyebrow (top line) */}
          <span className="hero__eyebrow" ref={eyebrowRef}>
            <span className="hero__eyebrow-primary">SOUND TALES</span>
            <span className="hero__eyebrow-secondary"> PRODUCTION</span>
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
            <button className="hero__cta" type="button">LIRE LE TALE</button>
            <button className="hero__bookmark" type="button" aria-label="Ajouter aux favoris">
              <svg className="hero__bookmark-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="gallery">
        {Array.from({ length: 22 }, (_, i) => (
          <article key={i + 1} className="card">
            <h2 className="card__label">Resignation</h2>
            <div
              className="card__media"
              style={{
                backgroundImage: `url('https://picsum.photos/800/450?random=${i + 1}')`
              }}
            >
              <div className="card__overlay"></div>
              <span className="card__badge">{i + 1}</span>
            </div>
          </article>
        ))}
      </main>

      {showGate && (
        <div className={`gate ${gateState === 'starting' ? 'is-starting' : ''} ${gateState === 'finishing' ? 'is-finishing' : ''}`}>
          <button className="gate__hit" aria-label="Lancer la liseuse" onClick={startGate}>
            <span className="gate__msg">Touchez l'écran pour lancer la liseuse</span>
            {/* Try multiple paths for the logo */}
            <img 
              className="gate__logo" 
              src={`${baseUrl}logo.svg`} 
              alt="Logo"
              onError={(e) => {
                // Fallback paths if main path fails
                const fallbacks = [`./logo.svg`, `/Hub-de-fou-2/logo.svg`, `logo.svg`]
                const currentSrc = e.target.src
                const nextFallback = fallbacks.find(path => !currentSrc.includes(path))
                if (nextFallback) {
                  e.target.src = nextFallback
                }
              }}
            />
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









