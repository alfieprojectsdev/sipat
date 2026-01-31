### Appendix A: Data Export & Integrity Module

**Context:** Designed specifically for the "Data Processing" persona (Marq). The goal is to eliminate post-survey data cleaning by enforcing strict type safety at the point of entry and providing a deterministic export format.

---

### 1. Architecture Decision Record (ADR)

**ADR-003: Deterministic, Schema-Derived Data Flattening**

* **Status:** Proposed
* **Context:** Traditional survey tools often export nested JSON or XML, requiring significant "munging" (parsing/cleaning) to convert into tabular formats (CSV/Excel/SPSS) suitable for analysis. Questions skipped by logic often appear as confusing nulls or missing keys.
* **Decision:** We will implement a **Deterministic Flattener** that generates the export structure *directly* from the `survey_definition.json` file, not from the responses.
* **Rule 1:** Every "Leaf Node" (question) in the schema becomes a column header, regardless of whether it was answered.
* **Rule 2:** Skipped questions are explicitly marked (e.g., `SKIPPED_LOGIC`) rather than left as generic `null` values, allowing analysts to distinguish between "missing data" and "irrelevant data."


* **Consequences:**
* *Positive:* Zero-config exports. If the survey exists, the export format is guaranteed.
* *Positive:* Type enforcement. A `number` field in the schema will *always* export as a number, rejecting dirty input at the UI layer.
* *Negative:* Changing the schema mid-survey (e.g., adding a question) requires a versioning strategy for the export columns (e.g., `v1_question`, `v2_question`).



---

### 2. Technical Specification

**Feature:** The "Clean-Stream" Export Engine

**2.1 Functional Requirements**

1. **Real-Time Preview:** The Admin Dashboard must show a live data grid of incoming responses.
2. **Format Agnostic:** The engine must support export to CSV (for Excel), JSON-L (for BigQuery/Postgres), and .SAV (SPSS) structure.
3. **Metadata Injection:** Automatically append `interviewer_id`, `timestamp_start`, `timestamp_end`, and `gps_coordinates` (if permitted) to every row.

**2.2 Data Transformation Logic (The "Flattener")**
The system uses the Survey Graph to build a linear header map.

* **Input:** `SurveyDefinition` (The Graph) + `ResponseSession` (The Path Taken).
* **Process:**
1. Traverse the entire Survey Graph to generate a master list of `column_headers` (e.g., `["q1_name", "q2_employed", "q3_industry", ...]`).
2. For each User Session:
* Create an empty row matching the master list.
* Fill in values where `answer` exists.
* If a node was never visited (based on the `path_history` log), mark as `[N/A]`.




* **Output:** A perfectly rectangular dataset ready for SQL import or Pandas DataFrame loading.

**2.3 UI Component: The Data Grid**

* **Library:** **TanStack Table** (Headless UI) + **Ag-Grid Community** (for large dataset virtualization).
* **Feature:** "Validation Highlights". If a specific cell looks like an outlier (e.g., Age > 100), highlight it in red immediately in the preview for the Data Processor to flag.


<!-- ### 3. Implementation Prompt for Antigravity

Copy this block to instruct your AI to build the backend export utility:

```markdown
@feature-export
Project: FieldLogic (Data Processing Module)
Context: We need a utility to convert the hierarchical survey responses into a flat, tabular structure for analysis.

**Task: Build the `SurveyFlattener` Class**

1.  **Input:** Takes the `SurveyDefinition` JSON schema.
2.  **Method `generateHeaderMap()`:**
    * Traverses all nodes in the schema.
    * Returns an ordered array of column IDs (e.g., `['meta_uuid', 'q1', 'q2', 'q3', 'meta_end_time']`).
3.  **Method `flattenResponse(session: UserSession)`:**
    * Iterates through the header map.
    * Look up the answer in the session.
    * **Logic Check:** Check the `session.visited_nodes` array.
        * If the node was visited but has no answer -> Return `NULL` (Missing Data).
        * If the node was NOT visited (skipped) -> Return `Symbol('SKIPPED')` or string `"N/A"`.
        * If answered -> Return the value (casted to correct type).
4.  **Export:**
    * Create a function `toCSV(sessions[])` that uses the methods above to generate a string.
    * Ensure proper escaping of commas/newlines in text fields.

**Goal:** The output CSV must be perfectly clean. No jagged rows.

``` -->