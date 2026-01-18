# PRD: InfoGenius Vision

**Version:** 1.0.0  
**Author:** AI Agent / Senior Product Lead  
**Status:** Approved  
**Last Updated:** 2024-05-24  
**Project Repository:** Internal

## Document History
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2024-05-24 | Initial production-grade draft based on codebase analysis. | AI Agent |

---

## 2. PROBLEM STATEMENT

**Core User Pain:**  
Users (students, professionals, and investors) struggle to quickly transform complex topics into accurate, visually engaging infographics. Manual creation is time-consuming, and existing AI generators often lack factual grounding or professional aesthetic consistency.

**Why Existing Solutions Fail:**  
Standard AI image generators often hallucinate technical details or produce generic, unlabelled visuals that lack the depth required for educational or professional contexts. They do not typically integrate real-time search data into the creative process.

**Current Workarounds & Their Pain Points:**  
- **Manual Design (Canva/Adobe):** High effort, requires design skill, slow.
- **Search & Assemble:** Users find facts on Google and manually try to find/create matching icons.
- **Generic AI Art:** Lacks textual accuracy and specific audience tailoring (e.g., an infographic for an investor vs. a student).

**Cost of Not Solving:**
- **User Impact:** Misinformation in presentations, hours wasted on design instead of analysis.
- **Business Impact:** Lower engagement in reports, increased turnaround time for visual content.

---

## 3. GOALS & SUCCESS METRICS

### Primary Goals

**Business Goals:**
1. Establish InfoGenius as the premier "Visual Knowledge Engine" for verified infographic generation.
2. Maintain high accessibility by utilizing Gemini 2.5 Flash series models for all user tiers.

**User Goals:**
1. Generate a tailored, factual infographic in under 45 seconds.
2. Refine visuals through natural language editing without restarting the process.

### Success Metrics (KPIs)

| Metric | Baseline | 30 Days | 90 Days | Measurement Method |
|--------|----------|---------|---------|-------------------|
| Generation Success Rate | 85% | 95% | 98% | API success logs |
| Average Time to Image | 40s | 30s | 25s | Performance metrics |
| Edit Retention | 20% | 40% | 50% | Count of secondary prompts |

---

## 4. NON-GOALS (OUT OF SCOPE)

### Explicitly Not Included (Never)
1. **Video Generation:** This tool is strictly for static 2D infographics and diagrams.
2. **Social Media Network:** No built-in feed or user profiles; it is a utility tool.

### Explicitly Deferred (Later Versions)
1. **Custom Font Uploads:** Standard fonts are used for now to ensure model consistency.
2. **SVG Export:** Currently limited to high-resolution PNG/JPEG exports.

---

## 5. USER PERSONAS

### PRIMARY PERSONA 1: Student/Academic (Sarah)

**Demographics:**
- **Age Range:** 16-25
- **Job Title:** High School/College Student
- **Tech Savviness:** High
- **Device Usage:** Mostly Desktop (70%) during study sessions.

**Primary Goals:**
1. Visualize complex scientific concepts (e.g., Photosynthesis) for school projects.
2. Ensure facts are grounded in academic search results.

**Success Scenario:**  
Sarah enters "Mitochondria" into InfoGenius, selects "College" and "Technical Blueprint", and receives a high-quality diagram with factual citations in 30 seconds.

---

### PRIMARY PERSONA 2: Corporate Investor (Michael)

**Demographics:**
- **Age Range:** 35-55
- **Job Title:** Venture Capitalist / Financial Analyst
- **Tech Savviness:** Medium
- **Device Usage:** Mobile (60%) for quick briefings, Desktop (40%) for reports.

**Primary Goals:**
1. Quickly understand market trends through "Professional" visual styles.
2. Generate visuals for investment pitches that look sophisticated and data-rich.

---

## 6. USER JOURNEYS

### Journey 1: Topic Visualization

**Happy Path:**
1. **User Action:** Enters topic "Blockchain Technology" and selects "Investor" audience.
2. **System Responsibility:** Triggers `researchTopicForPrompt` using Google Search.
3. **System Responsibility:** Displays grounded facts and search results.
4. **System Responsibility:** Generates 2.5 Flash Image using structured prompt.
5. **Final State:** User downloads a professional blockchain infographic.

**Failure Path:**
- **If API Timeout:** System displays "Establishing connection..." for longer, then retries or shows a clear error message with recovery options.

---

## 7. FUNCTIONAL REQUIREMENTS

### Core Features (P0)

**FR-1: Search-Grounded Research**
- **Description:** System MUST use Google Search to verify facts before image generation.
- **Acceptance Criteria:** 
  - [ ] Extract at least 3 factual citations per request.
  - [ ] Citations MUST include Title and URL.

**FR-2: Multi-Audience Tailoring**
- **Description:** Adjust prompts based on Complexity Level (Elementary, Investor, etc.).
- **Acceptance Criteria:**
  - [ ] Different prompt prefixes for each audience type.

**FR-3: Contextual Image Editing**
- **Description:** Allow users to modify the existing image via text prompt.
- **Acceptance Criteria:**
  - [ ] Send previous image base64 + new instructions to Gemini 2.5 Flash Image.

---

## 8. NON-FUNCTIONAL REQUIREMENTS

### Performance (NFR-P)
**NFR-P1: Response Time**
- Text-based research MUST complete in < 10s.
- Image generation MUST complete in < 30s.

### Security (NFR-SEC)
**NFR-SEC1: API Key Protection**
- MUST NOT expose `process.env.API_KEY` to the client-side console or logs.
- MUST use HTTPS for all communications.

---

## 9. AGENT & AUTOMATION REQUIREMENTS

**AR-1: Research Agent (Fully Autonomous)**
- Executed by `gemini-3-flash-preview`.
- MUST use `googleSearch` tool for P0 status.

**AR-2: Design Agent (Fully Autonomous)**
- Executed by `gemini-2.5-flash-image`.
- MUST interpret complex text prompts into 1:1 aspect ratio infographics.

---

## 11. ERROR HANDLING

**ERR-IV1: Empty Input**
- System MUST block "INITIATE" button if topic is empty and show a validation toast.

**ERR-EXT1: API 429 (Rate Limit)**
- System MUST notify user that the engine is "recharging" and suggest waiting 60 seconds.

---

## 12. ANALYTICS

**Events to Track:**
- `infographic_generated`: {topic, level, style, language}
- `edit_performed`: {original_topic, edit_prompt}
- `source_clicked`: {url}

---

## 13. DEPENDENCIES

- **Google GenAI SDK:** Core processing.
- **Tailwind CSS:** UI styling.
- **Lucide React:** Iconography.
- **React 19:** Application framework.

---

## 16. ACCEPTANCE CRITERIA

**ACCEPT-PROD-1:** A user can go from the intro screen to a finished image in under 5 clicks.
**ACCEPT-PROD-2:** Images generated for "Investor" must use darker/professional palettes vs "Elementary" which uses bright colors.
**ACCEPT-PROD-3:** The app MUST be fully functional in both Light and Dark modes.