# Product Requirements Document (PRD): Abang Colek Kiosk

## 1. Vision & Purpose
**Abang Colek Kiosk** is an experimental "Retro-Futuristic Drive-Thru" experience. It leverages the **Gemini Live API** to provide a high-latency, voice-first interaction model that transforms the mundane task of ordering food into an immersive, multi-sensory journey.

The goal is to showcase the capabilities of native Audio-to-Audio (A2A) models in a retail context, using a "Nina" persona to bridge the gap between human-like service and digital efficiency.

## 2. Target Audience
- Tech enthusiasts interested in LLM capabilities.
- Developers looking for references on Gemini Live API integration.
- Users who enjoy retro-gaming aesthetics and interactive storytelling.

## 3. Key Functional Requirements

### 3.1 Voice-First Interaction (The "Nina" Agent)
- **Native Audio Streaming**: Real-time voice interaction using `gemini-2.5-flash-native-audio-preview-12-2025`.
- **Persona Persistence**: The agent must maintain the "Nina" persona (Manglish-speaking, helpful, flirty) throughout the session.
- **Interruptible Audio**: Users must be able to interrupt the agent mid-sentence for a natural flow.

### 3.2 Dynamic Menu & Order Management
- **Standard Menu**: A list of "Colek" items with real-time price calculation.
- **Function Calling**: The agent must be able to programmatically add/remove items and trigger UI state changes (e.g., revealing secret menus).
- **Secret Menu**: A "Glitch Mode" triggered by specific voice prompts that swaps the menu board to advanced technical items.

### 3.3 Visual Feedback System
- **CRT Display**: A real-time updating order list styled as a vintage CRT monitor.
- **Flying Ingredients**: Real-time SVG generation of ingredients mentioned in the conversation to provide visual "delight."
- **Order Preview**: AI-generated image of the final order shown at the "Pickup Window."

## 4. Non-Functional Requirements
- **Mobile-First Design**: Fully responsive UI that adapts to mobile, tablet, and desktop.
- **Low Latency**: Audio processing must feel instantaneous to maintain immersion.
- **Robustness**: Graceful handling of microphone permissions and API connection drops.

## 5. Success Metrics
- Average session length (Interaction depth).
- Successful completion rate of the "Order -> Pickup" flow.
- "Secret Menu" discovery rate.