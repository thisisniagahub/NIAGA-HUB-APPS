# Product Requirements Document (PRD): NIAGA-HUB

## 1. Document Metadata
- **Product Name:** NIAGA-HUB: Bring Any Idea to Life
- **PRD Version:** 1.0.0
- **Author:** AI Senior Product Manager
- **Status:** Draft
- **Last Updated:** 2024-05-24

## 2. Problem Statement
The gap between a creative spark (a sketch on a napkin, a whiteboard diagram, or a physical layout) and a functional digital prototype is currently too wide. Non-technical users cannot bridge this gap without hiring developers, and even developers spend hours on boilerplate code for simple interactive ideas. Existing "AI-to-Code" solutions often focus on rigid UI components rather than the "soul" of the artifact (e.g., turning a board game photo into a playable game).

## 3. Goals & Success Metrics
- **Primary Goal:** Enable users to transform any visual artifact into a fully functional, interactive, single-page web application within seconds.
- **Success Metrics:**
    - **Conversion Success Rate:** >90% of valid image/PDF uploads resulting in a renderable HTML artifact.
    - **Time to Interactive (TTI):** Average generation time under 25 seconds.
    - **User Engagement:** Average of 3+ "Restores" or "Exports" per user session.
    - **Persistence:** 100% of generated artifacts saved correctly to browser local storage.

## 4. Non-Goals (Out of Scope)
- Generating multi-page applications or complex backend architectures.
- Hosting the generated HTML on a permanent public URL (out of local session).
- Collaborative real-time editing of the generated code (View-only code mode).
- Integration with external databases or API authentication flows.

## 5. User Personas
- **The Rapid Prototyper (Alex):** A founder who sketches UI ideas on paper and wants to see them "move" instantly to pitch a concept.
- **The Educator (Sarah):** A teacher who draws a diagram of a biological cell and wants an interactive "hover-to-label" tool for students.
- **The Game Designer (Leo):** A hobbyist who creates board game layouts and wants to test basic mechanics (dice rolls, piece movement) digitally.
- **The Organized Hobbyist (Mia):** Someone who takes a photo of a messy desk and wants a "Clean Up" game or a digital inventory tool.

## 6. User Journeys (End-to-End)
### 6.1. The Happy Path (Discovery to Functional App)
1. User lands on the landing page and sees the "Bring anything to life" hero.
2. User drags a hand-drawn sketch of a calculator into the Input Area.
3. System triggers Gemini 3 Pro with specific instructions to gamify or functionalize the image.
4. User enters the "Live Preview" modal, seeing a loading state with technical progress steps.
5. The artifact renders. User clicks "Split View" to compare the original sketch with the interactive app.
6. User tests the calculator, then copies the code to their clipboard.

### 6.2. The Failure Path (Unsupported File)
1. User attempts to upload a `.txt` file.
2. System prevents the upload and triggers an alert notification.
3. User corrects the action by uploading a `.png` version of the same data.

### 6.3. The Retention Path (History)
1. User returns to the site after 2 days.
2. User scrolls to the "Archive" section.
3. User selects a previously generated "Chess Board" artifact.
4. Artifact opens instantly in the Live Preview.

## 7. Functional Requirements
| ID | Requirement | Actor | Trigger | Expected Outcome |
|:---|:---|:---|:---|:---|
| **FR-1** | File Upload Support | User | Drag-and-drop or File Picker | Support for Image (PNG, JPG, WebP) and PDF. |
| **FR-2** | AI Artifact Generation | System | Successful file upload | Calls Gemini 3 Pro with System Instructions to return raw HTML/CSS/JS. |
| **FR-3** | Live Preview Modal | System | Generation completion | Displays the app in a sandboxed iframe. |
| **FR-4** | Split View Mode | User | Toggle "View Columns" icon | Displays original input source (Image/PDF) side-by-side with the generated app. |
| **FR-5** | Code Viewer | User | Toggle "CommandLine" icon | Overlays the raw source code of the generated artifact. |
| **FR-6** | Copy to Clipboard | User | Click "Clipboard" icon | Copies the `creation.html` string to the user's OS clipboard with visual feedback. |
| **FR-7** | Artifact Export | User | Click "Download" icon | Downloads a `.json` file containing name, HTML, and base64 image data. |
| **FR-8** | Artifact Import | User | Click "Upload previous artifact" | Reconstructs a session from a valid JSON artifact file. |
| **FR-9** | Theme Toggle | User | Click Sun/Moon icon | Injects `dark` class into the sandboxed iframe to toggle UI theme. |

## 8. Non-Functional Requirements
- **Performance:** Modal transitions MUST use hardware-accelerated CSS (transform/opacity) for 60fps smoothness.
- **Availability:** Application MUST work offline once loaded (excluding AI generation).
- **Responsiveness:** Live Preview MUST adapt to mobile (vertical stack) and desktop (horizontal split).
- **Security:** Generated HTML MUST be rendered within a `sandbox` iframe to prevent XSS on the host domain.
- **Persistence:** User history MUST be stored in `localStorage` up to 5MB (browser limit).

## 9. Agent & Automation Requirements
- **Model Selection:** MUST use `gemini-3-pro-preview` for high-reasoning code generation tasks.
- **Vision Extraction:** The agent MUST extract functional logic (e.g., "this is a button that adds items") rather than just visual styles.
- **Self-Correction:** The prompt processing logic MUST automatically strip Markdown fences (```html) from the AI response.

## 10. Permissions & Security Requirements
- **Iframe Sandboxing:** MUST include `allow-scripts`, `allow-forms`, `allow-popups`, `allow-modals`, and `allow-same-origin`.
- **API Safety:** API Key MUST be accessed via `process.env.API_KEY` and never hardcoded.
- **Input Validation:** Files larger than 10MB SHOULD be rejected to prevent browser performance degradation.

## 11. Error Handling & Edge Cases
- **API Error (4xx/5xx):** System MUST display a user-friendly alert and allow the user to retry the upload.
- **Empty Response:** If the AI returns no code, the system MUST show an "Incomplete Generation" error state.
- **PDF Rendering Failure:** If PDF.js fails to render the preview, a fallback icon and error message MUST be shown in the reference panel.

## 12. Analytics & Observability
- **Event Tracking:** Track `generate_start`, `generate_success`, `generate_failure`.
- **Usage Metrics:** Count of `code_copied`, `artifact_downloaded`, `split_view_toggled`.
- **Error Logging:** Log generation errors and browser console errors to internal state for debugging.

## 13. Dependencies & Integrations
- **Google Gemini API:** Core LLM for image-to-code generation.
- **PDF.js:** Required for rendering PDF previews in the Split View reference panel.
- **Tailwind CSS:** Used for both host application and recommended for generated artifacts.
- **Heroicons:** Standard icon set for UI consistency.

## 14. Risks & Mitigations
| Risk | Impact | Mitigation |
|:---|:---|:---|
| AI Hallucination | High | Strict system instructions to use Emojis/SVGs instead of external URLs. |
| API Rate Limiting | Medium | Implement retry logic with exponential backoff (planned for v1.1). |
| Data Privacy | Medium | Inform users that data is processed by Google Gemini; do not store images on own servers. |

## 15. Open Questions & Assumptions
- **ASSUMPTION:** Users prefer a "gamified" outcome for mundane objects rather than a literal description.
- **ASSUMPTION:** `gemini-3-pro-preview` is available and has high rate limits for the target user base.
- **OPEN QUESTION:** Should we support voice prompts alongside image uploads in v2.0?

## 16. Acceptance Criteria
- **GIVEN** a hand-drawn sketch of a "Todo List" 
- **WHEN** the user uploads the image 
- **THEN** the system must render an interactive Todo List where items can be added and checked off within 30 seconds.
- **AND** the user must be able to view the source code of that app within the same interface.
- **AND** the original sketch must be visible in a side-by-side comparison mode.