import { useCallback, useEffect, useRef } from 'react'

const clamp01 = (v) => Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0))
const toPercent = (v) => Math.round(clamp01(v) * 100)

export default function MusicRail({
  value = 0.5,
  onChange,
  label = 'Ambiance / Th\u00E8me',
  step = 0.05,
  largeStep = 0.2,
  onToggleMute,
}) {
  const trackRef = useRef(null)
  const rafRef = useRef(null)

  const emit = useCallback((next) => {
    const clamped = clamp01(next)
    if (typeof onChange === 'function') onChange(clamped)
  }, [onChange])

  const getValueFromPointer = useCallback((clientY) => {
    const track = trackRef.current
    if (!track) return clamp01(value)
    const rect = track.getBoundingClientRect()
    if (!rect?.height) return clamp01(value)
    const ratio = 1 - (clientY - rect.top) / rect.height
    return clamp01(ratio)
  }, [value])

  const scheduleFromPointer = useCallback((clientY) => {
    const run = () => {
      rafRef.current = null
      emit(getValueFromPointer(clientY))
    }
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current)
      rafRef.current = window.requestAnimationFrame(run)
    } else {
      run()
    }
  }, [emit, getValueFromPointer])

  useEffect(() => () => {
    if (typeof window !== 'undefined' && window.cancelAnimationFrame && rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const handlePointerDown = useCallback((e) => {
    if (typeof e.button === 'number' && e.button !== 0) return
    e.preventDefault()
    e.currentTarget.focus({ preventScroll: true })
    scheduleFromPointer(e.clientY)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }, [scheduleFromPointer])

  const handlePointerMove = useCallback((e) => {
    if ((e.buttons & 1) === 0) return
    scheduleFromPointer(e.clientY)
  }, [scheduleFromPointer])

  const handlePointerEnd = useCallback((e) => {
    if (typeof window !== 'undefined' && window.cancelAnimationFrame && rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }, [])

  const handleKeyDown = useCallback((e) => {
    let nextValue = value
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        nextValue = value + step
        break
      case 'ArrowDown':
      case 'ArrowLeft':
        nextValue = value - step
        break
      case 'PageUp':
        nextValue = value + largeStep
        break
      case 'PageDown':
        nextValue = value - largeStep
        break
      case 'Home':
        nextValue = 0
        break
      case 'End':
        nextValue = 1
        break
      default:
        return
    }
    e.preventDefault()
    emit(nextValue)
  }, [emit, largeStep, step, value])

  const percent = toPercent(value)
  const toggleMute = useCallback(() => {
    if (typeof onToggleMute === 'function') onToggleMute()
  }, [onToggleMute])

  return (
    <div className="potard">
      <div
        className="music-rail"
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${percent}%`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
      >
        <div className="music-rail__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              fill="currentColor"
              d="M9 4.5v9.1a3.5 3.5 0 1 0 1.5 2.9V8.2l7-1.4v6.77a3.5 3.5 0 1 0 1.5 2.9V4.8L9 4.5z"
            />
          </svg>
        </div>
        <div className="music-rail__track" ref={trackRef}>
          <div className="music-rail__fill" style={{ transform: `scaleY(${clamp01(value)})` }} />
        </div>
      </div>
      <button type="button" className="music-rail__value" onClick={toggleMute} aria-label={`${label} ${percent}%`}>
        {percent}%
      </button>
    </div>
  )
}

