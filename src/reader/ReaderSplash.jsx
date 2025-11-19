import { useEffect, useRef, useState } from 'react'

export default function ReaderSplash({ id, title, img, ready, onFinished, theme = 'light' }) {
  const [phase, setPhase] = useState('in') // in -> exit
  const [canDismiss, setCanDismiss] = useState(false)
  const rootRef = useRef(null)
  const startRef = useRef(Date.now())
  const palette = theme === 'dark'
    ? { bg: '#424242', ink: '#FEFFF4' }
    : { bg: '#FEFFF4', ink: '#424242' }

  useEffect(() => {
    const minHold = 3000
    const hardCut = 6000
    const hardTimer = setTimeout(() => setPhase('exit'), hardCut)
    let softTimer
    if (ready) {
      const elapsed = Date.now() - startRef.current
      const remain = Math.max(0, minHold - elapsed)
      softTimer = setTimeout(() => setPhase('exit'), remain)
    }
    return () => { clearTimeout(hardTimer); if (softTimer) clearTimeout(softTimer) }
  }, [ready])
  useEffect(() => {
    if (!ready) {
      setCanDismiss(false)
      return
    }
    const timer = setTimeout(() => setCanDismiss(true), 1000)
    return () => clearTimeout(timer)
  }, [ready])

  useEffect(() => {
    if (phase === 'exit') {
      const el = rootRef.current
      if (!el) return
      const handler = () => onFinished?.()
      el.addEventListener('animationend', handler, { once: true })
    }
  }, [phase, onFinished])

  const handleSkip = () => {
    if (!canDismiss) return
    setPhase('exit')
  }

  return (
    <div
      ref={rootRef}
      className={`reader-splash simple phase-${phase} theme-${theme}`}
      style={{ background: palette.bg, color: palette.ink }}
      role={canDismiss ? 'button' : undefined}
      tabIndex={canDismiss ? 0 : -1}
      aria-label={canDismiss ? "Appuyez pour passer l'interstitiel" : undefined}
      onClick={handleSkip}
      onKeyDown={(e) => {
        if (!canDismiss) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleSkip()
        }
      }}
    >
      <div className="reader-splash__card">
        {img && (<img className="reader-splash__img" src={img} alt="" />)}
      </div>
      <div className="reader-splash__line">
        <span className="reader-splash__badge">{id}</span>
        <span className="reader-splash__title">{title}</span>
      </div>
    </div>
  )
}
