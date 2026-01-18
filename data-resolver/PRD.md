# Product Requirements Document: Customer Data Resolver

## 1. Document Metadata
- **Product Name:** Customer Data Resolver (AI-Powered ETL)
- **PRD Version:** 1.0.0
- **Author:** Senior Product Manager (AI Agent)
- **Status:** Approved
- **Last Updated Date:** 2024-05-22

---

## 2. Problem Statement
Enterprise customer data is often fragmented across structured databases and unstructured communication channels (chat transcripts, emails). Traditional ETL (Extract, Transform, Load) processes are:
- **Rigid:** They fail when encounter unexpected natural language formats.
- **Slow:** Batch processing creates delays in "Golden Record" updates.
- **Manual:** Merging conflicting data often requires human intervention.
The cost of not solving this is "dirty data," leading to poor customer service, failed marketing campaigns, and billing inaccuracies.

---

## 3. Goals & Success Metrics
### Primary Goals
- **Automate Resolution:** Eliminate manual data entry for contact updates provided via chat.
- **High Speed:** Achieve near real-time merging of unstructured data into structured records.
- **Traceability:** Provide clear logs and "updates applied" flags for every resolution.

### Success Metrics (KPIs)
- **Latency:** Average processing time (p90) MUST be < 2,500ms using Gemini 3 Flash.
- **Accuracy:** > 95% correctly identified field updates (tested against gold-standard manual resolutions).
- **Automation Rate:** > 90% of transactions processed without requiring manual review.

---

## 4. Non-Goals (Out of Scope)
- **Bi-directional Sync:** This version will not push data back to external CRMs (e.g., Salesforce, HubSpot).
- **Multi-turn Dialogue:** The system processes single transcript snapshots, not live active chat sessions.
- **Bulk CSV Upload:** Initial scope is limited to the real-time processing queue interface.

---

## 5. User Personas
### A. Data Operations Specialist (Primary)
- **Role:** Monitors data quality and system health.
- **Goals:** Ensure customer records are up-to-date and accurate.
- **Pain Points:** Overwhelmed by backlogs of manual "profile update" requests.
- **Capability:** High technical capability.

### B. Customer Support Lead (Secondary)
- **Role:** Reviews specific customer cases.
- **Goals:** Understand why a customer's record was changed.
- **Pain Points:** Lack of context behind automated system changes.
- **Capability:** Moderate technical capability.

---

## 6. User Journeys (End-to-End)
### Happy Path: Data Update
1. User lands on the dashboard.
2. User clicks "Generate More Data" to simulate incoming transactions.
3. User clicks "Start Resolution."
4. The system pops the top item from the queue.
5. Gemini 3 Flash analyzes the existing JSON record and the chat transcript.
6. A "Golden Record" is displayed with highlighted updates (e.g., Email changed).
7. Success logs are streamed to the terminal.

### Failure Path: API Timeout/Error
1. System attempts to resolve a record.
2. API returns a 429 or 500 error.
3. The UI marks the record as "Error" status.
4. Error details are printed in the log terminal.
5. System proceeds to the next item in the queue.

---

## 7. Functional Requirements
| ID | Actor | Trigger | Description | Expected Outcome |
|:---|:---|:---|:---|:---|
| **FR-1** | User | "Generate" Click | Create 5 synthetic data items with messy chat logs. | Queue count increases by 5. |
| **FR-2** | Agent | "Start" Click | Process the queue sequentially using Gemini 3 Flash. | Queue empties as history fills. |
| **FR-3** | Agent | Data Merge | Compare chat sentiment and intent against current DB. | JSON output includes updated fields and confidence score. |
| **FR-4** | User | UI Scroll | View historical processed transactions in a feed. | Older records remain accessible in an "opacity-dimmed" state. |
| **FR-5** | Agent | Logging | Stream internal reasoning/steps to a terminal component. | Users see "Analyzing...", "Merging...", "Resolved." |

---

## 8. Non-Functional Requirements
- **Performance:** UI MUST remain responsive during heavy LLM streaming.
- **Scalability:** The architecture SHOULD support batches of up to 100 concurrent queue items in future iterations.
- **Aesthetics:** MUST use "Material Dark" theme (bg: #121212) with high-contrast accent colors (#8AB4F8, #78D9EC).
- **Accessibility:** All interactive elements MUST have ARIA labels.

---

## 9. Agent & Automation Requirements
- **Model Selection:** MUST use `gemini-3-flash-preview` for the optimal balance of speed and reasoning.
- **Autonomous Decisioning:** The agent determines which fields to "trust" (Transcript vs. Database) based on timestamp logic.
- **Constraint:** The agent MUST NOT hallucinate customer IDs; it MUST retain the original ID from the source record.

---

## 10. Permissions & Security Requirements
- **API Key Management:** API keys MUST be handled via `process.env.API_KEY`.
- **Data Privacy:** Synthetic data is used for demonstration; in production, PII (Personally Identifiable Information) MUST be encrypted in transit.
- **Audit Log:** Every automated change MUST be logged with a unique transaction ID.

---

## 11. Error Handling & Edge Cases
- **Empty Transcript:** If the chat is empty, the agent MUST return the original record with `updates_applied: []`.
- **Conflicting Info:** If the user says "Change my email to X" then "Actually Y," the agent SHOULD prioritize the latest statement.
- **Invalid JSON:** If the LLM returns malformed JSON, the UI MUST show a graceful error state in the DataCard.

---

## 12. Analytics & Observability
- **Latency Tracking:** Capture `durationMs` for every AI call.
- **Throughput:** Count of total processed records per session.
- **Sentiment Distribution:** (Future) Track ratio of Positive/Negative sentiment in incoming logs.

---

## 13. Dependencies & Integrations
- **Core Engine:** `@google/genai` SDK.
- **Frontend Framework:** React 19.
- **Styling:** Tailwind CSS.
- **Icons:** Lucide-react.

---

## 14. Risks & Mitigations
| Risk | Impact | Mitigation Strategy |
|:---|:---|:---|
| LLM Hallucination | High | Use low temperature (0.1) and strict system instructions. |
| Rate Limiting | Medium | Implement exponential backoff in the service layer. |
| Browser Crash | Low | Use `useRef` for queue management to persist state within the session. |

---

## 15. Open Questions & Assumptions
- **ASSUMPTION:** The provided API key has sufficient quota for `gemini-3-flash-preview`.
- **ASSUMPTION:** The standard international phone format is the desired output for all regions.
- **QUESTION:** Should we allow manual overrides if the confidence score is < 0.7? (Out of scope for v1).

---

## 16. Acceptance Criteria
### Scenario: Successful Data Resolution
- **GIVEN** a customer record with email "old@test.com"
- **WHEN** the chat transcript says "Update my email to new@test.com"
- **THEN** the output JSON MUST show "email": "new@test.com"
- **AND** the `updates_applied` array MUST contain "email".
- **AND** the UI MUST display a green "SYSTEM ACTION" badge.

### Scenario: High Latency Warning
- **GIVEN** an active processing stream
- **WHEN** a resolution takes > 5000ms
- **THEN** the latency counter MUST reflect the specific duration.
