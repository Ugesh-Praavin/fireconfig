# FireConfig

[![CI](https://github.com/Ugesh-Praavin/fireconfig/actions/workflows/test.yml/badge.svg)](https://github.com/Ugesh-Praavin/fireconfig/actions/workflows/test.yml)

Firebase configuration CLI for JavaScript and TypeScript projects.

FireConfig automates the repetitive parts of connecting a project to Firebase. It detects the project environment, verifies Firebase CLI authentication, lets you select or create a Firebase project and Web App, retrieves the Firebase SDK configuration, installs the Firebase SDK when needed, safely merges environment variables into `.env.local`, and generates framework-appropriate Firebase initialization in `src/firebase/config.js`.

> **Status:** v0.3.0

## Overview

Setting up Firebase in a new project typically involves several manual steps:

* Installing and configuring the Firebase CLI
* Authenticating with Firebase
* Finding or creating the correct Firebase project
* Finding or creating the corresponding Web App
* Retrieving the SDK configuration
* Installing the Firebase SDK
* Setting up environment variables (`.env.local`)
* Creating Firebase initialization code (`src/firebase/config.js`)
* Verifying that the configuration is complete

FireConfig brings these steps into a single, automated, and safe CLI workflow.

```text
Project
   │
   ├── Detect framework
   ├── Detect package manager
   ├── Check / Install Firebase CLI
   ├── Verify authentication (firebase login)
   ├── Select or create Firebase project (with consent)
   ├── Select or create Web App (with consent)
   ├── Retrieve SDK configuration
   ├── Verify / Install Firebase SDK
   ├── Safely merge environment variables into .env.local
   └── Generate framework-specific src/firebase/config.js
```

## Features

* **Project framework detection**: React, React + Vite, React + Create React App, Next.js, React Native
* **Package manager detection**: npm, pnpm, Yarn, Bun
* **Firebase CLI detection & installation**: Verifies and offers to install the official Firebase CLI
* **Firebase authentication**: Seamlessly verifies and logs in via the official Firebase CLI
* **Firebase project discovery & creation**: Discovers projects or creates one with explicit user consent
* **Firebase Web App discovery & creation**: Discovers existing apps or creates one with explicit user consent (specifically identifying the created app)
* **SDK configuration retrieval**: Fetches client-side configuration directly from Firebase
* **SDK detection & installation**: Installs `firebase` or `@react-native-firebase/app` automatically
* **Safe `.env.local` merging**:
  * Appends missing Firebase variables
  * Preserves unrelated variables, comments, and empty lines
  * Never creates awkward numbered files like `.env.local2`
  * Strictly avoids touching existing identical values
  * Prompts for confirmation before replacing any conflicting values
* **Framework-specific initialization generator**:
  * Next.js: `process.env.NEXT_PUBLIC_FIREBASE_*`
  * Vite: `import.meta.env.VITE_FIREBASE_*`
  * CRA / React: `process.env.REACT_APP_FIREBASE_*`
  * Never hardcodes private credentials into generated source files
  * Prompts before overwriting existing custom initialization files
* **React Native Android support**: Automatically detects Android `applicationId` and generates `google-services.json`
* **Comprehensive diagnostics (`fireconfig doctor`)**: Validates framework-specific environment variables and initialization syntax
* **Automated test suite & CI**: 100% test coverage for all supported paths

## Supported Projects

FireConfig supports the following project types:

| Framework                | Detection | Configuration workflow |
| ------------------------ | --------- | ---------------------- |
| React                    | Supported | Supported (with build tooling) |
| React + Vite             | Supported | Supported              |
| React + Create React App | Supported | Supported              |
| Next.js                  | Supported | Supported              |
| React Native (Android)   | Supported | Supported              |
| Expo                     | Supported | Not implemented yet    |

React Native projects are automatically connected to Firebase through the Android Firebase configuration workflow. Expo configuration is planned for a future release.

## Requirements

* Node.js 20 or later
* A Firebase project (or permissions to create one via CLI)
* Firebase CLI
* npm, pnpm, Yarn, or Bun

FireConfig can install the Firebase CLI and the Firebase JavaScript SDK if they are not already installed.

## Installation

Run directly with `npx`:

```bash
npx fireconfig init
```

Or install FireConfig globally:

```bash
npm install -g fireconfigcli
```

Verify the installation:

```bash
fireconfig --version
```

## Usage

Run FireConfig from the root of your project:

```bash
fireconfig init
```

The initialization workflow:

1. Detects the project framework and tooling.
2. Detects the package manager.
3. Checks for the Firebase CLI (offers installation if missing).
4. Checks Firebase authentication (offers login via Firebase CLI if needed).
5. Retrieves available Firebase projects (offers to create one if none exist).
6. Prompts you to select a Firebase project.
7. Finds or offers to create a Firebase Web App for the project.
8. Retrieves the Web SDK configuration.
9. Verifies that the Firebase SDK is installed (offers installation if needed).
10. Safely merges Firebase environment variables into `.env.local`.
11. Generates `src/firebase/config.js` with framework-appropriate environment access.

## Commands

### Initialize Firebase

```bash
fireconfig init
```

Configures Firebase for the current project.

### Diagnose the project

```bash
fireconfig doctor
```

Runs a series of diagnostics against the current project.

Example:

```text
🩺 FireConfig Doctor

✓ Project: React + Vite project detected
✓ Package manager: npm detected
✓ Firebase CLI: Firebase CLI 15.30.2 detected
✓ Firebase authentication: Firebase authentication detected
✓ Firebase SDK: Firebase SDK 12.19.0 detected
✓ Firebase config: React Vite Firebase environment configuration is valid

6/6 checks passed.
🔥 Firebase setup looks good!
```

### Display help

```bash
fireconfig --help
```

### Display version

```bash
fireconfig --version
```

## Framework Configuration Architecture

In v0.3.0, FireConfig uses a capability-oriented web architecture:

```text
                 Firebase project
                       │
                       ▼
                 Firebase Web App
                       │
                       ▼
              Firebase SDK config
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
      Environment             Init module
        merger                 generator
             │                   │
             ▼                   ▼
        .env.local        src/firebase/config.js
```

### Next.js

Environment (`.env.local`):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Initialization (`src/firebase/config.js`):
```javascript
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp(firebaseConfig);
```

### React + Vite

Environment (`.env.local`):
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Initialization (`src/firebase/config.js`):
```javascript
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp(firebaseConfig);
```

### React + Create React App / Plain React

Environment (`.env.local`):
```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

Initialization (`src/firebase/config.js`):
```javascript
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export const app =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp(firebaseConfig);
```

## Safety & Idempotency Guarantees

* **Explicit consent for resource creation**: FireConfig never creates external cloud resources (Firebase projects or Web Apps) without explicit user confirmation.
* **Safe environment merging**:
  * Unrelated environment variables are always preserved.
  * Existing comments and formatting are preserved.
  * Same values are not modified.
  * Conflicting values prompt the user before changing.
  * Never produces files like `.env.local2`.
* **Initialization file protection**: If `src/firebase/config.js` already exists with custom code, FireConfig asks for confirmation before replacing it.
* **Idempotent execution**: Running `fireconfig init` multiple times on an already configured project produces no duplicate lines, no duplicate initialization blocks, and no extra cloud resources.

## Security Principles

* FireConfig never requests or stores Firebase service-account private keys.
* Authentication is delegated entirely to the official Firebase CLI (`firebase login`).
* Values written to `.env.local` are client-side public identifiers intended for browser use.
* Firebase Security Rules and server-side checks remain essential to protect your database, storage, and authentication resources.
* Process execution avoids unnecessary `shell: true` and sanitizes command arguments.

## Development & Testing

Clone the repository:

```bash
git clone https://github.com/Ugesh-Praavin/fireconfig.git
cd fireconfig
npm install
```

Run the automated test suite:

```bash
npm test
```

## Roadmap

### v0.1.x
* [x] Project detection
* [x] Firebase CLI detection & installation
* [x] Firebase authentication
* [x] Firebase project & Web App discovery
* [x] SDK installation & initial generators

### v0.2.x
* [x] Next.js environment configuration
* [x] React Native Android configuration (`google-services.json`)
* [x] Framework-specific doctor diagnostics

### v0.3.0
* [x] Capability-oriented strategy architecture
* [x] Shared safe environment merger (`src/config/env-merger.js`)
* [x] Web Firebase initialization generator (`src/firebase/config.js`)
* [x] Automatic Firebase project creation with explicit consent
* [x] Automatic Firebase Web App creation with explicit consent
* [x] Conflict detection and interactive overwrite prompts
* [x] Framework-aware doctor validation for Vite, CRA, Next.js, React, and React Native
* [x] Strict idempotency across CLI runs

### Future
* [ ] Expo configuration workflow
* [ ] Firebase iOS configuration for React Native
* [ ] Additional Firebase service configuration (Firestore, Storage, Auth emulator setup)

## License

MIT License. See [`LICENSE`](./LICENSE) for details.

## Author

**Ugesh Praavin D**
* GitHub: [https://github.com/Ugesh-Praavin](https://github.com/Ugesh-Praavin)
* Repository: [https://github.com/Ugesh-Praavin/fireconfig](https://github.com/Ugesh-Praavin/fireconfig)
