/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Calculate progress bar state for time-based visualization.
 * Works for both generation (real-time) and replay modes.
 *
 * @param {Object} params
 * @param {number} params.elapsed - Current elapsed time in ms
 * @param {Object} params.metrics - Metrics object with TTFT values
 * @param {boolean} params.isReplay - True if in replay mode
 * @param {number} params.maxTime - Max total time in round (for replay scaling)
 * @param {number} params.liveScaleMs - Live max elapsed time for dynamic scaling in generation mode
 * @returns {{ displayWidths: {input, thinking, output}, durations: {input, thinking, output}, isComplete: boolean }}
 */
export const calculateProgress = ({ elapsed, metrics, isReplay, maxTime, liveScaleMs }) => {
  // Handle missing or incomplete metrics
  if (!metrics) {
    return {
      displayWidths: { input: 0, thinking: 0, output: 0 },
      durations: { input: 0, thinking: 0, output: 0 },
      isComplete: false
    }
  }

  // Phase boundaries from metrics
  const hasThinking = metrics.timeToFirstThoughtSummaryToken != null
  const inputEnd = hasThinking
    ? metrics.timeToFirstThoughtSummaryToken
    : (metrics.timeToFirstCandidatesToken || elapsed)
  // During generation, if thinking has started but output hasn't, use elapsed as thinkingEnd
  const thinkingEnd = metrics.timeToFirstCandidatesToken || (hasThinking ? elapsed : inputEnd)
  const outputEnd = metrics.totalTime || elapsed

  // Phase durations in ms
  const durations = {
    input: inputEnd,
    thinking: hasThinking ? Math.max(0, thinkingEnd - inputEnd) : 0,
    output: Math.max(0, outputEnd - thinkingEnd)
  }

  // Scaling threshold - when any generation exceeds this, all bars scale dynamically
  const SCALING_THRESHOLD_MS = 60000
  const DEFAULT_SCALE_MS = 60000

  // Scale calculation:
  // - Replay mode: use maxTime (final round max)
  // - Generation mode with live scaling: use liveScaleMs when above threshold
  // - Otherwise: use 60s default or current elapsed/output time
  const scaleMs = isReplay
    ? (maxTime || outputEnd || DEFAULT_SCALE_MS)
    : (liveScaleMs && liveScaleMs >= SCALING_THRESHOLD_MS
      ? liveScaleMs
      : Math.max(DEFAULT_SCALE_MS, elapsed, outputEnd))

  // Calculate widths based on elapsed time
  const displayWidths = {
    input: inputEnd > 0
      ? (Math.min(elapsed, inputEnd) / scaleMs) * 100
      : 0,
    thinking: hasThinking && elapsed > inputEnd && durations.thinking > 0
      ? (Math.min(elapsed - inputEnd, durations.thinking) / scaleMs) * 100
      : 0,
    output: elapsed > thinkingEnd && durations.output > 0
      ? (Math.min(elapsed - thinkingEnd, durations.output) / scaleMs) * 100
      : 0
  }

  return {
    displayWidths,
    durations,
    isComplete: outputEnd > 0 && elapsed >= outputEnd
  }
}

