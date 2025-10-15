export function createAudioEngine() {
  let ctx = null
  let master = null, music = null, sfx = null, voice = null
  let desiredMusic = 0.8
  const bufferCache = new Map()
  const lru = []
  const MAX_BUFFERS = 16
  const METRIC_WINDOW = 100
  const metrics = {
    fetchMs: { cue: [], sfx: [], voice: [], prefetch: [] },
    decodeMs: { cue: [], sfx: [], voice: [], prefetch: [] },
    htmlStartMs: { cue: [], sfx: [], voice: [], prefetch: [] },
  }
  const pushMetric = (bucket, category, ms) => {
    try {
      const arr = (metrics[bucket] && metrics[bucket][category])
      if (!arr) return
      arr.push(ms)
      if (arr.length > METRIC_WINDOW) arr.splice(0, arr.length - METRIC_WINDOW)
      // periodic log
      if (arr.length % 10 === 0) {
        const sorted = [...arr].sort((a,b)=>a-b)
        const p95 = sorted[Math.max(0, Math.min(sorted.length - 1, Math.floor(sorted.length*0.95)))]
        console.log(`[Audio][p95] ${bucket}/${category}: ${Math.round(p95)}ms (n=${arr.length})`)
      }
    } catch {}
  }

  const ensureContext = async () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)()
      master = ctx.createGain()
      music = ctx.createGain()
      sfx = ctx.createGain()
      voice = ctx.createGain()
      music.gain.value = desiredMusic
      sfx.gain.value = 1
      voice.gain.value = 1
      music.connect(master)
      sfx.connect(master)
      voice.connect(master)
      master.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') {
      try { await ctx.resume() } catch {}
    }
  }

  const fetchBuffer = async (url, { category = 'prefetch' } = {}) => {
    await ensureContext()
    if (bufferCache.has(url)) return bufferCache.get(url)
    const t0 = performance.now()
    const res = await fetch(url, { mode: 'cors' })
    const arr = await res.arrayBuffer()
    const t1 = performance.now()
    const buf = await ctx.decodeAudioData(arr)
    const t2 = performance.now()
    pushMetric('fetchMs', category, t1 - t0)
    pushMetric('decodeMs', category, t2 - t1)
    bufferCache.set(url, buf)
    lru.push(url)
    if (lru.length > MAX_BUFFERS) {
      const old = lru.shift()
      if (old && old !== url) bufferCache.delete(old)
    }
    return buf
  }

  // Music cue crossfade
  let currentMusicSrc = null
  let currentMusicSource = null
  let currentMusicGain = null
  let currentMusicEl = null

  // Lightweight oscillator beep (no network)
  const playBeep = async (targetNode = sfx, { ms = 180, freq = 880, gain = 0.2 } = {}) => {
    await ensureContext()
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.frequency.value = freq
    g.gain.value = 0
    osc.connect(g)
    g.connect(targetNode)
    const now = ctx.currentTime
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(gain, now + 0.01)
    g.gain.linearRampToValueAtTime(0.0001, now + ms / 1000)
    osc.start(now)
    osc.stop(now + ms / 1000 + 0.02)
    return new Promise(res => osc.addEventListener('ended', () => res(), { once: true }))
  }

  const setCue = async (src, { fadeMs = 220, loop = true } = {}) => {
    if (!src) return
    await ensureContext()
    if (currentMusicSrc === src && (currentMusicSource || currentMusicEl)) return
    // If context is not allowed yet, fallback HTMLAudio immediately
    if (ctx.state !== 'running') {
      try {
        const el = new Audio(src)
        try { el.crossOrigin = 'anonymous' } catch {}
        el.loop = !!loop
        el.volume = Math.max(0, Math.min(1, desiredMusic))
        const t0 = performance.now()
        await el.play()
        pushMetric('htmlStartMs', 'cue', performance.now() - t0)
        if (currentMusicEl) { try { currentMusicEl.pause(); currentMusicEl.src = '' } catch {} }
        currentMusicEl = el
        if (currentMusicSource) { try { currentMusicSource.stop() } catch {} }
        currentMusicSource = null
        currentMusicGain = null
        currentMusicSrc = src
        return
      } catch {}
    }
    try {
      const buf = await fetchBuffer(src, { category: 'cue' })
      const source = ctx.createBufferSource()
      source.buffer = buf
      source.loop = !!loop
      const gain = ctx.createGain(); gain.gain.value = 0
      source.connect(gain); gain.connect(music)
      const now = ctx.currentTime
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(1, now + fadeMs / 1000)
      source.start()
      if (currentMusicGain && currentMusicSource) {
        currentMusicGain.gain.cancelScheduledValues(now)
        currentMusicGain.gain.setValueAtTime(currentMusicGain.gain.value, now)
        currentMusicGain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000)
        try { currentMusicSource.stop(now + fadeMs / 1000 + 0.02) } catch {}
      }
      if (currentMusicEl) { try { currentMusicEl.pause(); currentMusicEl.src = '' } catch {}; currentMusicEl = null }
      currentMusicSource = source
      currentMusicGain = gain
      currentMusicSrc = src
    } catch (e) {
      // fallback
      try {
        const el = new Audio(src)
        try { el.crossOrigin = 'anonymous' } catch {}
        el.loop = !!loop
        el.volume = Math.max(0, Math.min(1, desiredMusic))
        const t0 = performance.now()
        await el.play()
        pushMetric('htmlStartMs', 'cue', performance.now() - t0)
        if (currentMusicEl) { try { currentMusicEl.pause(); currentMusicEl.src = '' } catch {} }
        currentMusicEl = el
        if (currentMusicSource) { try { currentMusicSource.stop() } catch {} }
        currentMusicSource = null
        currentMusicGain = null
        currentMusicSrc = src
      } catch {}
    }
  }

  const playSfx = async (src) => {
    if (!src) return
    await ensureContext()
    if (src === 'test-beep') { try { await playBeep(sfx) } catch {}; return }
    if (ctx.state !== 'running') {
      try { const el = new Audio(src); try { el.crossOrigin = 'anonymous' } catch {}; const t0 = performance.now(); await el.play(); pushMetric('htmlStartMs','sfx',performance.now()-t0); return } catch {}
    }
    try {
      const buf = await fetchBuffer(src, { category: 'sfx' })
      const node = ctx.createBufferSource(); node.buffer = buf
      node.connect(sfx); node.start()
    } catch (e) {
      try { const el = new Audio(src); try { el.crossOrigin = 'anonymous' } catch {}; const t0 = performance.now(); await el.play(); pushMetric('htmlStartMs','sfx',performance.now()-t0) } catch {}
    }
  }

  const playVoice = async (src, { duckDb = 0.5, releaseMs = 480 } = {}) => {
    if (!src) return
    await ensureContext()
    if (src === 'test-beep') { try { await playBeep(voice) } catch {}; return }
    if (ctx.state !== 'running') {
      try { const el = new Audio(src); try { el.crossOrigin = 'anonymous' } catch {}; const t0 = performance.now(); await el.play(); pushMetric('htmlStartMs','voice',performance.now()-t0); return } catch {}
    }
    try {
      const buf = await fetchBuffer(src, { category: 'voice' })
      const node = ctx.createBufferSource(); node.buffer = buf
      node.connect(voice)
      const now = ctx.currentTime
      const orig = desiredMusic
      if (music && music.gain) {
        music.gain.cancelScheduledValues(now)
        music.gain.setTargetAtTime(orig * duckDb, now, 0.05)
      }
      node.start(now)
      node.addEventListener('ended', () => {
        const t = ctx.currentTime
        if (music && music.gain) {
          music.gain.cancelScheduledValues(t)
          music.gain.setTargetAtTime(orig, t, Math.max(0.05, releaseMs / 1000))
        }
      }, { once: true })
    } catch (e) {
      try { const el = new Audio(src); try { el.crossOrigin = 'anonymous' } catch {}; const t0 = performance.now(); await el.play(); pushMetric('htmlStartMs','voice',performance.now()-t0) } catch {}
    }
  }

  return {
    async ensureStarted() { await ensureContext(); try { sessionStorage.setItem('audioPrimed','1'); sessionStorage.setItem('audioPrimedAt', String(Date.now())) } catch {} },
    async setCue(src, opts) { await setCue(src, opts) },
    async playSfx(src) { await playSfx(src) },
    async playVoice(src, opts) { await playVoice(src, opts) },
    setMusicVolume(v) { desiredMusic = Math.max(0, Math.min(1, v)); if (music) music.gain.value = desiredMusic },
    setVoiceVolume(v) { if (voice) voice.gain.value = Math.max(0, Math.min(1, v)) },
    async prefetch(url) { try { await fetchBuffer(url, { category: 'prefetch' }) } catch {} },
    get state() { return ctx?.state || 'idle' },
    get nodes() { return { ctx, master, music, sfx, voice } }
  }
}
