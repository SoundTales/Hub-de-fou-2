import { useEffect, useRef, useState } from 'react'

function Dialogue({ block, read, onTap, onPrime }) {
  const tRef = useRef(null)
  
  // Gestionnaire de clic principal pour les dialogues
  const handleClick = (e) => {
    e.stopPropagation() // Empêcher la propagation vers le conteneur parent
    console.log('Dialogue cliqué dans PageViewport:', block.id, block.speaker)
    onTap?.(block.id)
  }
  const handlePointerDown = () => { try { onPrime?.() } catch {} }
  
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
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      aria-label={`Dialogue de ${block.speaker}: ${block.text}`}
    >
      <span className="dlg__icon" aria-hidden="true">💬</span>
      <span className="dlg__bar" aria-hidden="true" />
      <strong className="dlg__speaker">{block.speaker} :</strong>
      <span className="dlg__text"> {block.text}</span>
    </div>
  )
}

export default function PageViewport({ page, dir = 'next', readDialogIds, onDialogueTap, onSwipeNext, onSwipePrev, onDoubleTap, overlayOpen, onPrimeAudio }) {
  const ref = useRef(null)
  const [entering, setEntering] = useState(true)
  
  // Gestionnaire de clic pour double-tap (uniquement pour les zones non-dialogue)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    
    let lastTapTime = 0
    let lastTapX = 0
    let lastTapY = 0
    
    const handleClick = (e) => {
      // Si l'overlay est déjà ouvert: double‑tap ferme même sur un dialogue
      if (!overlayOpen && e.target.closest('.dlg')) {
        return
      }
      
      const now = Date.now()
      const x = e.clientX
      const y = e.clientY
      
      // Vérifier si c'est un double-tap
      if (now - lastTapTime < 300 && 
          Math.abs(x - lastTapX) < 16 && 
          Math.abs(y - lastTapY) < 16) {
        console.log('Double-tap détecté pour overlay')
        onDoubleTap?.()
      }
      
      lastTapTime = now
      lastTapX = x
      lastTapY = y
    }
    
    el.addEventListener('click', handleClick)
    return () => el.removeEventListener('click', handleClick)
  }, [onDoubleTap, overlayOpen])
  
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.touchAction = 'none'
    let x0 = 0, y0 = 0, t0 = 0, moved = false
    const onDown = (e) => { x0 = e.clientX; y0 = e.clientY; t0 = Date.now(); moved = false; el.setPointerCapture?.(e.pointerId) }
    const onMove = (e) => { if (Math.abs(e.clientX - x0) > 6 || Math.abs(e.clientY - y0) > 6) moved = true }
    const onUp = (e) => {
      const dx = e.clientX - x0; const dy = e.clientY - y0
      
      // Si c'est un swipe horizontal (et pas un clic sur dialogue)
      if (moved && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
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
    const t = setTimeout(() => setEntering(false), 500)
    return () => clearTimeout(t)
  }, [page?.index])

  return (
    <section ref={ref} className={`reader-page ${entering ? 'page--enter' : ''} page--dir-${dir}`}>
      {page?.blocks.map(b => b.type === 'para' ? (
        <p key={b.id} className="para">{b.text}</p>
      ) : (
        <Dialogue key={b.id} block={b} read={readDialogIds?.has(b.id)} onTap={onDialogueTap} onPrime={onPrimeAudio} />
      ))}
    </section>
  )
}
