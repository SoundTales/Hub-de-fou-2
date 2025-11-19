import { useEffect, useRef } from 'react'

export default function ChapterCarousel({ items, theme, onSelect, carouselRef, onUpdateNav, visible }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (carouselRef) carouselRef.current = scrollRef.current
  }, [carouselRef])

  useEffect(() => {
    if (!visible || !scrollRef.current) return
    const el = scrollRef.current
    const handleScroll = () => onUpdateNav?.()
    const handleResize = () => onUpdateNav?.()
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }
    
    requestAnimationFrame(() => {
      try { el.scrollTo({ left: 0, behavior: 'auto' }) } catch { el.scrollLeft = 0 }
      onUpdateNav?.()
    })
    
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', handleScroll)
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [visible, onUpdateNav])

  return (
    <div 
      ref={scrollRef}
      className="reader__carousel" 
      role="list" 
      aria-live="polite"
      data-theme={theme}
    >
      {items.length === 0 ? (
        <div className="reader__carousel-empty">
          Aucun contenu disponible.
        </div>
      ) : (
        items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="reader__carousel-card"
            role="listitem"
            onClick={() => onSelect?.(item)}
            aria-label={item.ariaLabel || `Chapitre ${item.badge}: ${item.title}`}
          >
            <div 
              className="reader__carousel-card-img" 
              style={{ backgroundImage: item.img ? `url('${item.img}')` : 'none' }}
              aria-hidden="true"
            >
              <span className="reader__carousel-badge">{item.badge}</span>
            </div>
            <div className="reader__carousel-card-body">
              <h3 className="reader__carousel-card-title">{item.title}</h3>
              {item.snippet && <p className="reader__carousel-card-snippet">{item.snippet}</p>}
            </div>
          </button>
        ))
      )}
    </div>
  )
}
