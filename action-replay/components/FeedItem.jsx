/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useMemo, Fragment, useEffect, useRef } from 'react'
import c from 'clsx'
import { addRound, removeRound } from '../lib/actions'
import modes from '../lib/modes'
import models from '../lib/models'
import ModelOutput from './ModelOutput'
import useStore from '../lib/store'

function FeedItemHeader({
  round,
  modelName,
  thinkingName,
  showSystemInstruction,
  setShowSystemInstruction,
  showDetails,
  setShowDetails,
  onModifyPrompt,
  totalTokens,
  showTotalTokens
}) {
  return (
    <div className={c('header', { anchorTop: showSystemInstruction })}>
      {modelName && (
        <h2 className="modelTitle">
          <span className="modelTitleText">
            {modelName}&nbsp;
            {thinkingName && (
              <span style={{ opacity: 0.5, fontWeight: 'normal', whiteSpace: 'nowrap', display: 'inline-block' }}>
                {thinkingName}
              </span>
            )}
          </span>
          <span
            className="headerTokenChip"
            style={{ opacity: showTotalTokens && totalTokens ? 1 : 0 }}
          >
            {(totalTokens?.total ?? 99999).toLocaleString()}<span className="tokensLabel"> tokens</span>
            <span className="headerTokenTooltip">
              <div>Total promptTokenCount: {(totalTokens?.prompt ?? 0).toLocaleString()}</div>
              <div>Total thoughtsTokenCount: {(totalTokens?.thoughts ?? 0).toLocaleString()}</div>
              <div>Total candidatesTokenCount: {(totalTokens?.candidates ?? 0).toLocaleString()}</div>
            </span>
          </span>
        </h2>
      )}
      <div className="promptLine">
        {showSystemInstruction && (
          <p className="systemInstruction">{round.systemInstruction}</p>
        )}
        <p className="promptText">
          <span className="chip">
            {modes[round.outputMode].emoji} {modes[round.outputMode].name}
            <span className="tooltip">{round.systemInstruction}</span>
          </span>
          {round.images?.pre && (
            <img
              src={round.images.pre}
              style={{
                height: '1.2em',
                verticalAlign: 'middle',
                borderRadius: 4,
                marginRight: 5,
                border: '1px solid var(--border-secondary)'
              }}
            />
          )},&nbsp;
          {round.prompt}
          {round.images?.post && (
            <img
              src={round.images.post}
              style={{
                height: '1.2em',
                verticalAlign: 'middle',
                borderRadius: 4,
                marginLeft: 5,
                border: '1px solid var(--border-secondary)'
              }}
            />
          )}
        </p>
      </div>
      <div className="headerSpacer" />
      {/* <div className="actions">
        <button
          className="iconButton"
          onClick={() => setShowDetails(!showDetails)}
        >
          <span className="icon">{showDetails ? 'visibility_off' : 'visibility'}</span>
          <span className="tooltip">
            {showDetails ? 'Hide' : 'Show'} details
          </span>
        </button>

        <button
          className="iconButton"
          onClick={() => setShowSystemInstruction(!showSystemInstruction)}
        >
          <span className="icon">assignment</span>
          <span className="tooltip">
            {showSystemInstruction ? 'Hide' : 'Show'} system instruction
          </span>
        </button>

        <button className="iconButton" onClick={() => removeRound(round.id)}>
          <span className="icon">delete</span>
          <span className="tooltip">Remove</span>
        </button>

        <button
          className="iconButton"
          onClick={() => onModifyPrompt(round.prompt)}
        >
          <span className="icon">edit</span>
          <span className="tooltip">Modify prompt</span>
        </button>

        <button
          className="iconButton"
          onClick={() => addRound(round.prompt, round.images)}
        >
          <span className="icon">refresh</span>
          <span className="tooltip">Re-run prompt</span>
        </button>
      </div> */}
    </div>
  )
}

// Map gridSize to optimal column count
const gridSizeToColumns = { 2: 2, 3: 3, 4: 2, 6: 2, 8: 2, 9: 3, 12: 4 }

export default function FeedItem({ round, onModifyPrompt }) {
  const [showSystemInstruction, setShowSystemInstruction] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Get replay state to control token count visibility
  const replayStartTime = useStore.use.replayStartTime()
  const replayPending = useStore.use.replayPending()
  const replaySpeed = useStore.use.replaySpeed()

  // Track elapsed time during replay for reactivity
  const [replayElapsed, setReplayElapsed] = useState(0)
  const rafRef = useRef(null)

  // Check if replay is active or pending
  const isReplayActive = replayStartTime && replayStartTime > 0
  const isPendingReplay = replayPending && !isReplayActive

  // Animation loop to track replay elapsed time
  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    if (isReplayActive) {
      setReplayElapsed(0)

      const animate = () => {
        const elapsed = (Date.now() - replayStartTime) * replaySpeed
        setReplayElapsed(elapsed)

        // Continue animating until we've exceeded the max possible time
        if (elapsed < (round.maxTotalTime || 60000)) {
          rafRef.current = requestAnimationFrame(animate)
        }
      }

      rafRef.current = requestAnimationFrame(animate)
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    } else {
      // Not in replay mode - reset elapsed
      setReplayElapsed(0)
    }
  }, [replayStartTime, replaySpeed, round.maxTotalTime])

  // Check if all outputs in this round are complete
  const allComplete = round.outputs.every(output => !output.isBusy)

  // Check if a model key represents a Gemini 3 Flash model
  const isGemini3Flash = (modelKey) => {
    return modelKey.startsWith('flash3')
  }

  // Helper function to calculate total tokens for a set of outputs
  const calculateTotalTokens = (outputs) => {
    let prompt = 0, thoughts = 0, candidates = 0
    for (const output of outputs) {
      if (output.metrics) {
        prompt += output.metrics.promptTokenCount || 0
        thoughts += output.metrics.thoughtsTokenCount || 0
        candidates += output.metrics.candidatesTokenCount || 0
      }
    }
    return {
      prompt,
      thoughts,
      candidates,
      total: prompt + thoughts + candidates
    }
  }

  // Check if all outputs for a model are complete (not busy and have metrics)
  const areAllOutputsComplete = (outputs) => {
    return outputs.every(output => !output.isBusy && output.metrics?.totalTime)
  }

  // Check if replay animation has finished for a given max total time
  const isReplayFinished = (maxTotalTime) => {
    if (isPendingReplay) return false // Hide tokens when pending
    if (!isReplayActive) return true
    return replayElapsed >= maxTotalTime
  }

  // Group outputs by model for grid/versus modes
  const outputsByModel = useMemo(() => {
    if (!round.numModels || round.numModels === 1) return null // Batch mode - no grouping

    const groups = {}
    for (const output of round.outputs) {
      if (!groups[output.model]) groups[output.model] = []
      groups[output.model].push(output)
    }
    // Sort to put Gemini 3 Flash models first (on the left)
    return Object.entries(groups).sort(([a], [b]) => {
      const aIsFlash3 = a.startsWith('flash3')
      const bIsFlash3 = b.startsWith('flash3')
      if (aIsFlash3 && !bIsFlash3) return -1
      if (!aIsFlash3 && bIsFlash3) return 1
      return 0
    })
  }, [round.outputs, round.numModels])

  // Determine inner grid columns for grid mode
  const innerGridColumns = round.gridSize ? gridSizeToColumns[round.gridSize] : null

  // Grid/Versus mode: render separate <li> per model
  if (outputsByModel) {
    return (
      <div className="model-columns" style={{ '--num-models': outputsByModel.length }}>
        {isReplayActive && !isReplayFinished(round.maxTotalTime) && (
          <div className="speedIndicator"><span className="icon">fast_forward</span>{replaySpeed}X</div>
        )}
        {outputsByModel.map(([modelKey, outputs]) => (
          <li
            key={`${round.id}-${modelKey}`}
            className={c({ gemini3flash: isGemini3Flash(modelKey) })}
          >
            <FeedItemHeader
              round={round}
              modelName={models[modelKey]?.name || modelKey}
              thinkingName={models[modelKey]?.thinkingName}
              showSystemInstruction={showSystemInstruction}
              setShowSystemInstruction={setShowSystemInstruction}
              showDetails={showDetails}
              setShowDetails={setShowDetails}
              onModifyPrompt={onModifyPrompt}
              totalTokens={calculateTotalTokens(outputs)}
              showTotalTokens={areAllOutputsComplete(outputs) && isReplayFinished(Math.max(...outputs.map(o => o.metrics?.totalTime || 0)))}
            />

            <ul className={c('outputs', innerGridColumns && `grid-${innerGridColumns}`)}>
              {outputs.map(output => {
                // Calculate max totalTime for this model group
                const maxTotalTimeForModel = Math.max(...outputs.map(o => o.metrics?.totalTime || 0))
                return (
                  <li key={output.id}>
                    <ModelOutput
                      {...output}
                      prompt={round.prompt}
                      showDetails={showDetails}
                      maxTotalTime={round.maxTotalTime}
                      maxTotalTimeForModel={maxTotalTimeForModel}
                      allComplete={allComplete}
                    />
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </div>
    )
  }

  // Batch mode: original single <li> behavior
  return (
    <li key={round.id} className="feedItemBatch">
      {isReplayActive && !isReplayFinished(round.maxTotalTime) && (
        <div className="speedIndicator"><span className="icon">fast_forward</span>{replaySpeed}x</div>
      )}
      <FeedItemHeader
        round={round}
        modelName={models[round.outputs[0]?.model]?.name}
        thinkingName={models[round.outputs[0]?.model]?.thinkingName}
        showSystemInstruction={showSystemInstruction}
        setShowSystemInstruction={setShowSystemInstruction}
        showDetails={showDetails}
        setShowDetails={setShowDetails}
        onModifyPrompt={onModifyPrompt}
        totalTokens={calculateTotalTokens(round.outputs)}
        showTotalTokens={areAllOutputsComplete(round.outputs) && isReplayFinished(Math.max(...round.outputs.map(o => o.metrics?.totalTime || 0)))}
      />

      <ul className={c('outputs', round.numModels && `grid-${round.numModels}`)}>
        {round.outputs.map(output => {
          // In batch mode, all outputs are the same model - calculate max for this group
          const maxTotalTimeForModel = Math.max(...round.outputs.map(o => o.metrics?.totalTime || 0))
          return (
            <li key={output.id}>
              <ModelOutput
                {...output}
                prompt={round.prompt}
                showDetails={showDetails}
                maxTotalTime={round.maxTotalTime}
                maxTotalTimeForModel={maxTotalTimeForModel}
                allComplete={allComplete}
              />
            </li>
          )
        })}
      </ul>
    </li>
  )
}
