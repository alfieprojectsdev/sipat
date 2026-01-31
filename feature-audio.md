### Appendix B: Audio Blob Handling & "Zero-Cost" Storage Strategy

**Context:** The client currently pays a subscription primarily for storage hosting of voice files that they eventually delete or move. The goal is to eliminate this recurring cost by implementing a "Local-First, Flush-to-Owner" architecture.

### 1. Architecture Decision Record (ADR)

**ADR-004: Decoupled Media Storage (The "Sidecar" Strategy)**

* **Status:** Proposed
* **Context:** Hosting audio files on the app server creates a scaling cost (bandwidth + volume) that forces a subscription model. The client only needs the audio for verification, not for permanent app hosting.
* **Decision:** We will treat Audio Data differently from Text Data.
* **Text (Survey Answers):** Syncs to NeonDB (PostgreSQL). It is cheap, searchable, and permanent.
* **Audio (Voice Recs):** Stored locally on the tablet (IndexedDB) during the interview. During sync, these are NOT saved to the app database. Instead, they are "flushed" to an external, client-owned destination (Google Drive bucket or Local ZIP Download).


* **Consequences:**
* *Positive:* Server costs remain near $0 (Free Tier limits for text are huge).
* *Positive:* Privacy. The sensitive voice data lives on the client's storage, not ours.
* *Negative:* Syncing takes longer as it involves uploading/moving heavy files.
* *Mitigation:* Use highly compressed `.webm` (Opus) format to minimize file size.



---

### 2. Technical Specification

**Feature:** The "Whisper" Recorder & Sync

**2.1 Recording Spec (MediaRecorder API)**

* **Codec:** `audio/webm;codecs=opus` (Standard for web, extremely high compression).
* **Bitrate:** 16kbps - 32kbps (Voice quality only; music quality not needed).
* **File Size Estimate:** ~200KB per minute (vs. 10MB for WAV).
* **Naming Convention:** `{survey_id}_{question_id}_{timestamp}.webm` (Ensures easy manual sorting if the DB link is lost).

**2.2 Storage Lifecycle**

1. **Capture:** User taps "Record". Browser captures stream.
2. **Local Save:** On stop, the Blob is saved to **IndexedDB** (via `idb-keyval` or `Dexie`) linked to the current Session ID.
3. **Sync Trigger:** When the device reaches Wi-Fi (Town Proper):
* **Path A (The "Google Drive" Integration):** App uses the Google Drive API (Client's Credentials) to upload the file to a specific folder: `/FieldSurveys_2026/{InterviewerName}/`.
* **Path B (The "Manual Dump" - Fallback):** App bundles all unsynced audio into a `.zip` file and prompts the user to "Save to Device/USB OTG."



**2.3 Database Linkage**
The Postgres database (`responses` table) only stores the **metadata**, not the blob.

```sql
-- What is stored in NeonDB
{
  "q_id": "q10_comments",
  "type": "audio",
  "duration_sec": 45,
  "filename": "survey_123_q10_20260129.webm",
  "storage_path": "gdrive://folder_id/file_id" -- Updated after sync
}

```

<!-- ### 3. Implementation Prompt for Antigravity

Copy this to instructions for the Media Module:

```markdown
@feature-audio
Project: FieldLogic (Media Module)
Context: We need a low-cost voice recording implementation that avoids expensive server hosting.

**Task: Build the `AudioRecorder` Component & Sync Logic**

1.  **Recorder Component (UI):**
    * Simple Mic Button (Toggle Record/Stop).
    * Visualizer (Canvas waveform) to confirm input is detected.
    * Output: `Blob` (audio/webm).

2.  **Storage Manager (Local):**
    * Save blobs to IndexedDB using `idb` library.
    * Store key: `audio_${sessionId}_${nodeId}`.

3.  **Sync Service (The "Sidecar"):**
    * Create a function `uploadAudioToDrive(blob, filename, token)`.
    * **Logic:**
        * Iterate through unsynced audio blobs.
        * Upload to Client's Google Drive (or compatible S3 bucket like Cloudflare R2).
        * On success:
            * Get the `fileUrl` / `fileId`.
            * Update the `ResponseSession` JSON with this reference.
            * Delete the Blob from IndexedDB to free up tablet space.
            * Mark text response as "synced".

**Constraint:** The app database (Postgres) must NEVER store binary data. Only text references.

``` -->
