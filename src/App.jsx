import { useEffect, useRef } from 'react'

export default function App() {
  const eyebrowRef = useRef(null)
  const titleRef = useRef(null)

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
          <div className="hero__actions">
            <button className="hero__cta" type="button">LIRE LE TALE</button>
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
    </div>
  )
}
