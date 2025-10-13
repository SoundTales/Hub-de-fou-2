import { useEffect, useRef, useState } from 'react'

function Dialogue({ block, read, onTap }) {
  const tRef = useRef(null)
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
    <div ref={tRef} className={`dlg ${read ? 'dlg--read' : ''}`} onClick={() => onTap(block.id)}>
      <span className="dlg__icon" aria-hidden>💬</span>
      <span className="dlg__bar" aria-hidden />
      <strong className="dlg__speaker">{block.speaker} :</strong>
      <span className="dlg__text"> {block.text}</span>
    </div>
  )
}

export default function PageViewport({ page, dir = 'next', readDialogIds, onDialogueTap, onSwipeNext, onSwipePrev, onDoubleTap }) {
  const ref = useRef(null)
  const [entering, setEntering] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.touchAction = 'none'
    let x0 = 0, y0 = 0, t0 = 0, moved = false
    const onDown = (e) => { x0 = e.clientX; y0 = e.clientY; t0 = Date.now(); moved = false; el.setPointerCapture(e.pointerId) }
    const onMove = (e) => { if (Math.abs(e.clientX - x0) > 6 || Math.abs(e.clientY - y0) > 6) moved = true }
    const onUp = (e) => {
      const dx = e.clientX - x0; const dy = e.clientY - y0
      const dt = Date.now() - t0
      if (!moved && dt < 280) {
        // potential double tap
        const last = el._lastTap || 0
        el._lastTap = Date.now()
        if (Date.now() - last < 280) onDoubleTap?.()
        return
      }
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) onSwipeNext?.(); else onSwipePrev?.()
      }
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    return () => { el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerup', onUp); el.removeEventListener('pointercancel', onUp) }
  }, [onSwipeNext, onSwipePrev, onDoubleTap, page?.index])

  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 500)
    return () => clearTimeout(t)
  }, [page?.index])

  return (
    <section ref={ref} className={`reader-page ${entering ? 'page--enter' : ''} page--dir-${dir}`}>
      {page?.blocks.map(b => b.type === 'para' ? (
        <p key={b.id} className="para">{b.text}</p>
      ) : (
        <Dialogue key={b.id} block={b} read={readDialogIds?.has(b.id)} onTap={onDialogueTap} />
      ))}
    </section>
  )
}
