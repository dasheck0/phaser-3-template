# AGENTS.md

This guide is for autonomous coding agents working in this repository.
It summarizes the practical commands, architecture patterns, and coding rules used here.

## 1) Project Snapshot

- Stack: TypeScript, Phaser 3, Vite, Zustand (vanilla), Biome.
- Runtime model: Declarative scene JSON + prefab factory + scene logic classes.
- Core folders:
  - `src/scenes` (scene logic + FSM states)
  - `src/prefabs` (all game/UI objects)
  - `src/systems` (loader, store, i18n, FSM, shared types)
  - `public/data/scenes` (scene configs)
  - `public/data/locales` (i18n translation files)

## 2) Command Reference

Run from repo root.

### Install / Dev / Build

- `npm install` — install dependencies.
- `npm run dev` — starts dev server with LAN URL output.
- `npm run build` — `tsc && vite build`.
- `npm run preview` — preview built app.
- `npm run typecheck` — TypeScript check only (`tsc --noEmit`).

### Lint / Format

- `npm run lint` — Biome lint.
- `npm run format:check` — Biome format check.
- `npm run format:write` — apply formatter.
- `npm run biome:fix` — Biome auto-fix checks.

### Scene Snapshot Tooling

- `npm run scene-snapshots` — run Playwright-based scene capture using `scene-snapshots.config.json`.
- Requires Playwright browser installed (`npx playwright install chromium`) in fresh environments.

### Tests

- There is currently **no dedicated test runner** configured in `package.json` (no `npm test` script).
- Therefore, there is currently **no single-test command** available.
- Validation is done primarily with:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`

## 3) Repo Rules Discovery

- No Cursor rules found (`.cursor/rules/`, `.cursorrules` absent).
- No Copilot instructions found (`.github/copilot-instructions.md` absent).
- Commit hooks are active via Lefthook:
  - `lefthook.yml` runs `commitlint` on `commit-msg`.
- Commit lint config:
  - `commitlint.config.js` extends `@commitlint/config-conventional`.

## 4) TypeScript + Compiler Constraints

Based on `tsconfig.json`:

- `strict: true` (no loose typing).
- `noUnusedLocals: true`, `noUnusedParameters: true`.
- `noImplicitReturns: true`, `noFallthroughCasesInSwitch: true`.
- `moduleResolution: "bundler"`, `noEmit: true`.
- `useDefineForClassFields: false` (important for Phaser compatibility).

Implication for agents:

- Avoid `any`; prefer explicit interfaces, unions, and narrowed types.
- Remove dead code/params instead of leaving placeholders.
- Ensure all paths in functions return values.

## 5) Linting Rules (Biome)

`biome.json` is strict and explicitly enables `noExplicitAny` as an error.

Important practical constraints:

- ESM imports only (`noCommonJs`).
- No TypeScript namespaces.
- No debugger statements.
- No unused vars/private members.
- Suspicious/correctness rule sets are mostly strict errors.

Notes:

- Existing repo may contain legacy warnings; do not introduce new ones in touched code.
- Keep modifications minimal and scoped to requested behavior.

## 6) Import + Module Conventions

- Prefer path aliases from `tsconfig.json`:
  - `@/*`, `@config/*`, `@scenes/*`, `@prefabs/*`, `@systems/*`, `@data/*`.
- Keep imports grouped logically (external, aliased internal, relative internal).
- Use type-only imports where appropriate (`import type { ... } from ...`).

## 7) Naming + File Conventions

- Files: kebab-case (`main-menu-scene.ts`, `language-chooser.ts`).
- Classes: PascalCase (`OptionsScene`, `LanguageChooser`).
- Functions/vars: camelCase.
- Constants: UPPER_SNAKE_CASE for true constants.
- Scene config IDs: stable, descriptive (`statsLabel`, `languageChooser`).

## 8) Architecture Conventions

### Scenes

- Scene classes contain logic/wiring, not static layout drawing.
- Static assets/prefab placement live in JSON under `public/data/scenes`.
- Scene lifecycle pattern:
  - `initializeBase()`
  - `await sceneLoader.loadFromCachedConfig()`
  - wire interactions/callbacks
  - set FSM state

### Prefabs

- All prefabs extend `BaseObject` (or a specialized prefab base).
- Register prefab types centrally in `src/prefabs/index.ts`.
- Keep prefab options explicit via interfaces.
- Be careful: `BaseObject` triggers `create()` during construction; initialize required fields inside `create()` if needed.

### Store

- Use the store system in `src/systems/store` (Zustand vanilla + persistence adapter).
- Keep domains separated (e.g. game vs user settings) when introducing new state.
- Use typed mutations, immutable state updates.
- All persistent/runtime app state must flow through stores; do not bypass stores with direct state persistence in feature modules.

### i18n

- UI text keys come from locale files in `public/data/locales`.
- Missing keys are surfaced visibly (`__missing:key__`) and should be fixed, not ignored.
- Locale/state selection is store-owned (for example `userStore.locale`); i18n modules must consume store state, not directly own persistence.

## 9) Error Handling Expectations

- Fail early on invalid config or missing required prefab/wiring.
- Throw clear errors when prefab IDs/types mismatch expected classes.
- Prefer explicit runtime guards (`instanceof`, null checks) before usage.

## 10) JSON Scene Authoring Tips

- Use `layout.space: "safe"` for responsive UI.
- Use anchor expressions (`left+16`, `center`, `bottom-24`) over hardcoded coordinates when possible.
- For interactive UI prefabs, ensure IDs are unique and wired in scene class.
- Keep assets declared in scene JSON aligned with real files under `public/assets`.
- Language flags should live in `public/assets/images/languages` and use stable key naming by locale (`deFlag`, `enFlag`, etc.).

## 11) Validation Checklist for Agents

Before finishing code changes, run:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build` (for broader integration checks)

For UI/layout features, also run:

4. `npm run dev` and manually verify affected scenes.
5. If relevant, `npm run scene-snapshots` and inspect generated images.

## 12) Commit Hygiene

- Keep commits atomic (single intent per commit).
- Respect commitlint conventional format.
- Do not bundle unrelated refactors with feature work.
- Avoid committing generated artifacts unless explicitly required.
- Do not commit temporary debug artifacts (for example Playwright/manual screenshots like `options-*.png`, `chooser-*.png`) unless explicitly requested.

---

If you add new tooling or test infrastructure, update this file immediately (especially command and single-test sections).
