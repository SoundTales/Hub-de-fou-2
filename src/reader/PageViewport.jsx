import { useEffect, useRef, useState } from 'react'

function Dialogue({ block, read, onTap, onPrime }) {
  const tRef = useRef(null)
  
  // Gestionnaire de clic principal pour les dialogues
  const handleClick = (e) => {
    e.stopPropagation() // Empêcher la propagation vers le conteneur parent
    onTap?.(block.id)
  }
  const handlePointerDown = () => { try { onPrime?.() } catch {} }
  const handleKeyDown = (e) => {
    // Trigger on Enter or Space (Space needs preventDefault to avoid scroll)
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      onTap?.(block.id)
    }
  }

  // long-press placeholder
  useEffect(() => {
    const el = tRef.current
    if (!el) return
    let timer
    const down = () => { timer = setTimeout(() => {/* share action */}, 600) }
    const up = () => { clearTimeout(timer) }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('pointerleave', up)
    return () => { clearTimeout(timer); el.removeEventListener('pointerdown', down); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); el.removeEventListener('pointerleave', up) }
  }, [])
  
  return (
    <div 
      ref={tRef} 
      className={`dlg ${read ? 'dlg--read' : ''}`} 
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      aria-label={`Dialogue de ${block.speaker}: ${block.text}`}
    >
      <span className="dlg__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm1 13h-2v-2h2v2Zm0-4h-2V6h2v6z"/></svg></span>
      <span className="dlg__bar" aria-hidden="true" />
      <strong className="dlg__speaker">{block.speaker} :</strong>
      <span className="dlg__text"> {block.text}</span>
    </div>
  )
}

export default function PageViewport({ page, dir = 'next', readDialogIds, onDialogueTap, onSwipeNext, onSwipePrev, onDoubleTap, overlayOpen, onPrimeAudio }) {
  const ref = useRef(null)
  const [entering, setEntering] = useState(true)

  // Double‑tap via pointerdown (reduced latency in in‑app)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let lastTs = 0, lastX = 0, lastY = 0
    const onPd = (e) => {
      // Ignore when tapping a dialogue unless overlay already open
      if (!overlayOpen && e.target.closest('.dlg')) return
      const now = performance.now()
      const x = e.clientX, y = e.clientY
      if (now - lastTs < 300 && Math.abs(x - lastX) < 16 && Math.abs(y - lastY) < 16) {
        onDoubleTap?.()
      }
      lastTs = now; lastX = x; lastY = y
    }
    el.addEventListener('pointerdown', onPd)
    return () => el.removeEventListener('pointerdown', onPd)
  }, [onDoubleTap, overlayOpen])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.touchAction = 'none'
    let x0 = 0, y0 = 0, t0 = 0, moved = false
    const onDown = (e) => { x0 = e.clientX; y0 = e.clientY; t0 = performance.now(); moved = false; el.setPointerCapture?.(e.pointerId) }
    const onMove = (e) => { if (Math.abs(e.clientX - x0) > 6 || Math.abs(e.clientY - y0) > 6) moved = true }
    const onUp = (e) => {
      const dx = e.clientX - x0; const dy = e.clientY - y0
      const dt = Math.max(1, performance.now() - t0)
      const vx = Math.abs(dx) / dt // px/ms
      // Validate horizontal swipe: distance ≥ 40, |dx| > |dy|, velocity ≥ 0.3 px/ms
      if (moved && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) && vx >= 0.3) {
        if (dx < 0) onSwipeNext?.(); else onSwipePrev?.()
      }
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    return () => { el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerup', onUp); el.removeEventListener('pointercancel', onUp) }
  }, [onSwipeNext, onSwipePrev, page?.index])

  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    const timeout = prefersReducedMotion ? 0 : 280
    const t = setTimeout(() => setEntering(false), timeout)
    return () => clearTimeout(t)
  }, [page?.index])

  const blocks = page?.blocks || []

  return (
    <section ref={ref} className={`reader-page ${entering ? 'page--enter' : ''} page--dir-${dir}`}>
      {blocks.map((block) => {
        if (block?.type === 'para') {
          return <p key={block.id} className="para">{block.text}</p>
        }
        if (block?.kind === 'dialogue' || block?.type === 'dialogue') {
          return (
            <Dialogue
              key={block.id}
              block={block}
              read={readDialogIds?.has?.(block.id)}
              onTap={onDialogueTap}
              onPrime={onPrimeAudio}
            />
          )
        }
        return null
      })}
    </section>
  )
}
