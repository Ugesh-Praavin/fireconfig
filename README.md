# 🔥 FireConfig

### Automate Firebase configuration for JavaScript & TypeScript projects.

[![npm version](https://img.shields.io/npm/v/fireconfigcli?logo=npm&logoColor=white)](https://www.npmjs.com/package/fireconfigcli)
[![npm downloads](https://img.shields.io/npm/dm/fireconfigcli?logo=npm&logoColor=white)](https://www.npmjs.com/package/fireconfigcli)
[![GitHub stars](https://img.shields.io/github/stars/Ugesh-Praavin/fireconfig?style=flat&logo=github)](https://github.com/Ugesh-Praavin/fireconfig)
[![GitHub issues](https://img.shields.io/github/issues/Ugesh-Praavin/fireconfig?logo=github)](https://github.com/Ugesh-Praavin/fireconfig/issues)
[![CI](https://github.com/Ugesh-Praavin/fireconfig/actions/workflows/test.yml/badge.svg)](https://github.com/Ugesh-Praavin/fireconfig/actions/workflows/test.yml)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

> Automate the repetitive parts of connecting your project to Firebase.

FireConfig detects your project, configures Firebase, safely manages environment variables, and generates framework-specific Firebase initialization.

**React · Vite · CRA · Next.js · React Native**

---

## ⚡ Quick Start

```bash
npx fireconfig init
```

That's it.

FireConfig guides you through:

```text
Detect → Authenticate → Select → Configure → Generate
```

### Example

```text
🔥 FireConfig

✓ Project detected: Next.js
✓ Package manager: npm
✓ Firebase CLI detected
✓ Firebase authentication detected

Fetching Firebase projects...
✓ Firebase project selected

Checking Firebase Web Apps...
✓ Web App selected

Downloading Firebase configuration...
✓ Firebase configuration retrieved

Configuring Firebase environment...
✓ .env.local configured

Generating Firebase initialization...
✓ src/firebase/config.js created

✓ Firebase configuration complete!
```

## 🛠️ Commands

| Command | Description |
| --- | --- |
| `fireconfig init` | Configure Firebase for the current project |
| `fireconfig doctor` | Diagnose Firebase configuration |
| `fireconfig --help` | Show available commands |
| `fireconfig --version` | Show installed version |

## 🧩 Supported Projects

| Framework | Detection | Configuration |
| --- | --- | --- |
| React | ✅ | ✅ (with build tooling) |
| React + Vite | ✅ | ✅ |
| React + Create React App | ✅ | ✅ |
| Next.js | ✅ | ✅ |
| React Native Android | ✅ | ✅ |
| Expo | ✅ | 🚧 Planned |

React Native projects are automatically connected to Firebase through the Android Firebase configuration workflow. Expo configuration is planned for a future release.

## 🔥 What FireConfig Automates

* Detects your project framework
* Detects your package manager
* Checks Firebase CLI
* Verifies Firebase authentication
* Finds or creates a Firebase project
* Finds or creates a Firebase Web App
* Retrieves Firebase SDK configuration
* Installs the Firebase SDK when required
* Safely merges `.env.local`
* Generates `src/firebase/config.js`
* Validates the configuration with `fireconfig doctor`

## 🛡️ Built With Safety in Mind

FireConfig does not blindly overwrite your project:

* Existing environment variables are preserved
* Comments and unrelated variables are preserved
* Conflicting Firebase values require confirmation
* Existing Firebase configuration files require confirmation before replacement
* Firebase projects and Web Apps require explicit confirmation before creation
* Re-running FireConfig does not duplicate configuration
* Service-account private keys are never requested or stored

## 📦 Installation

### Run without installing

```bash
npx fireconfig init
```

### Install globally

```bash
npm install -g fireconfigcli
```

Then:

```bash
fireconfig init
```

## ⚙️ Framework Configuration Architecture

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

## 🩺 Diagnostics with `fireconfig doctor`

Run `fireconfig doctor` to inspect and diagnose your Firebase setup at any time:

```bash
fireconfig doctor
```

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

## 🔒 Security Principles

* FireConfig never requests or stores Firebase service-account private keys.
* Authentication is delegated entirely to the official Firebase CLI (`firebase login`).
* Values written to `.env.local` are client-side public identifiers intended for browser use.
* Firebase Security Rules and server-side checks remain essential to protect your database, storage, and authentication resources.
* Process execution avoids unnecessary `shell: true` and sanitizes command arguments.

## 🧪 Development & Testing

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

* **Automated test suite & CI**: 135 tests passing

## 🗺️ Roadmap

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
* [x] Context-aware confirmation UX for zero-project and user-selected creation flows
* [x] Conflict detection and interactive overwrite prompts
* [x] Framework-aware doctor validation for Vite, CRA, Next.js, React, and React Native
* [x] Strict idempotency across CLI runs

### Future
* [ ] Expo configuration workflow
* [ ] Firebase iOS configuration for React Native
* [ ] Additional Firebase service configuration (Firestore, Storage, Auth emulator setup)

## 📄 License

MIT License. See [`LICENSE`](./LICENSE) for details.

## 👤 Author

**Ugesh Praavin D**
* GitHub: [https://github.com/Ugesh-Praavin](https://github.com/Ugesh-Praavin)
* Repository: [https://github.com/Ugesh-Praavin/fireconfig](https://github.com/Ugesh-Praavin/fireconfig)
