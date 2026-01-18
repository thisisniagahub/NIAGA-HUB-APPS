/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useState, useCallback, useRef } from 'react'
import shuffle from 'lodash.shuffle'
import c from 'clsx'
import modes from '../lib/modes'
import models from '../lib/models'
import useStore from '../lib/store'
import {
  addRound,
  setOutputMode,
  setMode,
  setBatchModel,
  setBatchSize,
  setGridSize,
  setVersusModel,
  reset,
  startReplay,
  restartReplay,
  setReplaySpeed,
  setSoundEnabled
} from '../lib/actions'
import { isTouch, isIframe } from '../lib/consts'
import FeedItem from './FeedItem'
import Intro from './Intro'

export default function App() {
  const feed = useStore.use.feed()
  const outputMode = useStore.use.outputMode()
  const batchModel = useStore.use.batchModel()
  const versusModels = useStore.use.versusModels()
  const mode = useStore.use.mode()
  const batchSize = useStore.use.batchSize()
  const gridSize = useStore.use.gridSize()
  const replaySpeed = useStore.use.replaySpeed()
  const replayStartTime = useStore.use.replayStartTime()
  const isSoundEnabled = useStore.use.isSoundEnabled()

  // Grid size values: multiples of 2 and 3, up to 9
  const gridSizeValues = [2, 3, 4, 6, 8, 9]
  const gridSizeToIndex = size => gridSizeValues.indexOf(size)
  const indexToGridSize = index => gridSizeValues[index]

  const [presets, setPresets] = useState([])
  const [showPresets, setShowPresets] = useState(false)
  const [showModes, setShowModes] = useState(false)
  const [showModels, setShowModels] = useState(false)
  const [images, setImages] = useState({ pre: null, post: null })
  const [isDark, setIsDark] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const inputRef = useRef(null)
  const imageInputRefs = useRef({})

  const handleImageSet = async (key, file) => {
    if (file) {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      setImages(prev => ({ ...prev, [key]: base64 }))
    }
  }

  const shufflePresets = useCallback(
    () => setPresets(shuffle(modes[outputMode].presets)),
    [outputMode]
  )

  const onModifyPrompt = useCallback(prompt => {
    inputRef.current.value = prompt
    inputRef.current.focus()
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark(!isDark)
  }, [isDark])

  useEffect(() => {
    shufflePresets()
  }, [shufflePresets])

  useEffect(() => {
    if (isTouch) {
      addEventListener('touchstart', () => {
        setShowModes(false)
        setShowModels(false)
        setShowPresets(false)
      })
    }
  }, [])

  // Tooltip click/touch support
  useEffect(() => {
    const handleTooltipClick = (e) => {
      const tooltipParent = e.target.closest(':has(> .tooltip)')
      if (tooltipParent) {
        // Toggle active state on the clicked element
        tooltipParent.classList.toggle('tooltip-active')
        e.stopPropagation()
      } else {
        // Click outside - remove all active tooltips
        document.querySelectorAll('.tooltip-active').forEach(el => {
          el.classList.remove('tooltip-active')
        })
      }
    }
    document.addEventListener('click', handleTooltipClick)
    return () => document.removeEventListener('click', handleTooltipClick)
  }, [])

  useEffect(() => {
    if (!isIframe) {
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
    }
  }, [isDark])

  // Keyboard shortcuts for replay controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (feed.length === 0) return

      if (e.key === 'r' || e.key === 'R') {
        restartReplay()
      } else if (e.key === 'p' || e.key === 'P') {
        startReplay()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [feed.length])

  const renderImageUploader = (key, label) => (
    <div>
      <div
        className="imageInput"
        onClick={() => imageInputRefs.current[key].click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          handleImageSet(key, e.dataTransfer.files[0])
        }}
      >
        <input
          type="file"
          ref={el => (imageInputRefs.current[key] = el)}
          onChange={e => handleImageSet(key, e.target.files[0])}
        />
        <div
          className="dropZone"
          style={{
            width: '36px',
            height: '36px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {images[key] ? (
            <img src={images[key]} />
          ) : (
            <span className="icon">add_photo_alternate</span>
          )}
        </div>
      </div>
      <div className="label">{label}</div>
    </div>
  )

  return (
    <div className={isIframe ? '' : isDark ? 'dark' : 'light'}>
      <header>
        {/* <h1>Compare models:</h1> */}
        {showDetails && (
          <div>
            <div className="toggle">
              <button
                className={c('button', { primary: mode === 'versus' })}
                onClick={() => setMode('versus')}
              >
                <span className="icon">swords</span> Versus
              </button>
              <button
                className={c('button', { primary: mode === 'batch' })}
                onClick={() => setMode('batch')}
              >
                <span className="icon">stacks</span> Batch
              </button>
              <button
                className={c('button', { primary: mode === 'grid' })}
                onClick={() => setMode('grid')}
              >
                <span className="icon">grid_view</span> Grid
              </button>
            </div>
            <div className="label">Mode</div>
          </div>
        )}

        <div
          className="selectorWrapper"
          tabIndex={0}
          role="button"
          aria-haspopup="listbox"
          aria-expanded={showModels}
          onMouseEnter={!isTouch ? () => setShowModels(true) : undefined}
          onMouseLeave={!isTouch ? () => setShowModels(false) : undefined}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setShowModels(!showModels)
              setShowModes(false)
              setShowPresets(false)
            } else if (e.key === 'Escape') {
              setShowModels(false)
            }
          }}
          onTouchStart={
            isTouch
              ? e => {
                e.stopPropagation()
                setShowModels(true)
                setShowModes(false)
                setShowPresets(false)
              }
              : null
          }
        >
          <p>
            {mode === 'batch'
              ? <>
                {models[batchModel].name}
                {models[batchModel].thinkingName && (
                  <span style={{ opacity: 0.5, marginLeft: '4px' }}>
                    {models[batchModel].thinkingName}
                  </span>
                )}
              </>
              : Object.keys(versusModels).filter(key => versusModels[key])
                .length + ' selected'}
          </p>
          <div className={c('selector', { active: showModels })}>
            <ul>
              {Object.keys(models)
                .filter(key => !models[key].imageOutput)
                .map(key => {
                  const selectedCount = Object.values(versusModels).filter(Boolean).length
                  const isDisabled = mode !== 'batch' && !versusModels[key] && selectedCount >= 3
                  return (
                    <li key={key}>
                      <button
                        className={c('chip', {
                          primary: mode === 'batch'
                            ? key === batchModel
                            : versusModels[key]
                        })}
                        tabIndex={showModels ? 0 : -1}
                        disabled={isDisabled}
                        onClick={() => {
                          if (mode === 'batch') {
                            setBatchModel(key)
                            setShowModels(false)
                          } else {
                            // Limit to max 3 models
                            if (!versusModels[key] && selectedCount >= 3) return
                            setVersusModel(key, !versusModels[key])
                          }
                        }}
                      >
                        {models[key].name}
                        {models[key].thinkingName && (
                          <span style={{ opacity: 0.5, marginLeft: '4px' }}>
                            {models[key].thinkingName}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
            </ul>
          </div>
          <div className="label">Model{mode === 'batch' ? '' : 's'}</div>
        </div>

        <div
          className="selectorWrapper"
          tabIndex={0}
          role="button"
          aria-haspopup="listbox"
          aria-expanded={showModes}
          onMouseEnter={!isTouch ? () => setShowModes(true) : undefined}
          onMouseLeave={!isTouch ? () => setShowModes(false) : undefined}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setShowModes(!showModes)
              setShowModels(false)
              setShowPresets(false)
            } else if (e.key === 'Escape') {
              setShowModes(false)
            }
          }}
          onTouchStart={
            isTouch
              ? e => {
                e.stopPropagation()
                setShowModes(true)
                setShowModels(false)
                setShowPresets(false)
              }
              : null
          }
        >
          <p>
            {modes[outputMode].emoji} {modes[outputMode].name}
          </p>
          <div className={c('selector', { active: showModes })}>
            <ul>
              {Object.keys(modes)
                .filter(key => key !== 'image')
                .map(key => (
                  <li key={key}>
                    <button
                      className={c('chip', { primary: key === outputMode })}
                      tabIndex={showModes ? 0 : -1}
                      onClick={() => {
                        setOutputMode(key)
                        setShowModes(false)

                        if (key === 'image') {
                          setBatchModel(
                            Object.keys(models).find(k => models[k].imageOutput)
                          )
                        } else if (outputMode === 'image') {
                          setBatchModel(Object.keys(models)[1])
                        }
                      }}
                    >
                      {modes[key].emoji} {modes[key].name}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
          <div className="label">System instructions</div>
        </div>

        {showDetails && renderImageUploader('pre', 'Img (pre)')}

        <div
          className="selectorWrapper prompt"
          onMouseEnter={!isTouch ? () => setShowPresets(true) : undefined}
          onMouseLeave={!isTouch ? () => setShowPresets(false) : undefined}
          onTouchStart={
            isTouch
              ? e => {
                e.stopPropagation()
                setShowPresets(true)
                setShowModes(false)
                setShowModels(false)
              }
              : null
          }
        >
          <input
            className="promptInput"
            placeholder="Enter a prompt"
            onFocus={!isTouch ? () => setShowPresets(false) : undefined}
            ref={inputRef}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addRound(e.target.value, images)
                e.target.blur()
              }
            }}
          />
          <div className={c('selector', { active: showPresets })}>
            <ul className="presets wrapped">
              <li>
                <button
                  onClick={() => {
                    addRound(
                      presets[Math.floor(Math.random() * presets.length)]
                        .prompt,
                      images
                    )
                    setShowPresets(false)
                  }}
                  className="chip primary"
                  tabIndex={showPresets ? 0 : -1}
                >
                  <span className="icon">Ifl</span>
                  Random prompt
                </button>
              </li>

              {presets.map(({ label, prompt }) => (
                <li key={label}>
                  <button
                    onClick={() => {
                      addRound(prompt, images)
                      setShowPresets(false)
                    }}
                    className="chip"
                    tabIndex={showPresets ? 0 : -1}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="label">Prompt</div>
        </div>

        {showDetails && renderImageUploader('post', 'Img (post)')}

        {showDetails && mode === 'batch' && (
          <div>
            <div className="rangeWrap">
              <div className="batchSize">
                <input
                  type="range"
                  min={1}
                  max={9}
                  value={batchSize}
                  onChange={e => setBatchSize(e.target.valueAsNumber)}
                />{' '}
                {batchSize}
              </div>
            </div>
            <div className="label">Batch size</div>
          </div>
        )}

        <div>
          <div className="rangeWrap">
            <div className="batchSize">
              <input
                type="range"
                min={0}
                max={gridSizeValues.length - 1}
                value={gridSizeToIndex(gridSize)}
                onChange={e => setGridSize(indexToGridSize(e.target.valueAsNumber))}
              />{' '}
              {gridSize}
            </div>
          </div>
          <div className="label">Grid size</div>
        </div>


        {showDetails && (
          <div>
            <button
              className="circleButton resetButton"
              onClick={() => {
                reset()
                setImages({ pre: null, post: null })
                inputRef.current.value = ''
              }}
            >
              <span className="icon">replay</span>
            </button>
            <div className="label">Reset</div>
          </div>
        )}

        {showDetails && !isIframe && (
          <div>
            <button className="circleButton resetButton" onClick={toggleTheme}>
              <span className="icon">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <div className="label">Theme</div>
          </div>
        )}

        <div className="headerSpacer"></div>

        <div className="replayControls">
          <div className="replayControlsInner">
            <div className="toggle speedToggle">
              {[1, 2, 4, 8].map(speed => (
                <button
                  key={speed}
                  className={c('button', {
                    selected: replaySpeed === speed && !replayStartTime,
                    primary: replaySpeed === speed && replayStartTime
                  })}
                  onClick={() => setReplaySpeed(speed)}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <div className="replayButtons">
              <button
                className={c('resetButton', { primary: isSoundEnabled })}
                onClick={() => setSoundEnabled(!isSoundEnabled)}
                title={isSoundEnabled ? 'Sound on' : 'Sound off'}
              >
                <span className="icon">{isSoundEnabled ? 'volume_up' : 'volume_off'}</span>
              </button>
              <button
                className="resetButton"
                onClick={restartReplay}
                disabled={feed.length === 0}
                title="Restart"
              >
                <span className="icon">skip_previous</span>
              </button>
              <button
                className="resetButton primary"
                onClick={startReplay}
                disabled={feed.length === 0}
                title="Play"
              >
                <span className="icon">play_arrow</span>
              </button>
            </div>
          </div>
        </div>

        {/* <div>
          <button
            className="circleButton resetButton"
            onClick={() => setShowDetails(!showDetails)}
          >
            <span className="icon">
              {showDetails ? 'visibility_off' : 'visibility'}
            </span>
          </button>
          <div className="label">{showDetails ? 'Less' : 'More'}</div>
        </div> */}
      </header>

      <main>
        {feed.length ? (
          <ul className="feed">
            {feed.map(round => (
              <FeedItem
                key={round.id}
                round={round}
                onModifyPrompt={onModifyPrompt}
              />
            ))}
          </ul>
        ) : (
          <Intro />
        )}
      </main>
    </div>
  )
}