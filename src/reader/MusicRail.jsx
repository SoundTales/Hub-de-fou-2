export default function MusicRail({ value = 0.8, onChange }) {
  const clamp = (v) => Math.max(0, Math.min(1, v))
  const handle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const v = 1 - y / rect.height
    onChange?.(clamp(v))
  }
  return (
    <div className="music-rail" onPointerDown={handle} onPointerMove={(e) => e.buttons === 1 && handle(e)}>
      <div className="music-rail__icon" aria-hidden>🎵</div>
      <div className="music-rail__track">
        <div className="music-rail__fill" style={{ height: `${value * 100}%` }} />
      </div>
    </div>
  )
}

