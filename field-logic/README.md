# FieldLogic (Field Survey Tool)

FieldLogic is a tablet-first, offline-capable web application designed for complex field data gathering. It relies on a **Schema-Driven Architecture** where the UI and Logic are generated entirely from a JSON definition.

## 🚀 Features

### 1. Core Logic Engine
- **Interpreter Pattern:** The `SurveyEngine` state machine navigates the survey based on the `survey_definition.json`.
- **Conditional Routing:** Supports complex branching logic (e.g., *If "Unemployed", skip "Industry"*).
- **Strict Typing:** Powered by a rigorous TypeScript schema (`src/types/schema.ts`).

### 2. Offline-First Data Layer
- **Dexie.js (IndexedDB):** All data is stored locally first.
- **Separate Stores:**
    - `responses`: Text-based answers.
    - `blobs`: Heavy media files (Audio).

### 3. Integrated Modules
- **🎙️ Audio Recorder (Sidecar):** Records `audio/webm;codecs=opus` blobs directly to IndexedDB. Includes a "Flush to Cloud" sync stub.
- **📉 Data Export:** Deterministic `SurveyFlattener` converts hierarchical JSON sessions into clean CSVs for analysis.
- **📝 Transcription Review:** Dashboard with **Deep Linking** to VLC Media Player (`fieldlogic://`) for precise audio review.

## 🛠️ Project Structure

```
field-logic/
├── src/
│   ├── components/    # UI (AudioRecorder, SurveyWizard, TranscriptViewer)
│   ├── data/          # JSON Survey Definitions
│   ├── lib/
│   │   ├── SurveyEngine.ts  # Core State Machine
│   │   ├── db.ts            # Dexie.js Database
│   │   ├── flattener.ts     # CSV Export Logic
│   │   └── sync.ts          # Cloud Sync Logic
│   ├── types/         # Strict Schema Definitions
│   └── pages/         # Astro Routes
├── launcher.py        # VLC Bridge Script (Python)
└── setup_vlc_link.reg # Windows Registry keys for VLC
```

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)

### Installation
```bash
cd field-logic
npm install
```

### Development
Start the local development server:
```bash
npm run dev
```
Visit http://localhost:4321 to survey.

### Testing
Run the comprehensive test suite (Engine + Flattener):
```bash
npm test
```

## 🔌 Integrations

### Setting up VLC Deep Linking (Windows)
To enable the "Open in VLC" feature from the Transcription Dashboard:
1.  Edit `launcher.py` and ensure `VLC_PATH` matches your VLC installation.
2.  Double-click `setup_vlc_link.reg` to register the `fieldlogic://` protocol.
3.  Place your survey media files in `C:\Data\surveys` (or update `MEDIA_DIR` in the script).

## 📄 License
Private / Proprietary
