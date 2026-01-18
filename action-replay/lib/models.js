/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export default {
  // === Gemini 2.5 Models ===
  lite: {
    name: 'Gemini 2.5 Flash-Lite',
    version: '2.5',
    modelString: 'gemini-2.5-flash-lite',
    thinkingName: null,
    thinkingConfig: null  // Does not support thinking
  },
  flash2dot5Off: {
    name: 'Gemini 2.5 Flash',
    version: '2.5',
    modelString: 'gemini-2.5-flash',
    thinkingName: 'Thinking off',
    thinkingConfig: { thinkingBudget: 0 }
  },
  flash2dot5: {
    name: 'Gemini 2.5 Flash',
    version: '2.5',
    modelString: 'gemini-2.5-flash',
    thinkingName: 'Dynamic thinking',
    thinkingConfig: { thinkingBudget: -1 }
  },

  pro2dot5: {
    name: 'Gemini 2.5 Pro',
    version: '2.5',
    modelString: 'gemini-2.5-pro',
    thinkingName: 'Dynamic thinking',
    thinkingConfig: { thinkingBudget: -1 }
  },

  // === Gemini 3 Models ===
  flash3Off: {
    name: 'Gemini 3 Flash',
    version: '3',
    modelString: 'gemini-3-flash-preview',
    thinkingName: 'Minimal thinking',
    thinkingConfig: { thinkingLevel: 'minimal' }
  },
  flash3Low: {
    name: 'Gemini 3 Flash',
    version: '3',
    modelString: 'gemini-3-flash-preview',
    thinkingName: 'Low thinking',
    thinkingConfig: { thinkingLevel: 'low' }
  },
  flash3Medium: {
    name: 'Gemini 3 Flash',
    version: '3',
    modelString: 'gemini-3-flash-preview',
    thinkingName: 'Medium thinking',
    thinkingConfig: { thinkingLevel: 'medium' }
  },
  flash3: {
    name: 'Gemini 3 Flash',
    version: '3',
    modelString: 'gemini-3-flash-preview',
    thinkingName: 'Dynamic thinking',
    thinkingConfig: {}  // Dynamic = no thinkingLevel specified
  },
  flash3High: {
    name: 'Gemini 3 Flash',
    version: '3',
    modelString: 'gemini-3-flash-preview',
    thinkingName: 'High thinking',
    thinkingConfig: { thinkingLevel: 'high' }
  },

  pro3Low: {
    name: 'Gemini 3 Pro',
    version: '3',
    modelString: 'gemini-3-pro-preview',
    thinkingName: 'Low thinking',
    thinkingConfig: { thinkingLevel: 'low' },
    imageOutput: false
  },
  pro3: {
    name: 'Gemini 3 Pro',
    version: '3',
    modelString: 'gemini-3-pro-preview',
    thinkingName: 'Dynamic thinking',
    thinkingConfig: {},  // Dynamic = no thinkingLevel specified
    imageOutput: false
  },
  pro3High: {
    name: 'Gemini 3 Pro',
    version: '3',
    modelString: 'gemini-3-pro-preview',
    thinkingName: 'High thinking',
    thinkingConfig: { thinkingLevel: 'high' },
    imageOutput: false
  }
}
