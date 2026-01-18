/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI, Modality} from '@google/genai'
import {limitFunction} from 'p-limit'

const timeoutMs = 193_333
const maxRetries = 5
const baseDelay = 1_233
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})

// Export ai for countTokens access
export { ai }

const buildThinkingConfig = (thinkingConfig) => {
  if (thinkingConfig === null) {
    return {}  // Model doesn't support thinking
  }
  return {
    thinkingConfig: {
      ...thinkingConfig,
      includeThoughts: true // Always request, but none will be returned for models that don't support it
    } 
  }
}

// Streaming generation with metrics
export const llmGenStream = limitFunction(
  async ({
    model,
    systemInstruction,
    prompt,
    images = { pre: null, post: null },
    thinkingConfig,
    onStart,
    onRetry,
    onFirstThought,
    onFirstCandidate,
    onThoughtChunk,
    onCandidatesChunk,
    onComplete,
    onError
  }) => {
    let startTime
    let timeToFirstThoughtSummaryToken = null
    let timeToFirstCandidatesToken = null
    let candidatesText = ''

    // Build parts array once for all attempts
    const parts = []
    if (images.pre) {
      parts.push({
        inlineData: {
          data: images.pre.split(',')[1],
          mimeType: images.pre.split(';')[0].split(':')[1]
        }
      })
    }
    parts.push({ text: prompt })
    if (images.post) {
      parts.push({
        inlineData: {
          data: images.post.split(',')[1],
          mimeType: images.post.split(';')[0].split(':')[1]
        }
      })
    }

    // Note: countTokens doesn't support systemInstruction param, so we include it in contents
    let promptTokenCount = null
    try {
      const countContents = []
      if (systemInstruction) {
        countContents.push({ role: 'user', parts: [{ text: systemInstruction }] })
      }
      countContents.push({ role: 'user', parts })

      const countResult = await ai.models.countTokens({
        model,
        contents: countContents
      })
      promptTokenCount = countResult.totalTokens
    } catch (e) {
      console.warn('Failed to count tokens:', e)
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // Reset timing for each attempt - we only want to measure the successful generation
      startTime = Date.now()
      // Notify caller that generation is starting (after queue wait, on each retry)
      onStart?.()
      timeToFirstThoughtSummaryToken = null
      timeToFirstCandidatesToken = null
      candidatesText = ''

      try {
        const response = await ai.models.generateContentStream({
          model,
          config: {
            ...(systemInstruction ? { systemInstruction } : {}),
            safetySettings,
            ...buildThinkingConfig(thinkingConfig)
          },
          contents: [{ parts }]
        })

        let usageMetadata = null

        for await (const chunk of response) {
          // Capture usageMetadata from each chunk - the final one will have the totals
          if (chunk.usageMetadata) {
            usageMetadata = chunk.usageMetadata
          }

          const chunkParts = chunk.candidates?.[0]?.content?.parts || []
          for (const part of chunkParts) {
            if (part.thought && part.text) {
              if (!timeToFirstThoughtSummaryToken) {
                timeToFirstThoughtSummaryToken = Date.now() - startTime
                // Notify UI immediately when first thought arrives
                onFirstThought?.({ timestamp: Date.now(), ttft: timeToFirstThoughtSummaryToken })
              }
              onThoughtChunk?.(part.text, Date.now() - startTime)
            } else if (part.text) {
              if (!timeToFirstCandidatesToken) {
                timeToFirstCandidatesToken = Date.now() - startTime
                // Notify UI immediately when first candidate arrives
                onFirstCandidate?.({ timestamp: Date.now(), ttft: timeToFirstCandidatesToken })
              }
              candidatesText += part.text
              onCandidatesChunk?.(part.text, Date.now() - startTime)
            }
          }
        }

        const totalTime = Date.now() - startTime

        onComplete?.({
          text: candidatesText,
          metrics: {
            thoughtsTokenCount: usageMetadata?.thoughtsTokenCount || 0,
            candidatesTokenCount: usageMetadata?.candidatesTokenCount || 0,
            timeToFirstThoughtSummaryToken,
            timeToFirstCandidatesToken,
            totalTime,
            promptTokenCount
          }
        })
        return

      } catch (error) {
        if (error.name === 'AbortError') {
          return
        }

        if (attempt === maxRetries - 1) {
          onError?.(error)
          return
        }

        // Notify UI to reset timer before retry delay
        onRetry?.()
        const delay = baseDelay * 2 ** attempt
        console.warn(`Attempt ${attempt + 1} failed, retrying after ${delay}ms...`)
        await new Promise(res => setTimeout(res, delay))
      }
    }
  },
  { concurrency: 12 }
)

const safetySettings = [
  'HARM_CATEGORY_HATE_SPEECH',
  'HARM_CATEGORY_SEXUALLY_EXPLICIT',
  'HARM_CATEGORY_DANGEROUS_CONTENT',
  'HARM_CATEGORY_HARASSMENT'
].map(category => ({category, threshold: 'BLOCK_NONE'}))