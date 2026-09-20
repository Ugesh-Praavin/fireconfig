# Contributing to FireConfig

Thank you for your interest in contributing to FireConfig.

FireConfig is an open-source CLI focused on automating Firebase configuration for JavaScript and TypeScript projects. Contributions should keep the CLI predictable, secure, testable, and easy to maintain.

## Development setup

Requirements:

- Node.js 20 or later
- npm
- Git

Clone the repository:

```bash
git clone https://github.com/Ugesh-Praavin/fireconfig.git
cd fireconfig
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

## Making changes

Create a focused branch from `main`:

```bash
git checkout -b feat/your-change
```

Keep changes narrowly scoped. Avoid unrelated refactors in feature or bug-fix pull requests.

When adding behavior, add or update tests where practical.

Before opening a pull request, run:

```bash
npm test
npm audit
```

## Pull requests

Pull requests should:

- Explain the problem and the proposed change.
- Include relevant tests.
- Avoid unrelated changes.
- Document user-facing behavior changes.
- Preserve existing security boundaries.

CI must pass before a pull request is merged.

## Commit messages

Use concise, imperative commit messages. Examples:

```text
Add Expo project detection
Fix Firebase CLI detection on Windows
Improve doctor diagnostics
```

## Security

Do not add service-account private keys, access tokens, credentials, or other secrets to the repository.

FireConfig relies on the official Firebase CLI for authentication. Changes that affect authentication, command execution, configuration generation, or credential handling should receive particular attention during review.

For security vulnerabilities, do not open a public issue with sensitive details. Contact the maintainer privately through the security contact listed in the repository.

## Code style

Prefer small modules with a single responsibility. Keep platform-specific behavior explicit, especially around process execution on Windows and Unix-like systems.

Avoid introducing unnecessary dependencies.

## Questions and proposals

For bugs, use the bug report template.

For feature proposals, use the feature request template and explain the use case, expected behavior, and alternatives considered.
