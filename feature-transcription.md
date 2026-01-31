### Appendix C: Automated Transcription & Playback Interface

**Context:** Leveraging the client's local hardware (GPU) to convert "Listen time" into "Read time." Includes a bridge to external media players (VLC) for advanced playback control.

### 1. Architecture Decision Record (ADR)

**ADR-005: Time-Indexed Transcription with Deep Linking**

* **Status:** Proposed
* **Context:** Validating audio data is the most time-consuming part of Data Processing (1:1 ratio). We need to convert this to a text-searchable format with instant "Jump-to-Audio" capabilities.
* **Decision:**
* Use **OpenAI Whisper** (Local or API) to generate word-level timestamps.
* Store transcripts as structured JSON, not flat text.
* Implement a **Dual-Playback Strategy**:
1. **Primary (Quick Skim):** HTML5 Audio Player embedded in the dashboard for instant checks.
2. **Secondary (Deep Dive):** A custom Protocol Handler to launch **VLC Media Player** at specific timestamps for clearer audio filtering/EQ.




* **Consequences:**
* *Positive:* Reduces review time by ~80% (Reading vs. Listening).
* *Positive:* Precise data validation (click a suspicious word -> hear exactly what was said).



---

### 2. Technical Specification

**Feature:** The "Karaoke" Validator

**2.1 Data Structure (`transcript.json`)**
The pipeline outputs a JSON map linking text to seconds.

```json
{
  "meta": {
    "file": "interview_001.webm",
    "duration": 540,
    "engine": "whisper-large-v3"
  },
  "segments": [
    {
      "start": 12.5,
      "end": 15.0,
      "text": "Opo, walang trabaho si mister.",
      "confidence": 0.98
    },
    {
      "start": 15.1,
      "end": 18.2,
      "text": "Naghahanap siya ng [unintelligible] sa bayan.",
      "confidence": 0.45,  // <--- Flag for review (Low Confidence)
      "flagged": true
    }
  ]
}

```

**2.2 VLC Integration (The "Bridge" Script)**
To allow the web dashboard to control the desktop VLC app:

1. **The Registry Key (Windows):** A `.reg` file registers the `fieldlogic` URI scheme.
```text
HKEY_CLASSES_ROOT\fieldlogic\shell\open\command
Default = "python.exe C:\FieldLogic\launcher.py \"%1\""

```


2. **The Launcher Script (`launcher.py`):**
Parses the URL `fieldlogic://open?file=X&t=Y` and executes the shell command:
```bash
vlc "C:\Data\surveys\X" --start-time=Y

```


3. **The UI Implementation:**
The timestamp link in the HTML dashboard simply looks like:
```html
<a href="fieldlogic://open?file=interview_01.webm&t=15.1">
   [00:15]
</a>

```

<!-- ### 3. Implementation Prompt for Antigravity

Copy this to generate the Review Module:

```markdown
@feature-transcription
Project: FieldLogic (Review Dashboard)
Context: Display transcriptions with clickable timestamps that control media playback.

**Task: Build the Transcription Viewer**

1.  **Python Script (The Processor):**
    * Input: Folder of `.webm` files.
    * Process: Iterate and run `whisper` model.
    * Output: `filename.json` (using the structure defined in Spec 2.1).

2.  **HTML Dashboard Component:**
    * Load `transcript.json`.
    * Render text segments.
    * **Styling:**
        * Highlight segments with `confidence < 0.6` in Yellow (Needs Review).
        * On Hover: Show a "Play" icon.
    * **Interactions:**
        * **Left Click:** Seek the embedded `<audio>` tag to `segment.start`.
        * **Right Click / Alt+Click:** Trigger the VLC Deep Link (`fieldlogic://...`).

3.  **VLC Helper:**
    * Generate a `setup_vlc_link.reg` file that the user can double-click to register the custom protocol handler on Windows.

``` -->
