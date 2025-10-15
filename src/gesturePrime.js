import { getAudioEngine } from './reader/audioSingleton.js'

let primed = false
try { primed = sessionStorage.getItem('audioPrimed') === '1' } catch {}

function primeOnce() {
  if (primed) return
  try {
    getAudioEngine().ensureStarted()
    primed = true
    try { sessionStorage.setItem('audioPrimed','1'); sessionStorage.setItem('audioPrimedAt', String(Date.now())) } catch {}
    window.dispatchEvent(new CustomEvent('audio:primed'))
  } catch {}
}

window.addEventListener('pointerdown', primeOnce, { capture: true, passive: true })
window.addEventListener('touchstart', primeOnce, { capture: true, passive: true })
window.addEventListener('keydown', primeOnce, { capture: true })

