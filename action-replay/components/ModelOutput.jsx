/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState, memo, useRef } from 'react'
import c from 'clsx'
import modes from '../lib/modes'
import models from '../lib/models'
import Renderer from './Renderer'
import useStore from '../lib/store'
import { calculateProgress } from '../lib/progress'
import { playGenerationComplete, playLastModelComplete, playChunk } from '../lib/sounds'
import { updateLiveMaxElapsed } from '../lib/actions'

function ModelOutput({
  model,
  outputData,
  streamingText,
  outputMode,
  isBusy,
  startTime,
  totalTime,
  gotError,
  prompt,
  showDetails,
  metrics,
  maxTotalTime,
  maxTotalTimeForModel,
  allComplete
}) {
  // Get replay start time and speed from global store - triggers animation when changed
  const replayStartTime = useStore.use.replayStartTime()
  const replayPending = useStore.use.replayPending()
  const replaySpeed = useStore.use.replaySpeed()
  const liveMaxElapsed = useStore.use.liveMaxElapsed()  // For dynamic progress bar scaling
  const [time, setTime] = useState(0)
  const [showSource, setShowSource] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hoveredPhase, setHoveredPhase] = useState(null)

  // Unified elapsed time state for both generation and replay
  const [elapsed, setElapsed] = useState(0)
  const [isReplaying, setIsReplaying] = useState(false) // Only hide output during active replay
  const rafRef = useRef(null)
  const lastReplayTextLengthRef = useRef(0) // Track text length for chunk sounds
  const playedCompletionRef = useRef(false) // Prevent duplicate completion sounds

  // Determine if we're in replay mode
  const isReplay = replayStartTime && replayStartTime > 0
  const isPendingReplay = replayPending && !isReplay

  // Helper: compute visible text from stream data at a given elapsed time
  const getVisibleTextAtTime = (streamData, elapsedMs, ttft) => {
    if (!streamData || !ttft || elapsedMs < ttft) return ''
    let text = ''
    for (const entry of streamData) {
      if (entry.time <= elapsedMs) {
        text += entry.chunk
      } else {
        break
      }
    }
    return text
  }

  // Compute console text for display
  const consoleText = isReplaying
    ? getVisibleTextAtTime(
      metrics?.candidatesStreamData,
      elapsed,
      metrics?.timeToFirstCandidatesToken
    )
    : (streamingText || '')

  // Reset elapsed when a new generation starts (isBusy becomes true)
  useEffect(() => {
    if (isBusy) {
      setElapsed(0)
    }
  }, [isBusy])

  // Animation loop for both generation and replay modes
  useEffect(() => {
    // Clean up any existing animation
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    // Pending replay mode: show zero state, hide outputs
    if (isPendingReplay) {
      setElapsed(0)
      setIsReplaying(true)
      return
    }

    // Replay mode: animate from 0 to maxTotalTime
    if (isReplay && metrics?.totalTime) {
      setElapsed(0)
      setIsReplaying(true)
      lastReplayTextLengthRef.current = 0
      playedCompletionRef.current = false

      const animate = () => {
        const now = Date.now()
        const currentElapsed = (now - replayStartTime) * replaySpeed

        setElapsed(currentElapsed)

        // Play chunk sounds when new text appears during replay
        const visibleText = getVisibleTextAtTime(
          metrics?.candidatesStreamData,
          currentElapsed,
          metrics?.timeToFirstCandidatesToken
        )
        if (visibleText.length > lastReplayTextLengthRef.current) {
          playChunk() // Throttled internally
          lastReplayTextLengthRef.current = visibleText.length
        }

        // Stop replaying (show output) after this model's totalTime
        if (currentElapsed >= metrics.totalTime) {
          setIsReplaying(false)
          // Play completion sound once
          if (!playedCompletionRef.current) {
            playedCompletionRef.current = true
            // Last model is the one with the longest totalTime for its model group
            if (metrics.totalTime === maxTotalTimeForModel) {
              playLastModelComplete()
            } else {
              playGenerationComplete()
            }
          }
        }

        // Continue animating until maxTotalTime reached
        if (currentElapsed < (maxTotalTime || metrics.totalTime)) {
          rafRef.current = requestAnimationFrame(animate)
        } else {
          setElapsed(maxTotalTime || metrics.totalTime)
          setIsReplaying(false)
        }
      }

      rafRef.current = requestAnimationFrame(animate)
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    }

    // Not in replay - ensure replaying state is false
    setIsReplaying(false)

    // Generation mode: track elapsed time from startTime
    if (isBusy && startTime) {
      const animate = () => {
        const currentElapsed = Date.now() - startTime
        setElapsed(currentElapsed)
        // Update the global max elapsed time for dynamic scaling
        updateLiveMaxElapsed(currentElapsed)
        rafRef.current = requestAnimationFrame(animate)
      }
      rafRef.current = requestAnimationFrame(animate)
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    }

    // Busy but no startTime (retry delay) - show 0
    if (isBusy && !startTime) {
      setElapsed(0)
    }

    // Complete state: set elapsed to totalTime
    if (!isBusy && totalTime) {
      setElapsed(totalTime)
    }
  }, [replayStartTime, replayPending, isBusy, startTime, totalTime, metrics?.totalTime, maxTotalTime])

  // Calculate progress using unified function
  // When pending, pass elapsed=0 to show empty progress bar
  // In generation mode, use liveMaxElapsed for dynamic scaling
  const progress = calculateProgress({
    elapsed: isPendingReplay ? 0 : (isReplay ? elapsed : (isBusy ? elapsed : (totalTime || 0))),
    metrics,
    isReplay: isReplay || isPendingReplay,
    maxTime: maxTotalTime,
    liveScaleMs: !isReplay && !isPendingReplay ? liveMaxElapsed : null
  })

  const copySource = () => {
    if (outputMode === 'image') {
      const byteString = atob(outputData.split(',')[1])
      const mimeString = outputData.split(',')[0].split(':')[1].split(';')[0]
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)

      byteString.split('').forEach((char, i) => (ia[i] = char.charCodeAt(0)))

      const item = new ClipboardItem({
        [mimeString]: new Blob([ab], { type: mimeString })
      })
      navigator.clipboard.write([item]).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1000)
      })
    } else {
      navigator.clipboard.writeText(outputData.trim())
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    }
  }

  const downloadOutput = () => {
    if (!outputData) return

    const modelName = models[model].modelString.replace(/\s+/g, '_')
    const promptSlug = (prompt || 'prompt')
      .slice(0, 20)
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
    const filename = `${modelName}_${promptSlug}`

    if (outputMode === 'image') {
      const link = document.createElement('a')
      link.href = outputData
      link.download = `${filename}.png`
      link.click()
    } else {
      let extension = 'txt'
      if (['html', 'htmlraw', 'three', 'threeraw'].includes(outputMode)) {
        extension = 'html'
      } else if (['p5', 'p5raw'].includes(outputMode)) {
        extension = 'js'
      } else if (['svg', 'svgraw'].includes(outputMode)) {
        extension = 'svg'
      }

      const blob = new Blob([outputData], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.${extension}`
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  useEffect(() => {
    let interval

    if (isBusy && startTime) {
      // Generation in progress - count up from startTime
      interval = setInterval(() => setTime(Date.now() - startTime), 10)
    } else if (isBusy && !startTime) {
      // Busy but no startTime (waiting in queue or retry delay) - show 0
      setTime(0)
    } else if (!startTime) {
      // Not busy, no startTime - keep at 0
      setTime(0)
    }

    return () => clearInterval(interval)
  }, [startTime, isBusy])

  useEffect(() => {
    const handleEsc = e => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isFullscreen])

  // Build phase data for rendering
  const phases = [
    {
      key: 'input',
      label: 'Reading prompt',
      width: progress.displayWidths.input,
      duration: progress.durations.input,
      tokenCount: metrics?.promptTokenCount
    },
    {
      key: 'thinking',
      label: 'Thinking',
      width: progress.displayWidths.thinking,
      duration: progress.durations.thinking,
      tokenCount: metrics?.thoughtsTokenCount
    },
    {
      key: 'output',
      label: 'Writing response',
      width: progress.displayWidths.output,
      duration: progress.durations.output,
      tokenCount: metrics?.candidatesTokenCount
    }
  ]

  return (
    <div className="modelOutput">
      {isFullscreen && (
        <div className="fullscreenOverlay">
          <button
            className="circleButton closeButton"
            onClick={() => setIsFullscreen(false)}
          >
            <span className="icon">close</span>
          </button>
          <Renderer
            mode={outputMode}
            code={outputData}
            fullscreen={true}
          />
        </div>
      )}

      {/* Token count chip - positioned relative to modelOutput */}
      {metrics?.totalTime && !isBusy && !isReplaying && (
        <div className="tokenCountChip">
          {((metrics.promptTokenCount || 0) + (metrics.thoughtsTokenCount || 0) + (metrics.candidatesTokenCount || 0)).toLocaleString()}<span className="tokensLabel"> tokens</span>
          <div className="tokenCountTooltip">
            <div>promptTokenCount: {(metrics.promptTokenCount || 0).toLocaleString()}</div>
            <div>thoughtsTokenCount: {(metrics.thoughtsTokenCount || 0).toLocaleString()}</div>
            <div>candidatesTokenCount: {(metrics.candidatesTokenCount || 0).toLocaleString()}</div>
          </div>
        </div>
      )}

      <div className={c('outputRendering', { flipped: showSource })}>
        {outputMode !== 'image' && (
          <div className="back">
            {/* <SyntaxHighlighter
              language={modes[outputMode].syntax}
              style={styles.atomOneDark}
            >
              {outputData}
            </SyntaxHighlighter> */}
          </div>
        )}

        <div className="front">
          {gotError && (
            <div className="error">
              <p>
                <span className="icon">error</span>
              </p>
              <p>Response error</p>
            </div>
          )}

          {outputData && !isReplaying && <Renderer mode={outputMode} code={outputData} />}

          {/* Typing indicator: show when busy/replaying but no text yet, hide when pending */}
          {(isBusy || (isReplaying && !isPendingReplay)) && !(isReplaying ? consoleText : streamingText) && (
            <div className="loader typingIndicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}

          {/* Console output: show when we have streaming text */}
          {(isReplaying ? consoleText : streamingText) && (
            <div className="consoleOutput">
              <div className="consoleText">{isReplaying ? consoleText : streamingText}</div>
            </div>
          )}
        </div>
      </div>

      <div className="modelInfo">
        {/* Time-based progress bar */}
        <div className="metricsContainer">
          <div className="metricsBarWrapper">
            <div className="metricsBarBackground">
              {(isBusy || metrics?.totalTime) && (
                <div className="metricsBar">
                  {phases.map(phase => (
                    phase.width > 0 && (
                      <div
                        key={phase.key}
                        className={`phase ${phase.key}`}
                        style={{ width: `${phase.width}%` }}
                        onMouseEnter={() => setHoveredPhase(phase)}
                        onMouseLeave={() => setHoveredPhase(null)}
                      >
                      </div>
                    )
                  ))}
                  <div className="timerContainer">
                    {(isBusy || time || totalTime || gotError) && (
                      <div className="timer">
                        {(() => {
                          // Format time with leading zero for seconds (e.g., "01.23s")
                          const formatTime = (ms) => {
                            const seconds = (ms / 1000).toFixed(2)
                            const [whole, decimal] = seconds.split('.')
                            return whole.padStart(2, '0') + '.' + decimal + 's'
                          }
                          // Pending replay: show 00.00s
                          if (isPendingReplay) {
                            return formatTime(0)
                          }
                          // During replay, show elapsed time capped at this model's totalTime
                          if (isReplay && elapsed > 0) {
                            const displayTime = Math.min(elapsed, metrics?.totalTime || elapsed)
                            return formatTime(displayTime)
                          }
                          // Normal timer
                          return formatTime(isBusy ? time : totalTime)
                        })()}
                        <span
                          className="completionCheck"
                          style={{ opacity: progress.isComplete && !isBusy ? 1 : 0 }}
                        >
                          &nbsp;✅
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {hoveredPhase && (
              <div className="metricsBarTooltip">
                {hoveredPhase.label}: {(hoveredPhase.duration / 1000).toFixed(2)}s
              </div>
            )}
            <div className="phaseLabels">
              {progress.displayWidths.input > 0 && <span className="phaseLabel input">Input</span>}
              {progress.displayWidths.input > 0 && progress.displayWidths.thinking > 0 && <span className="phaseSeparator">|</span>}
              {progress.displayWidths.thinking > 0 && <span className="phaseLabel thinking">Thinking</span>}
              {(progress.displayWidths.input > 0 || progress.displayWidths.thinking > 0) && progress.displayWidths.output > 0 && <span className="phaseSeparator">|</span>}
              {progress.displayWidths.output > 0 && <span className="phaseLabel output">Output</span>}
            </div>
          </div>
        </div>

        {showDetails && metrics?.totalTime && (
          <div className="metricsText">
            <span>Prompt tokens: {metrics.promptTokenCount?.toLocaleString()}</span>
            <span>Thinking tokens: {metrics.thoughtsTokenCount?.toLocaleString()}</span>
            <span>Output tokens: {metrics.candidatesTokenCount?.toLocaleString()}</span>
            <br />
            {metrics.timeToFirstThoughtSummaryToken && (
              <span>TTFT (thoughts): {metrics.timeToFirstThoughtSummaryToken}ms</span>
            )}
            <span>TTFT (candidates): {metrics.timeToFirstCandidatesToken}ms</span>
            <span>Total time: {metrics.totalTime}ms</span>
          </div>
        )}

        {showDetails && (
          <div className={c('outputActions', { active: outputData })}>
            {outputMode !== 'image' && (
              <button
                className="iconButton"
                onClick={() => setShowSource(!showSource)}
              >
                <span className="icon">{showSource ? 'visibility' : 'code'}</span>
                <span className="tooltip">
                  View {showSource ? 'rendering' : 'source'}
                </span>
              </button>
            )}

            <button
              className="iconButton"
              onClick={() => setIsFullscreen(true)}
            >
              <span className="icon">fullscreen</span>
              <span className="tooltip">Fullscreen</span>
            </button>

            <button className="iconButton" onClick={downloadOutput}>
              <span className="icon">download</span>
              <span className="tooltip">Download</span>
            </button>

            <button className="iconButton" onClick={copySource}>
              <span className="icon">content_copy</span>
              <span className="tooltip">
                {copied
                  ? 'Copied!'
                  : outputMode === 'image'
                    ? 'Copy image'
                    : 'Copy source'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(ModelOutput)
