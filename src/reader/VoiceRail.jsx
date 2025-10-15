export default function VoiceRail({ value = 1, onChange }) {
  const clamp = (v) => Math.max(0, Math.min(1, v))
  const handle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const v = 1 - y / rect.height
    onChange?.(clamp(v))
  }
  return (
    <div className="voice-rail" onPointerDown={handle} onPointerMove={(e) => e.buttons === 1 && handle(e)}>
      <div className="voice-rail__icon" aria-hidden>💬</div>
      <div className="voice-rail__track">
        <div className="voice-rail__fill" style={{ height: `${value * 100}%` }} />
      </div>
    </div>
  )
}

