# ERP: Experience & Realistic Principles

The "Experience & Realistic Principles" document defines the logic governing the world of Abang Colek Kiosk.

## 1. Design System: "Digital Nostalgia"
The UI is built on a "Digital Nostalgia" framework, utilizing:
- **CRT Aesthetics**: Scanlines, flickers, and monospaced fonts (`VT323`).
- **Tactile Feedback**: 3D-shaded SVG buttons that respond to clicks and state changes.
- **Depth of Field**: The menu board and order box use 3D transforms (`rotateY`) to create a sense of physical space.

## 2. Business Logic (The "Order Engine")
- **Pricing Logic**: All standard "Colek" items are fixed at $15.00 to simplify the mental model for the user.
- **Combo Upgrades**: The system encourages "Combo" purchases which aggregate multiple items.
- **Secret Tier**: Pricing for the secret menu follows a "Leetspeak" or "Binary" logic (e.g., $13.37, $64.00, $128.00).

## 3. Conversational Flow
The experience is designed as a **Linear Progression with Non-Linear Interjections**:
- **Phase 1 (Greeting)**: Automated greeting via `START_CONVERSATION`.
- **Phase 2 (Configuration)**: The user adds/removes items. This is non-linear and can include ingredient visualization.
- **Phase 3 (Checkout)**: A "Processing -> Authorized" state transition mimics real-world credit card terminals.
- **Phase 4 (Fulfillment)**: The transition to the "Pickup" scene where the generated asset is served.

## 4. Audio Visualization Logic
The speaker grill glow is mapped to the `ByteFrequencyData` of the output audio stream.
- **Threshold**: Only values above a specific volume trigger the yellow glow.
- **Smoothing**: Linear interpolation prevents flickering, ensuring the "glow" feels like a warming filament.