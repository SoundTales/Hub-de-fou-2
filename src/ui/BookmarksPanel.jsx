import { useEffect, useMemo, useRef } from 'react'

export default function BookmarksPanel({ origin, items = [], onClose, onSelect }) {
  const maskRef = useRef(null)
  const panelRef = useRef(null)

  // Memoize anchor style
  const styleVars = useMemo(() => {
    const s = {}
    if (typeof origin?.left === 'number') s['--bm-left'] = origin.left + 'px'
    if (typeof origin?.top === 'number') s['--bm-top'] = origin.top + 'px'
    return s
  }, [origin?.left, origin?.top])

  // Focus trap + Esc to close
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const selectors = 'button, [href], [tabindex]:not([tabindex="-1"])'
    const focusables = () => Array.from(panel.querySelectorAll(selectors)).filter(el => !el.hasAttribute('disabled'))
    const first = () => focusables()[0]
    const last = () => focusables().slice(-1)[0]
    first()?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); onClose?.(); return }
      if (e.key === 'Tab') {
        const f = first(), l = last()
        if (!f || !l) return
        if (e.shiftKey && document.activeElement === f) { e.preventDefault(); l.focus() }
        else if (!e.shiftKey && document.activeElement === l) { e.preventDefault(); f.focus() }
      }
    }
    const onFocusIn = (e) => { if (!panel.contains(e.target)) first()?.focus() }
    panel.addEventListener('keydown', onKey)
    document.addEventListener('focusin', onFocusIn)
    return () => { panel.removeEventListener('keydown', onKey); document.removeEventListener('focusin', onFocusIn) }
  }, [onClose])

  return (
    <div ref={maskRef} className="bm-mask" role="dialog" aria-modal="true" aria-label="Signets" onClick={onClose}>
      <div
        ref={panelRef}
        className={`bm-panel ${origin?.side ? `bm--${origin.side}` : ''} ${origin?.from ? `bm-from-${origin.from}` : ''}`}
        role="document"
        style={styleVars}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bm-head">
          <div className="bm-title">Signets</div>
          <button className="bm-close" aria-label="Fermer" onClick={onClose}>×</button>
        </div>
        <div className="bm-list">
          {items.length === 0 && <div className="bm-empty">Aucun chapitre en signet</div>}
          {items.map(it => (
            <button key={it.chapterId} className="bm-item" onClick={() => onSelect?.(it)}>
              <span className="bm-label">{it.title}</span>
              <span className="bm-badge" aria-label={`${it.count} page(s) marquée(s)`}>{it.count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

