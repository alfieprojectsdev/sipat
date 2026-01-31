# FieldLogic (Field Survey Tool)

FieldLogic is a tablet-first, offline-capable web application designed for complex field data gathering. It features a schema-driven form engine that handles conditional logic ("skipping") dynamically.

## 🚀 Features implemented
- **Schema-Driven Rendering:** Forms are generated entirely from a JSON definition (`survey_definition.json`).
- **Logic Engine:** Robust conditional routing (branching logic) verified with TDD.
- **Modern UI:** Clean, responsive interface using React and modern CSS.
- **Offline-First Architecture:** Built with Astro and React for performance.

## 🛠️ Project Structure

```
field-logic/
├── src/
│   ├── components/    # React Integration (SurveyWizard)
│   ├── data/          # JSON Survey Definitions
│   ├── lib/
│   │   ├── engine.ts  # Core Logic Engine (The "Brain")
│   │   └── types.ts   # TypeScript Interfaces
│   ├── styles/        # Global CSS
│   └── pages/         # Astro Routes
└── tests/             # Vitest Unit Tests
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
Visit http://localhost:4321 to see the survey in action.

### Testing
Run the test suite to verify the Logic Engine:
```bash
npm test
```

## 🔮 Roadmap & Planned Features

The following modules are specified for future implementation to complete the "FieldLogic" ecosystem:

### 1. Data Export & Integrity (`feature-export.md`)
- **Deterministic Flattener:** Convert hierarchical JSON responses into flat CSV/SAV files.
- **Strict Typing:** Ensure export formats match the schema definitions.

### 2. Audio "Sidecar" Storage (`feature-audio.md`)
- **Local Recording:** Capture audio blobs (Opus/WebM) directly in the browser.
- **IndexedDB Storage:** Temporary local storage to avoid data loss.
- **Zero-Cost Sync:** "Flush" audio files to Google Drive/External Storage instead of expensive app servers.

### 3. Automated Transcription (`feature-transcription.md`)
- **Whisper Integration:** Generate time-indexed transcripts from audio.
- **Deep Linking:** Control VLC Media Player from the dashboard for precise audio review.

## 📄 License
Private / Proprietary
