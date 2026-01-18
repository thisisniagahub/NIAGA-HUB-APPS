/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Tone from 'tone'
import useStore from './store'

const presets = {
  typing: {
    name: 'TYPING',
    notes: ['G2'],
    attack: 0.001,
    decay: 0.01,
    sustain: 0.2,
    release: 0.002,
    volume: -30
  },
  action: {
    name: 'ACTION',
    notes: ['G3'],
    attack: 0.005,
    decay: 0.05,
    sustain: 0.2,
    release: 0.5,
    volume: -10
  },
  success: {
    name: 'SUCCESS',
    notes: ['C5'],
    attack: 0.01,
    decay: 0.05,
    sustain: 0.2,
    release: 0.6,
    volume: -10
  },
  success_low: {
    name: 'SUCCESS_LOW',
    notes: ['C4'], // One octave down from C5
    attack: 0.01,
    decay: 0.05,
    sustain: 0.2,
    release: 0.6,
    volume: -10
  }
}

// Separate synth instances for each preset to prevent envelope interference
const synths = {}
let isInitialized = false

// Throttle tracking for typing sounds
let lastTypingTime = 0
const TYPING_THROTTLE_MS = 50

const createSynthForPreset = (preset) => {
  return new Tone.Synth({
    oscillator: { type: 'sine' },
    volume: preset.volume,
    envelope: {
      attack: preset.attack,
      decay: preset.decay,
      sustain: preset.sustain,
      release: preset.release
    }
  }).toDestination()
}

const ensureInitialized = async () => {
  if (isInitialized) return true

  try {
    await Tone.start()
    // Create a dedicated synth for each preset
    for (const [name, preset] of Object.entries(presets)) {
      synths[name] = createSynthForPreset(preset)
    }
    isInitialized = true
    return true
  } catch (e) {
    console.error('Failed to initialize audio:', e)
    return false
  }
}

const playSound = async (name) => {
  const { isSoundEnabled } = useStore.getState()
  if (!isSoundEnabled) return

  if (!await ensureInitialized()) return

  const sound = presets[name]
  const synth = synths[name]
  if (!sound || !synth) return

  try {
    const now = Tone.now()
    synth.triggerAttack(sound.notes[0], now)
    synth.triggerRelease(now + sound.attack + sound.decay)
  } catch (e) {
    console.error('Audio playback failed:', e)
  }
}

// Chunk streaming sound (throttled)
export const playChunk = async () => {
  const now = Date.now()
  if (now - lastTypingTime < TYPING_THROTTLE_MS) return
  lastTypingTime = now

  await playSound('typing')
}

// Regular generation complete
export const playGenerationComplete = () => playSound('success_low')

// Last generation for model (octave higher)
export const playLastModelComplete = () => playSound('success')

// Generation or replay triggered
export const playAction = () => playSound('action')
