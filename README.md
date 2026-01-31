# Sipat (FieldLogic) Project

**FieldLogic** is a tablet-first, offline-capable field survey application designed for complex data gathering with conditional logic.

This repository contains the full implementation of the FieldLogic system, including the core logic engine, offline data layer, and feature modules.

## 📂 Project Structure

- **`field-logic/`**: The main application (Astro + React + Dexie.js).
- **`adr-techspec.md`**: Technical Specification and Architecture Decision Records.
- **`feature-*.md`**: Detailed specifications for Audio, Export, and Transcription modules.
- **`survey_definition.json`**: The source-of-truth JSON schema for the survey.

## 🚀 Quick Start

The main application resides in the `field-logic` directory.

```bash
cd field-logic
npm install
npm run dev
```

See [field-logic/README.md](field-logic/README.md) for detailed documentation on the architecture and features.
