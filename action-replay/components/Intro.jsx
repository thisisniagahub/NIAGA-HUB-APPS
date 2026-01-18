/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState } from 'react'
import shuffle from 'lodash.shuffle'
import modes from '../lib/modes'
import {
  addRound,
  setOutputMode,
  setBatchModel,
  setMode
} from '../lib/actions'
import models from '../lib/models'
import useStore from '../lib/store'

export default function Intro() {
  const batchModel = useStore.use.batchModel()
  const [presets] = useState(
    Object.fromEntries(
      Object.entries(modes).map(([key, mode]) => [
        key,
        shuffle(mode.presets.slice(0, 50))
      ])
    )
  )

  return (
    <section className="intro">
      <h2>Click to generate:</h2>
      {/* <p>
        This is a playground where you can quickly batch-test prompts with
        visual outputs. ✅ 👀 Try one below:
      </p> */}
      {Object.entries(modes).map(([key, mode]) =>
        mode.imageOutput ? null : (
          <div key={key}>
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              Using <span className="chip">
                {mode.emoji} {mode.name}
                <span className="tooltip">{mode.systemInstruction}</span>
              </span>
            </h3>

            <div className="selector presetList">
              <ul className="presets wrapped">
                {presets[key].map(({ label, prompt }) => (
                  <li key={label}>
                    <button
                      onClick={() => {
                        setOutputMode(key)

                        if (key === 'image') {
                          setMode('batch')
                          setBatchModel(
                            Object.keys(models).find(k => models[k].imageOutput)
                          )
                        } else if (models[batchModel].imageOutput) {
                          setBatchModel(Object.keys(models)[1])
                        }

                        addRound(prompt)
                      }}
                      className="chip"
                    >
                      {label}
                    </button>
                  </li>
                ))}
                {/* <li>
                <button
                  className="chip primary"
                  onClick={() =>
                    setPresets(prev => ({
                      ...prev,
                      [key]: shuffle(mode.presets).slice(0, 5)
                    }))
                  }
                >
                  <span className="icon">shuffle</span>
                  Show more
                </button>
              </li> */}
              </ul>
            </div>
          </div>
        )
      )}
      <p className="attribution">
        Got some fun results? 💬 Share them with us:<br />
        <a href="https://x.com/cobley_ben" target="_blank" rel="noopener noreferrer">@cobley_ben</a> /{' '}
        <a href="https://x.com/dcmotz" target="_blank" rel="noopener noreferrer">@dcmotz</a> /{' '}
        <a href="https://x.com/alexanderchen" target="_blank" rel="noopener noreferrer">@alexanderchen</a>
      </p>
    </section>
  )
}
