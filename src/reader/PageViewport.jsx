import { useCallback, useEffect, useRef, useState } from 'react'

function Dialogue({ block, read, active, onTap, onPrime, onShare }) {
  const tRef = useRef(null)
  const longPressTimer = useRef(null)

  const handleClick = (e) => {
    e.stopPropagation()
    onTap?.(block.id, block)
  }
  const startLongPress = () => {
    if (!onShare) return
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    const rect = tRef.current?.getBoundingClientRect()
    longPressTimer.current = setTimeout(() => {
      onShare(block, rect || null)
    }, 450)
  }
  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }
  const handlePointerDown = (e) => {
    try { onPrime?.() } catch {}
    startLongPress()
  }
  const handlePointerUp = () => { cancelLongPress() }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      onTap?.(block.id, block)
    }
  }

  useEffect(() => {
    return () => cancelLongPress()
  }, [])

  return (
    <div
      ref={tRef}
      className={`dlg ${read ? 'dlg--read' : ''} ${active ? 'dlg--active' : ''}`}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Dialogue de ${block.speaker}: ${block.text}`}
    >
      <span className="dlg__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="currentColor" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm1 13h-2v-2h2v2Zm0-4h-2V6h2v6z" />
        </svg>
      </span>
      <span className="dlg__bar" aria-hidden="true" />
      <strong className="dlg__speaker">{block.speaker} :</strong>
      <span className="dlg__text"> {block.text}</span>
    </div>
  )
}

export default function PageViewport({
  page,
  dir = 'next',
  readDialogIds,
  activeDialogueId,
  chapterTitle = '',
  pageIndex = 0,
  pageCount = 0,
  onDialogueTap,
  onSwipeNext,
  onSwipePrev,
  overlayOpen,
  onPrimeAudio,
  onOverlayGesture,
}) {
  const ref = useRef(null)
  const [entering, setEntering] = useState(true)
  const rollbackTimer = useRef(null)
  const shareRef = useRef(null)
  const [shareTarget, setShareTarget] = useState(null)
  const closeShare = useCallback(() => setShareTarget(null), [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.touchAction = 'none'
    const state = {
      pointerId: null,
      startX: 0,
      startY: 0,
      startTime: 0,
      axis: null,
      moved: false,
      swipeProgress: 0,
      pointerType: 'touch',
      button: 0,
      armed: false
    }

    const applySwipeVisual = (progress = 0) => {
      const clamped = Math.max(-1, Math.min(1, progress || 0))
      state.swipeProgress = clamped
      const abs = Math.abs(clamped)
      const left = clamped > 0 ? Math.min(48, clamped * 48) : 0
      const right = clamped < 0 ? Math.min(48, -clamped * 48) : 0
      el.style.setProperty('--page-swipe-left', `${left}%`)
      el.style.setProperty('--page-swipe-right', `${right}%`)
      el.style.setProperty('--page-swipe-strength', `${Math.min(1, abs * 1.35)}`)
      if (clamped < 0) {
        el.classList.add('page--swipe-next')
        el.classList.remove('page--swipe-prev')
      } else if (clamped > 0) {
        el.classList.add('page--swipe-prev')
        el.classList.remove('page--swipe-next')
      } else {
        el.classList.remove('page--swipe-next')
        el.classList.remove('page--swipe-prev')
      }
    }

    const resetSwipeVisual = () => {
      applySwipeVisual(0)
      el.classList.remove('page--swiping')
      if (rollbackTimer.current) clearTimeout(rollbackTimer.current)
      rollbackTimer.current = setTimeout(() => {
        el.classList.remove('page--swipe-prev')
        el.classList.remove('page--swipe-next')
      }, 220)
    }

    const releasePointer = (e) => {
      if (state.pointerId !== null) {
        try { el.releasePointerCapture?.(state.pointerId) } catch {}
      }
      state.pointerId = null
    }

    const onDown = (e) => {
      if (state.pointerId !== null) return
      state.pointerId = e.pointerId
      state.startX = e.clientX
      state.startY = e.clientY
      state.startTime = performance.now()
      state.axis = null
      state.moved = false
      state.pointerType = e.pointerType || 'touch'
      state.button = e.button
      el.classList.add('page--swiping')
      applySwipeVisual(0)
      el.setPointerCapture?.(state.pointerId)
    }

    const onMove = (e) => {
      if (state.pointerId === null || e.pointerId !== state.pointerId) return
      const dx = e.clientX - state.startX
      const dy = e.clientY - state.startY
      if (!state.axis) {
        const lock = 10
        const ratio = 1.1
        if (Math.abs(dx) >= lock && Math.abs(dx) >= Math.abs(dy) * ratio) {
          state.axis = 'x'
        } else if (Math.abs(dy) >= lock && Math.abs(dy) >= Math.abs(dx) * ratio) {
          state.axis = 'y'
        }
      }
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) state.moved = true
      if (state.axis === 'x') {
        const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 900 : false
        const detection = isDesktop ? 60 : 48
        const elapsed = Math.max(1, performance.now() - state.startTime)
        const velocityPxPerSec = Math.abs(dx) / elapsed * 1000
        if (!state.armed) {
          if (Math.abs(dx) >= detection || velocityPxPerSec >= 500) state.armed = true
          else return
        }
        e.preventDefault()
        const width = el.clientWidth || window.innerWidth || 320
        const denominator = Math.max(150, width * 0.55)
        const progress = dx / denominator
        applySwipeVisual(progress)
      }
    }

    const onUp = (e) => {
      if (state.pointerId === null || e.pointerId !== state.pointerId) return
      const dx = e.clientX - state.startX
      const dy = e.clientY - state.startY
      const dt = Math.max(1, performance.now() - state.startTime)
      const absDx = Math.abs(dx)
      let handled = false
      if (state.axis === 'x' && state.moved && state.armed) {
        const progress = state.swipeProgress
        const velocityPxPerSec = absDx / dt * 1000
        const shouldCommit = Math.abs(progress) >= 0.28 || velocityPxPerSec >= 650
        if (shouldCommit) {
          handled = true
          applySwipeVisual(progress < 0 ? -1 : 1)
          requestAnimationFrame(() => {
            if (progress < 0) onSwipeNext?.()
            else onSwipePrev?.()
          })
        }
      } else if (!state.moved && state.pointerType === 'mouse') {
        if (state.button === 0 && !overlayOpen) {
          handled = true
          onSwipePrev?.()
        }
      }
      if (!handled && state.axis === 'y' && state.moved) {
        if (Math.abs(dy) > 20) {
          if (dy < 0) onOverlayGesture?.('open')
          else onOverlayGesture?.('close')
        }
      }
      resetSwipeVisual()
      releasePointer(e)
    }

    const onCancel = (e) => {
      resetSwipeVisual()
      releasePointer(e)
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onCancel)
    return () => {
      if (rollbackTimer.current) {
        clearTimeout(rollbackTimer.current)
        rollbackTimer.current = null
      }
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onCancel)
      el.classList.remove('page--swiping', 'page--swipe-prev', 'page--swipe-next')
      el.style.removeProperty('--page-swipe-left')
      el.style.removeProperty('--page-swipe-right')
      el.style.removeProperty('--page-swipe-strength')
    }
  }, [onOverlayGesture, onSwipeNext, onSwipePrev, overlayOpen, page?.index])

  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    const timeout = prefersReducedMotion ? 0 : 280
    const t = setTimeout(() => setEntering(false), timeout)
    return () => clearTimeout(t)
  }, [page?.index])

  const handleShareRequest = useCallback((block, rect) => {
    const host = ref.current?.getBoundingClientRect()
    if (!host || !rect) return
    setShareTarget({
      block,
      x: rect.left - host.left + rect.width / 2,
      y: rect.top - host.top
    })
  }, [])
  useEffect(() => {
    if (!shareTarget) return
    const handle = (event) => {
      const target = event.target
      if (target && shareRef.current && shareRef.current.contains(target)) return
      closeShare()
    }
    document.addEventListener('pointerdown', handle)
    return () => document.removeEventListener('pointerdown', handle)
  }, [shareTarget, closeShare])
  useEffect(() => {
    closeShare()
  }, [pageIndex, closeShare])

  const blocks = page?.blocks || []
  const safeTitle = (chapterTitle || '').trim()
  const showHeading = Boolean(safeTitle)
  const countLabel = pageCount ? `${Math.min(pageIndex + 1, pageCount)}/${pageCount}` : null

  return (
    <section
      ref={ref}
      className={`reader-page ${entering ? 'page--enter' : ''} page--dir-${dir}`}
      onContextMenu={(e) => {
        e.preventDefault()
        onSwipeNext?.()
      }}
    >
      <div className="reader-page__column">
        {showHeading && (
          <header className="reader__chapter-head" aria-live="off">
            <h1 className="reader__chapter-title">{safeTitle}</h1>
            {countLabel && <p className="reader__chapter-count">{countLabel}</p>}
          </header>
        )}
        {blocks.map((block) => {
          if (block?.type === 'para') {
            return <p key={block.id} className="para">{block.text}</p>
          }
          if (block?.kind === 'dialogue' || block?.type === 'dialogue') {
            const isRead = readDialogIds?.has?.(block.id)
            const isActive = activeDialogueId === block.id
            return (
              <Dialogue
                key={block.id}
                block={block}
                read={isRead}
                active={isActive}
                onTap={onDialogueTap}
                onPrime={onPrimeAudio}
                onShare={handleShareRequest}
              />
            )
          }
          return null
        })}
      </div>
      {shareTarget && (
        <div
          ref={shareRef}
          className="reader__dialog-share"
          style={{ top: `${Math.max(0, shareTarget.y)}px`, left: `${shareTarget.x}px` }}
        >
          <button
            type="button"
            className={`reader__share-btn ${shareTarget.block?.tiktokUrl ? '' : 'is-disabled'}`}
            disabled={!shareTarget.block?.tiktokUrl}
            onClick={() => {
              if (shareTarget.block?.tiktokUrl) {
                try { window.open(shareTarget.block.tiktokUrl, '_blank', 'noopener,noreferrer') } catch {}
                closeShare()
              }
            }}
          >Ouvrir dans TikTok</button>
          <button
            type="button"
            className={`reader__share-btn ${shareTarget.block?.audio || shareTarget.block?.voice ? '' : 'is-disabled'}`}
            disabled={!(shareTarget.block?.audio || shareTarget.block?.voice)}
            onClick={() => {
              const src = shareTarget.block?.audio || shareTarget.block?.voice
              if (!src) return
              try {
                const link = document.createElement('a')
                link.href = src
                link.download = `${shareTarget.block?.id || 'dialogue'}.mp3`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              } catch {}
              closeShare()
            }}
          >Télécharger .mp3</button>
        </div>
      )}
    </section>
  )
}
