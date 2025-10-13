export function createAudioEngine() {
  let ctx = null
  let master = null, music = null, sfx = null, voice = null
  let desiredMusic = 0.8

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

  return {
    ensureStarted: ensureContext,
    setMusicVolume(v) { desiredMusic = Math.max(0, Math.min(1, v)); if (music) music.gain.value = desiredMusic },
    get state() { return ctx?.state || 'idle' },
    get nodes() { return { ctx, master, music, sfx, voice } }
  }
}

