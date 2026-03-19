# wazaker Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-17

## Active Technologies

- TypeScript 5.9, React 19, React Native 0.83, Expo SDK 55 + Expo, React Native, React Navigation, Expo AV or Expo Audio, Zod for response validation (001-recitation-mvp-spec)

## Project Structure

```text
src/
├── app/
│   ├── controllers/
│   └── providers/
├── features/
│   └── recitation/
│       ├── controllers/
│       ├── models/
│       ├── view-models/
│       └── views/
├── shared/
│   ├── i18n/
│   └── theme/
└── test/
```

## Commands

npm test \&\& npm run lint

## Code Style

TypeScript 5.9, React 19, React Native 0.83, Expo SDK 55: Follow standard conventions

## Recent Changes

- 001-recitation-mvp-spec: Added TypeScript 5.9, React 19, React Native 0.83, Expo SDK 55 + Expo, React Native, React Navigation, Expo AV or Expo Audio, Zod for response validation

<!-- MANUAL ADDITIONS START -->
- Architecture: use MCVM for app and feature organization. Keep views focused on rendering, controllers on orchestration, view-models on presentation state, and models on domain/data shapes.
- Naming: use `kebab-case` for file and folder names by default. Framework-required exceptions like `App.tsx` are allowed only at the root entrypoint level.
<!-- MANUAL ADDITIONS END -->
