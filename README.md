# FreshKeep

A local-first inventory and expiry tracker built with React, TypeScript, Vite, and Capacitor. Includes an iOS app shell.

## Development

Use Node.js 22.19 or later in the Node.js 22 release line.

```sh
npm ci
npm run dev
```

## Validation

```sh
npm run check
npm run lint
npm run test:model
npm run build
```

## Codex cloud

Select this GitHub repository in your Codex cloud environment. Use Node.js 22.19 or later in the Node.js 22 release line and set the setup command to `npm ci`. Run the validation commands above after changes. Web development, tests, and builds can run on Linux; building and signing the iOS app requires macOS and Xcode.

## iOS

On macOS, install dependencies, then run:

```sh
npm run cap:sync
npm run cap:open:ios
```

Run Capacitor sync on macOS before opening Xcode so generated plugin paths match the host platform.

## Repository contents

- `src/`: application source
- `public/`: bundled static assets
- `tests/`: model and app readiness tests
- `ios/`: native iOS project
- `docs/`: project specifications and plans
- `stitch_smart_expiry_tracker/`: design references

Dependency folders, build outputs, local tool state, and environment secrets are excluded by `.gitignore`.
