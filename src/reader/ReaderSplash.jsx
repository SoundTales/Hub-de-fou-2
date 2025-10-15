import { useEffect, useRef, useState } from 'react'

export default function ReaderSplash({ id, title, img, ready, onFinished }) {
  const [phase, setPhase] = useState('in') // in -> exit
  const rootRef = useRef(null)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const minHold = 2200
    const hardCut = 5000
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
    if (phase === 'exit') {
      const el = rootRef.current
      if (!el) return
      const handler = () => onFinished?.()
      el.addEventListener('animationend', handler, { once: true })
    }
  }, [phase, onFinished])

  return (
    <div ref={rootRef} className={`reader-splash simple phase-${phase}`} style={{ background: '#FEFFF4' }}>
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


