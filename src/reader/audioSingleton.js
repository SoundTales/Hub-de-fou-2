import { createAudioEngine } from './AudioEngine.js'

let __engine = null
export function getAudioEngine() {
  if (!__engine) __engine = createAudioEngine()
  return __engine
}

