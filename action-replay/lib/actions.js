/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import useStore from './store'
import modes from './modes'
import { llmGenStream } from './llm'
import models from './models'
import { playGenerationComplete, playLastModelComplete, playChunk, playAction } from './sounds'

const get = useStore.getState
const set = useStore.setState

export const init = () => {
  if (get().didInit) {
    return
  }

  set(state => {
    state.didInit = true
  })
}

const newOutput = (model, mode, isBatch) => ({
  model,
  isBatch,
  id: crypto.randomUUID(),
  startTime: null, // Set by onStart callback when actual generation begins
  outputData: null,
  streamingText: '', // Live streaming text for console display
  isBusy: true,
  gotError: false,
  outputMode: mode,
  rating: 0,
  isFavorite: false,
  comments: '',
  metrics: {
    promptTokenCount: null,
    thoughtsTokenCount: null,
    candidatesTokenCount: null,
    timeToFirstThoughtSummaryToken: null,
    timeToFirstCandidatesToken: null,
    totalTime: null,
    thoughtsStreamData: [],
    candidatesStreamData: []
  }
})

export const addRound = async (prompt, images = { pre: null, post: null }) => {
  scrollTo({ top: 0, left: 0, behavior: 'smooth' })

  // Reset replay mode so new generations use correct scale
  set(state => {
    state.replayStartTime = null
    state.liveMaxElapsed = null  // Reset live scaling for new generation
  })

  // Play action sound for generation triggered
  playAction()

  const { outputMode, mode, batchSize, gridSize, batchModel, versusModels } = get()

  const selectedModels = Object.entries(versusModels)
    .filter(([, active]) => active)
    .map(([model]) => model)

  if (mode !== 'batch' && selectedModels.length === 0) {
    return
  }

  let outputs
  if (mode === 'batch') {
    outputs = new Array(batchSize)
      .fill(null)
      .map(() => newOutput(batchModel, outputMode, true))
  } else if (mode === 'grid') {
    outputs = []
    for (let i = 0; i < gridSize; i++) {
      for (const model of selectedModels) {
        outputs.push(newOutput(model, outputMode, false))
      }
    }
  } else {
    outputs = selectedModels.map(model => newOutput(model, outputMode))
  }

  const numModels = mode !== 'batch' ? selectedModels.length : 1
  const newRound = {
    prompt,
    images,
    systemInstruction: modes[outputMode].systemInstruction,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    outputMode,
    numModels: mode !== 'batch' ? numModels : undefined,
    gridSize: mode === 'grid' ? gridSize : undefined,
    maxTotalTime: null, // Track slowest response time across all outputs
    outputs
  }

  // Spawn streaming generation for each output
  newRound.outputs.forEach((output, i) => {
    const isImage = output.outputMode === 'image'

    // Skip image mode for now (not supported with streaming)
    if (isImage) {
      set(state => {
        const round = state.feed.find(r => r.id === newRound.id)
        if (!round) return
        round.outputs[i] = {
          ...output,
          isBusy: false,
          gotError: true
        }
      })
      return
    }

    const thoughtsStreamData = []
    const candidatesStreamData = []
    let thoughtsCumulativeLength = 0
    let candidatesCumulativeLength = 0

    llmGenStream({
      model: models[output.model].modelString,
      thinkingConfig: models[output.model].thinkingConfig,
      systemInstruction: newRound.systemInstruction,
      prompt: newRound.prompt,
      images: newRound.images,
      onStart: () => {
        // Reset startTime and TTFT metrics when generation begins (after queue wait, on each retry)
        set(state => {
          const round = state.feed.find(r => r.id === newRound.id)
          if (!round) return
          round.outputs[i].startTime = Date.now()
          // Reset TTFT metrics to clear stale values from previous attempt
          round.outputs[i].metrics.timeToFirstThoughtSummaryToken = null
          round.outputs[i].metrics.timeToFirstCandidatesToken = null
        })
      },
      onRetry: () => {
        // Reset startTime to null when retry is triggered, so timer shows 0 during delay
        set(state => {
          const round = state.feed.find(r => r.id === newRound.id)
          if (!round) return
          round.outputs[i].startTime = null
        })
      },
      onFirstThought: ({ ttft }) => {
      // Update TTFT for thoughts immediately when first thought arrives
        set(state => {
          const round = state.feed.find(r => r.id === newRound.id)
          if (!round) return
          round.outputs[i].metrics.timeToFirstThoughtSummaryToken = ttft
        })
      },
      onFirstCandidate: ({ ttft }) => {
      // Update TTFT for candidates immediately when first candidate arrives
        set(state => {
          const round = state.feed.find(r => r.id === newRound.id)
          if (!round) return
          round.outputs[i].metrics.timeToFirstCandidatesToken = ttft
        })
      },
      onThoughtChunk: (chunk, time) => {
        thoughtsCumulativeLength += chunk.length
        thoughtsStreamData.push({
          time,
          chunk,
          chunkLength: chunk.length,
          cumulativeLength: thoughtsCumulativeLength
        })
      },
      onCandidatesChunk: (chunk, time) => {
        candidatesCumulativeLength += chunk.length
        candidatesStreamData.push({
          time,
          chunk,
          chunkLength: chunk.length,
          cumulativeLength: candidatesCumulativeLength
        })
        // Update streaming text for console display
        set(state => {
          const round = state.feed.find(r => r.id === newRound.id)
          if (!round) return
          round.outputs[i].streamingText = (round.outputs[i].streamingText || '') + chunk
        })
        // Play chunk sound (throttled internally)
        playChunk()
      },
      onComplete: ({ text, metrics }) => {
        set(state => {
          const round = state.feed.find(r => r.id === newRound.id)
          if (!round) return
          round.outputs[i] = {
            ...output,
            outputData: text
              .replace(/```\w+/gm, '')
              .replace(/```\n?$/gm, '')
              .trim(),
            isBusy: false,
            totalTime: metrics.totalTime,
            metrics: {
              ...metrics,

              thoughtsStreamData,
              candidatesStreamData
            }
          }
          // Update maxTotalTime if this is the slowest response so far
          if (!round.maxTotalTime || metrics.totalTime > round.maxTotalTime) {
            round.maxTotalTime = metrics.totalTime
          }
        })
        // Play completion sound - check if this is the last for this model
        const currentRound = get().feed.find(r => r.id === newRound.id)
        if (currentRound) {
          const modelOutputs = currentRound.outputs.filter(o => o.model === output.model)
          const allModelOutputsComplete = modelOutputs.every(o => !o.isBusy)
          if (allModelOutputsComplete) {
            playLastModelComplete()
          } else {
            playGenerationComplete()
          }
        }
      },
      onError: error => {
        console.error('Generation error:', error)
        set(state => {
          const round = state.feed.find(r => r.id === newRound.id)
          if (!round) return
          // Reset startTime to null and set totalTime to 0 for clean error display
          round.outputs[i] = {
            ...round.outputs[i],
            isBusy: false,
            gotError: true,
            startTime: null,
            totalTime: 0
          }
        })
      }
    })
  })

  set(state => {
    state.feed.unshift(newRound)
  })
}

export const setOutputMode = mode =>
  set(state => {
    state.outputMode = mode
  })

export const setBatchModel = model =>
  set(state => {
    state.batchModel = model
  })

export const setMode = mode =>
  set(state => {
    state.mode = mode

    if (mode !== 'batch' && state.outputMode === 'image') {
      state.outputMode = Object.keys(modes)[0]
    }
  })

export const setBatchSize = size =>
  set(state => {
    state.batchSize = size
  })

export const setGridSize = size =>
  set(state => {
    state.gridSize = size
  })

export const setVersusModel = (model, active) =>
  set(state => {
    state.versusModels[model] = active
  })

export const removeRound = id =>
  set(state => {
    state.feed = state.feed.filter(round => round.id !== id)
  })

export const reset = () => {
  set(state => {
    state.feed = []
  })
}

export const startReplay = () => {
  // Play action sound for replay triggered
  playAction()
  set(state => {
    state.replayStartTime = Date.now()
    state.replayPending = false
  })
}

export const setReplaySpeed = speed => {
  set(state => {
    state.replaySpeed = speed
  })
}

export const restartReplay = () => {
  set(state => {
    state.replayStartTime = null
    state.replayPending = true
  })
}

export const setSoundEnabled = enabled => {
  set(state => {
    state.isSoundEnabled = enabled
  })
}

export const updateLiveMaxElapsed = elapsed => {
  set(state => {
    if (state.liveMaxElapsed === null || elapsed > state.liveMaxElapsed) {
      state.liveMaxElapsed = elapsed
    }
  })
}

export const resetLiveMaxElapsed = () => {
  set(state => {
    state.liveMaxElapsed = null
  })
}

init()