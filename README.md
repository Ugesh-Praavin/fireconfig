# FireConfig

[![CI](https://github.com/Ugesh-Praavin/fireconfig/actions/workflows/test.yml/badge.svg)](https://github.com/Ugesh-Praavin/fireconfig/actions/workflows/test.yml)

Firebase configuration CLI for JavaScript and TypeScript projects.

FireConfig automates the repetitive parts of connecting a project to Firebase. It detects the project environment, verifies Firebase CLI authentication, lets you select a Firebase project and Web App, retrieves the Firebase SDK configuration, installs the Firebase SDK when needed, and generates framework-appropriate Firebase configuration.

> **Status:** v0.2.1

## Overview

Setting up Firebase in a new project typically involves several manual steps:

* Installing and configuring the Firebase CLI
* Authenticating with Firebase
* Finding the correct Firebase project
* Finding the corresponding Web App
* Retrieving the SDK configuration
* Installing the Firebase SDK
* Creating the Firebase configuration
* Verifying that the configuration is complete

FireConfig brings these steps into a single CLI workflow.

```text
Project
   │
   ├── Detect framework
   ├── Detect package manager
   ├── Check Firebase CLI
   ├── Verify authentication
   ├── Select Firebase project
   ├── Find Web App
   ├── Retrieve SDK configuration
   ├── Verify Firebase SDK
   └── Generate framework-specific configuration
```

## Features

* Project framework detection
* Package manager detection
* Firebase CLI detection
* Firebase CLI installation
* Firebase authentication through the official Firebase CLI
* Firebase project discovery
* Interactive Firebase project selection
* Firebase Web App discovery
* Firebase SDK configuration retrieval
* Firebase SDK detection
* Automatic Firebase SDK installation
* Framework-specific Firebase configuration generation
* Existing configuration protection
* Firebase setup diagnostics through `fireconfig doctor`
* Automated test suite
* GitHub Actions CI

## Supported Projects

FireConfig currently supports the following project types:

| Framework                | Detection | Configuration workflow |
| ------------------------ | --------- | ---------------------- |
| React                    | Supported | Supported              |
| React + Vite             | Supported | Supported              |
| React + Create React App | Supported | Supported              |
| Next.js                  | Supported | Supported              |
| React Native             | Supported | Supported    |
| Expo                     | Supported | Not implemented yet    |

React Native projects are automatically connected to Firebase through the Android Firebase configuration workflow. Expo configuration is planned for a future release.

## Requirements

* Node.js 20 or later
* A Firebase project
* Firebase CLI
* npm, pnpm, Yarn, or Bun

FireConfig can offer to install the Firebase CLI when it is not available.

FireConfig can also install the Firebase JavaScript SDK when it is not already installed.

## Installation

Install FireConfig globally:

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

1. Detects the project framework.
2. Detects the package manager.
3. Checks for the Firebase CLI.
4. Offers to install the Firebase CLI if required.
5. Checks Firebase authentication.
6. Offers to authenticate using the official Firebase CLI.
7. Retrieves available Firebase projects.
8. Prompts you to select a Firebase project.
9. Finds the project's Web App.
10. Retrieves the Web SDK configuration.
11. Verifies that the Firebase JavaScript SDK is installed.
12. Offers to install the Firebase SDK if required.
13. Generates the framework-specific Firebase configuration.

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

Runs a series of checks against the current project.

Example:

```text
FireConfig Doctor

✓ Project: react-cra project detected
✓ Package manager: npm detected
✓ Firebase CLI: Firebase CLI 15.30.2 detected
✓ Firebase authentication: Firebase authentication detected
✓ Firebase SDK: Firebase SDK ^12.19.0 detected
✓ Firebase config: React CRA Firebase environment configuration is valid

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

## Framework Configuration

FireConfig generates configuration according to the detected project type.

### React

Standard React projects use:

```text
src/firebase/config.js
```

Example:

```javascript
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
};

export const app = initializeApp(firebaseConfig);
```

### React + Vite

Vite projects use:

```text
.env.local
```

with the `VITE_` prefix:

```text
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### React + Create React App

Create React App projects use:

```text
.env.local
```

with the `REACT_APP_` prefix:

```text
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

### Next.js

Next.js projects use:

```text
.env.local
```

with the `NEXT_PUBLIC_` prefix:

```text
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## Existing Configuration Protection

FireConfig never silently overwrites an existing configuration file.

For example, if:

```text
.env.local
```

already exists for a framework that uses environment configuration, FireConfig will stop instead of replacing the existing file.

Likewise, for standard React projects, FireConfig will not overwrite:

```text
src/firebase/config.js
```

This protects existing Firebase configuration and prevents accidental data loss.

## Package Manager Detection

FireConfig identifies the package manager from the project's lockfile.

| Package manager | Lockfile                  |
| --------------- | ------------------------- |
| npm             | `package-lock.json`       |
| pnpm            | `pnpm-lock.yaml`          |
| Yarn            | `yarn.lock`               |
| Bun             | `bun.lock` or `bun.lockb` |

The detected package manager is used when FireConfig needs to install the Firebase SDK or Firebase CLI.

## Security

FireConfig uses the official Firebase CLI for authentication rather than implementing its own authentication system.

Authentication is performed through:

```bash
firebase login
```

FireConfig does not request or store Firebase service-account private keys.

The Firebase Web SDK configuration generated by FireConfig contains client-side configuration values intended for use by web applications. Firebase Security Rules and appropriate application-level security controls should still be used to protect application data and resources.

FireConfig also:

* Avoids silently overwriting configuration
* Uses explicit process execution
* Avoids unnecessary `shell` execution
* Does not implement custom Firebase OAuth
* Does not request service-account private keys
* Keeps Firebase CLI authentication delegated to the official Firebase tooling

## Development

Clone the repository:

```bash
git clone https://github.com/Ugesh-Praavin/fireconfig.git
```

Change into the project directory:

```bash
cd fireconfig
```

Install dependencies:

```bash
npm install
```

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Testing

FireConfig uses Node.js's built-in test runner.

The test suite covers:

* Project detection
* React detection
* Vite detection
* Create React App detection
* Next.js detection
* React Native detection
* Expo detection
* Package manager detection
* Firebase CLI detection
* Firebase authentication detection
* Firebase SDK detection
* Firebase SDK installation
* Firebase configuration validation
* Firebase configuration generation
* Framework-specific environment generation
* Existing configuration protection
* Doctor checks
* Integration behavior

Run:

```bash
npm test
```

All tests are also executed automatically through GitHub Actions on pushes and pull requests targeting `main`.

## Project Structure

```text
fireconfig/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── workflows/
│       └── test.yml
├── bin/
│   └── index.js
├── src/
│   ├── auth/
│   ├── config/
│   ├── detectors/
│   ├── doctor/
│   ├── firebase/
│   ├── generators/
│   ├── installers/
│   └── ui/
├── test/
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
├── package.json
└── README.md
```

The project is organized around small, independently testable modules.

Detection, Firebase operations, configuration generation, installation, authentication, and diagnostics are kept separate from the CLI entry point.

## Roadmap

### v0.1.x

* [x] Project detection
* [x] Package manager detection
* [x] Firebase CLI detection
* [x] Firebase CLI installation
* [x] Firebase authentication
* [x] Firebase project discovery
* [x] Interactive project selection
* [x] Firebase Web App discovery
* [x] SDK configuration retrieval
* [x] Firebase SDK detection
* [x] Firebase SDK installation
* [x] React configuration generation
* [x] Existing configuration protection
* [x] `fireconfig doctor`
* [x] Automated tests
* [x] GitHub Actions CI
* [x] npm package preparation
* [x] Next.js configuration strategy
* [x] Next.js environment generation
* [x] React + Vite environment generation
* [x] React + Create React App environment generation
* [x] Framework-specific doctor checks
* [x] Firebase SDK installation tests
* [x] CRA integration testing

### v0.2.x

* [x] Next.js environment configuration
* [x] React environment strategy
* [x] React + Vite environment configuration
* [x] React + Create React App environment configuration
* [x] Framework-specific diagnostics
* [x] Expanded integration coverage
* [x] React Native configuration
* [ ] Expo configuration
* [ ] Framework-specific Firebase setup improvements
* [ ] Additional Firebase service configuration
* [ ] Expanded diagnostics
* [ ] Documentation and examples for additional frameworks

## Contributing

Contributions are welcome.

To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Add or update tests.
5. Run the test suite.

```bash
npm test
```

6. Commit your changes.
7. Open a pull request.

Please keep changes focused and include tests for new functionality where appropriate.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

FireConfig is released under the MIT License.

See [`LICENSE`](./LICENSE) for the full license text.

## Author

**Ugesh Praavin D**

GitHub: https://github.com/Ugesh-Praavin

## Repository

https://github.com/Ugesh-Praavin/fireconfig
