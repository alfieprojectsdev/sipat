### Technical Specification: Project "FieldLogic" (Working Title)

**Version:** 1.0 (Draft)
**Context:** Creating a superior alternative to a UK-based, subscription-model mobile survey tool currently used for field data gathering.
**Primary Objective:** Deliver a tablet-optimized, offline-capable web application that handles complex conditional survey logic ("skipping") for field interviewers.

---

### 1. Functional Requirements

Based on the conversation cues, the system must address the following core needs:

* **Platform Target:** Tablet-first Mobile Web Application (PWA).
* *Source:* "pang data entry sa field interview. pang tablet" / "parang mobile-based survey tool"


* **Core Logic Engine:** Dynamic rendering of questions based on user input (Branching Logic).
* *Source:* "na kaya mag logic and skipping"


* **Data Lifecycle:** Seamless pipeline from field entry to tabular data export.
* *Source:* "mula data gather, entry, tables. minsan may analysis"


* **Cost/Licensing Model:** One-time build or low-maintenance hosting to beat the current "subscription based" competitor.
* **Resilience:** While not explicitly stated, "field interview" implies the need for **Offline-First** capability (store data locally, sync when online).

### 2. Architecture & Tech Stack

To ensure the app is "better" (faster, cheaper, more flexible) than the legacy subscription tool, we will prioritize performance and a schema-driven architecture.

**Frontend (The Field Interface)**

* **Framework:** **Astro** (Server-Side Rendering + Client Islands).
* *Reasoning:* High performance on lower-end tablets. We can use React/Preact "islands" specifically for the complex form interactions while keeping the shell lightweight.


* **State Management:** **Nano Stores** or **XState**.
* *Reasoning:* XState is critical here to visualize and manage the "logic and skipping" (state machines) effectively.


* **Offline Storage:** **IndexedDB** (via a wrapper like Dexie.js).
* *Reasoning:* Essential for caching survey definitions and storing responses before sync.



**Backend (The Data Hub)**

* **Database:** **PostgreSQL** (e.g., NeonDB).
* *Reasoning:* Reliable relational data storage is needed for structured survey results. JSONB columns can store variable survey schemas.


* **API:** Serverless Functions (via Astro/Vercel or Cloudflare Workers).
* *Reasoning:* Low cost; only spins up when syncing data.



**Data Model (Simplified)**

* `SurveyDefinition`: Stores the questions and the logic graph (JSON).
* `ResponseSession`: Stores the actual answers linked to a specific field interviewer and timestamp.

---

### 3. Feature Breakdown: The "Logic & Skipping" Engine

The primary failure point of previous attempts (and the key feature of the competitor) is the logic system.

**Requirement:**
If Question A = "Yes", show Question B. If "No", skip to Question C.

**Implementation Spec:**
Instead of hard-coding forms, the app will ingest a **JSON Schema** definition.

* **Node:** A question ID.
* **Edge:** A condition (e.g., `answer == 'yes'`).
* **Next:** The ID of the target question.

**Example JSON Structure:**

```json
{
  "id": "q1_employment",
  "text": "Are you currently employed?",
  "type": "boolean",
  "logic": {
    "true": "q2_industry_type",
    "false": "q3_seeking_work"
  }
}

```

---

### 4. Architecture Decision Record (ADR)

**ADR-001: Schema-Driven Form Rendering vs. Hardcoded Forms**

* **Status:** Proposed
* **Context:** The client requires "logic and skipping." Field surveys change frequently. Hardcoding `if/else` statements for every new survey version is unmaintainable and prone to "spaghetti code."
* **Decision:** We will implement a **Schema-Driven Rendering Engine**. The UI will be a dumb component that reads a JSON file (the schema) and renders the appropriate input fields and navigation buttons dynamically.
* **Consequences:**
* *Positive:* New surveys can be deployed by simply uploading a new JSON file without touching the codebase.
* *Positive:* Logic can be visualized as a flowchart for the client to approve before implementation.
* *Negative:* Initial development complexity is higher (building the engine vs. building a form).
* *Mitigation:* Use libraries like `react-hook-form` combined with a custom schema parser.



**ADR-002: Offline-First PWA vs. Native Mobile App**

* **Status:** Proposed
* **Context:** The device target is "tablet." Using a native app requires App Store approval and updates are slow. The competitor is "mobile-based" (likely web or hybrid).
* **Decision:** Build as a **Progressive Web App (PWA)** with a "Network-First, Fallback to Cache" strategy.
* **Consequences:**
* *Positive:* "Installable" on tablets via browser. Zero app store friction. Updates are instant when the device connects to Wi-Fi.
* *Positive:* Cross-platform (works on iPad, Android, and laptops).
* *Negative:* Persistent storage management (IndexedDB) requires careful handling to prevent data loss if the browser cache is cleared.