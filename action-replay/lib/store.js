/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import 'immer'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { createSelectorFunctions } from 'auto-zustand-selectors-hook'
import modes from './modes'
import models from './models'

export default createSelectorFunctions(
  create(
    immer(() => ({
      didInit: false,
      feed: [],
      outputMode: 'svg',
      mode: 'grid', // 'batch', 'grid', or 'versus'
      batchSize: 4,
      gridSize: 4,
      batchModel: Object.keys(models)[1],
      versusModels: {
        flash3: true,
        pro2dot5: true
      },
      replayStartTime: null,
      replayPending: false,
      replaySpeed: 4,
      isSoundEnabled: true,
      liveMaxElapsed: null  // Current max elapsed time across all active generations
    }))
  )
)
