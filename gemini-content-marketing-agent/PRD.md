
# PRD.md

## 1. Document Metadata
- **Product Name:** Gemini Content Marketing Agent
- **PRD Version:** 1.0.0
- **Author:** AI Senior Product Lead
- **Status:** Approved
- **Last Updated Date:** 2024-05-24

## 2. Problem Statement
Content marketing teams are overwhelmed by the multi-modal nature of modern branding. Strategy requires deep text analysis, creative requires video generation, and real-time collaboration requires low-latency voice interaction. Existing tools are fragmented, expensive, and lack unified intelligence across media types (Text, Audio, Video).

The cost of not solving this is missed market trends, slow campaign cycles, and high overhead for creative production.

## 3. Goals & Success Metrics
### Primary Goals
- Provide a "Command Center" for marketing strategists that integrates LLM reasoning, video generation, and real-time voice brainstorming.
- Reduce content ideation-to-draft time by 70%.
- Empower non-technical marketers to generate professional-grade video assets and audits.

### Success Metrics (KPIs)
- **User Engagement:** Average session duration > 15 minutes.
- **Conversion:** % of tool usage ending in a successful "Export" or "Generate" action.
- **Model Efficiency:** Average response latency < 3s for Flash models and < 10s for Pro models (excluding video generation).
- **Adoption:** 30% of users utilize more than 3 distinct tools per session.

## 4. Non-Goals (Out of Scope)
- Direct social media publishing (API integrations for Twitter/LinkedIn are for future phases).
- Team collaboration/multi-player editing.
- Professional video editing suite (no timeline/layer manipulation).
- Long-term asset storage/database management.

## 5. User Personas
### A. Sarah - Content Strategist
- **Role:** Leads brand voice and campaign planning.
- **Goals:** Rapidly prototype 3-month content calendars.
- **Pain Points:** Writer's block; disjointed tools.
- **Tech Capability:** High (familiar with AI prompts).

### B. Mike - Solo Entrepreneur
- **Role:** Handles marketing, sales, and product.
- **Goals:** Create high-quality video ads without hiring a studio.
- **Pain Points:** High cost of video production; no time for deep research.
- **Tech Capability:** Moderate.

## 6. User Journeys (End-to-End)
### Happy Path: Campaign Creation
1. User enters **Complex Query** to develop a 6-month product launch strategy.
2. User uses **Quick Tools** to generate 5 social media headlines for the first week.
3. User enters **Video Generation** to create a 720p promotional teaser based on the generated themes.
4. User validates the video vibe using **Live Conversation** (Voice) to brainstorm refinements.

### Failure Path: API Limitations
1. User attempts Video Generation without a paid API key.
2. System triggers **ApiKeySelector** dialog.
3. User selects key; system resumes operation.

## 7. Functional Requirements
| ID | Actor | Requirement | Trigger | Expected Outcome |
|----|-------|-------------|---------|------------------|
| FR-1 | User | Real-time Chat | Message input | Streaming text response from Gemini 3 Flash. |
| FR-2 | User | Deep Reasoning | Complex prompt input | Long-form output with Thinking tokens from Gemini 3 Pro. |
| FR-3 | User | Video Gen | Text prompt | MP4 video generation via Veo 3.1 Fast. |
| FR-4 | User | Live Voice | Microphone activation | Full-duplex audio conversation with Zephyr. |
| FR-5 | Agent | Video Analysis | Video upload | Content audit and timestamped insights. |
| FR-6 | User | Quick Collateral | Category selection | Instant marketing micro-copy (headlines/social). |

## 8. Non-Functional Requirements
- **Performance:** UI must remain responsive during 10s+ video generation polls.
- **Availability:** Offline-first UI components for better reliability.
- **Security:** API keys must be handled via environment variables and standard secure dialogs; no hardcoding.
- **Scalability:** Front-end must handle multiple large base64 video/image assets in memory without crashing.

## 9. Agent & Automation Requirements
- **Automation:** The Agent automatically extracts frames (16 frames) from uploaded videos for analysis.
- **Autonomy:** The Live Agent (Zephyr) must handle turn-taking autonomously without manual "talk" buttons.
- **Constraint:** Video generation is restricted to 720p for the current preview phase.

## 10. Permissions & Security Requirements
- **Microphone Access:** MUST request browser permissions before Live Conversation.
- **API Billing:** MUST warn users and require a Paid Tier Key for Veo/Imagen models.
- **Data Privacy:** User data (videos/prompts) are processed in-session and not persisted to a local DB.

## 11. Error Handling & Edge Cases
- **Quota Exceeded:** Show clear "Rate Limit" message with a timer.
- **Invalid Key:** Trigger the key selection dialog if "Requested entity not found" error occurs.
- **Empty Video:** Prevent analysis if zero bytes detected or frame extraction fails.

## 12. Analytics & Observability
- **Usage Tracking:** Log tool-switch events to identify the most popular modules.
- **Error Tracking:** Console logs for all API failure responses including HTTP status codes.

## 13. Dependencies & Integrations
- **SDK:** `@google/genai` (latest stable).
- **Styling:** Tailwind CSS.
- **Models:** Gemini 3 Pro, Gemini 3 Flash, Veo 3.1 Fast, Gemini TTS.

## 14. Risks & Mitigations
- **Risk:** High latency in Video Generation. **Mitigation:** Implement specific reassuring loading messages updated every 3s.
- **Risk:** Browser memory exhaustion. **Mitigation:** Revoke Object URLs immediately after use.

## 15. Open Questions & Assumptions
- **ASSUMPTION:** Users have access to a GCP project with the Gemini/Veo APIs enabled.
- **ASSUMPTION:** High-speed internet is available for multi-part base64 streaming.

## 16. Acceptance Criteria
- [ ] System successfully initializes with `process.env.API_KEY`.
- [ ] Live Conversation session maintains < 500ms audio response latency.
- [ ] Video Generation successfully downloads and plays an MP4 file.
- [ ] Sidebar navigation transitions between tools without loss of state (where possible).
