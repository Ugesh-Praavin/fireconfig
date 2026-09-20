# FireConfig

[![CI](https://github.com/Ugesh-Praavin/fireconfig/actions/workflows/test.yml/badge.svg)](https://github.com/Ugesh-Praavin/fireconfig/actions/workflows/test.yml)

Firebase configuration CLI for JavaScript and TypeScript projects.

FireConfig automates the repetitive parts of connecting a project to Firebase. It detects the project environment, verifies Firebase CLI authentication, lets you select a Firebase project and Web App, retrieves the Firebase SDK configuration, and generates the Firebase initialization file.

> **Status:** v0.1.0

## Overview

Setting up Firebase in a new project typically involves several manual steps:

* Installing and configuring the Firebase CLI
* Authenticating with Firebase
* Finding the correct Firebase project
* Finding the corresponding Web App
* Retrieving the SDK configuration
* Installing the Firebase SDK
* Creating the Firebase initialization code
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
   └── Generate configuration
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
* Firebase configuration generation
* Existing configuration protection
* Firebase setup diagnostics through `fireconfig doctor`
* Automated test suite
* GitHub Actions CI

## Supported Projects

FireConfig currently detects:

| Framework    | Detection | Configuration workflow |
| ------------ | --------- | ---------------------- |
| React        | Supported | Supported              |
| Next.js      | Supported | Planned                |
| React Native | Supported | Planned                |
| Expo         | Supported | Planned                |

The current release focuses on the standard Firebase Web SDK workflow. Framework-specific configuration for Next.js, React Native, and Expo is planned for subsequent releases.

## Requirements

* Node.js 20 or later
* A Firebase project
* Firebase CLI
* npm, pnpm, Yarn, or Bun

FireConfig can offer to install the Firebase CLI when it is not available.

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
12. Generates the Firebase configuration file.

The generated file is:

```text
src/firebase/config.js
```

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

✓ Project: react project detected
✓ Package manager: npm detected
✓ Firebase CLI: Firebase CLI 15.30.2 detected
✓ Firebase authentication: Firebase authentication detected
✓ Firebase SDK: Firebase SDK ^12.19.0 detected
✓ Firebase config: Firebase configuration is valid

6/6 checks passed.
Firebase setup looks good!
```

### Display help

```bash
fireconfig --help
```

### Display version

```bash
fireconfig --version
```

## Package Manager Detection

FireConfig identifies the package manager from the project's lockfile.

| Package manager | Lockfile                  |
| --------------- | ------------------------- |
| npm             | `package-lock.json`       |
| pnpm            | `pnpm-lock.yaml`          |
| Yarn            | `yarn.lock`               |
| Bun             | `bun.lock` or `bun.lockb` |

## Generated Configuration

For a Firebase Web App, FireConfig generates a configuration similar to:

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

FireConfig only writes the configuration file if it does not already exist.

If:

```text
src/firebase/config.js
```

already exists, FireConfig will not overwrite it.

## Security

FireConfig uses the official Firebase CLI for authentication rather than implementing its own authentication system.

Authentication is performed through:

```bash
firebase login
```

FireConfig does not request or store Firebase service-account private keys.

The Firebase Web SDK configuration generated by FireConfig contains client-side configuration values intended for use by web applications. These values should still be protected by appropriate Firebase Security Rules and other application-level security controls.

FireConfig also avoids silently overwriting existing configuration files.

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
* Package manager detection
* Firebase CLI detection
* Firebase authentication detection
* Firebase SDK detection
* Firebase configuration validation
* Firebase configuration generation
* Existing configuration protection
* Doctor checks

Run:

```bash
npm test
```

All tests are also executed automatically through GitHub Actions on pushes and pull requests targeting `main`.

## Project Structure

```text
fireconfig/
├── .github/
│   └── workflows/
│       └── test.yml
├── bin/
│   └── index.js
├── src/
│   ├── auth/
│   ├── detectors/
│   ├── doctor/
│   ├── firebase/
│   ├── generators/
│   ├── installers/
│   └── ui/
├── test/
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

The project is organized around small, independently testable modules. Detection, Firebase operations, configuration generation, installation, authentication, and diagnostics are kept separate from the CLI entry point.

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
* [x] Configuration generation
* [x] Existing configuration protection
* [x] `fireconfig doctor`
* [x] Automated tests
* [x] GitHub Actions CI
* [x] npm package preparation

### Planned

* [ ] Next.js environment configuration
* [ ] Environment variable generation
* [ ] React Native configuration
* [ ] Expo configuration
* [ ] Framework-specific Firebase setup
* [ ] Additional Firebase service configuration
* [ ] Expanded diagnostics
* [ ] Integration test coverage

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

## License

FireConfig is released under the MIT License.

See [`LICENSE`](./LICENSE) for the full license text.

## Author

**Ugesh Praavin D**

GitHub: https://github.com/Ugesh-Praavin

## Repository

https://github.com/Ugesh-Praavin/fireconfig
