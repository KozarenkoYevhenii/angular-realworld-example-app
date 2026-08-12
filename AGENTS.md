# AGENTS.md

## Cursor Cloud specific instructions

This is the **Angular RealWorld ("Conduit")** frontend. It is a client-only Angular 21 app;
there is **no local backend** — all API calls are proxied to the hosted API
`https://api.realworld.show/api` (see `src/app/core/interceptors/api.interceptor.ts`).
Network egress to that host is required for the app and e2e tests to work.

Package manager is **Bun** (installed at `~/.bun/bin/bun`, added to `~/.bashrc`). Standard
commands live in `package.json` and `CLAUDE.md`; use those. Key ones:

- Dev server: `bun run start` → http://localhost:4200 (Angular is **zoneless**).
- Build: `bun run build`.
- Lint / formatting: `bun run format:check` (this is the only "lint" — CI uses it).
- E2E tests: `bun run test:e2e` (Playwright). Tests live in the `realworld` git submodule
  (`realworld/specs/e2e`), so the submodule must be initialized (the update script does this).

### Non-obvious gotchas

- **E2E server reuse:** `playwright.config.ts` sets `reuseExistingServer: !process.env.CI`.
  If a dev server is already running on :4200, run `bun run test:e2e` **without** `CI=true`
  so Playwright reuses it. Setting `CI=true` while :4200 is occupied makes Playwright error
  out ("port already used"). If no server is running, Playwright starts one itself.
- **E2E flakiness:** e2e tests hit the shared live API `api.realworld.show`, so a small number
  of tests can be flaky / fail due to shared state or timing (e.g. favorite/profile tests).
  Playwright retries handle most; treat isolated failures there as environment-independent.
- **Unit tests (`bun run test`, Vitest) are pre-existing broken** and are NOT part of CI
  (CI only runs format-check + Playwright). Two problems in the repo's test code: `zone.js`
  is imported by the specs/`src/test-setup.ts` but is not declared in `package.json`, and each
  spec re-calls `getTestBed().initTestEnvironment()` which conflicts with the global setup file
  ("Cannot set base providers because it has already been called"). Do not treat these failures
  as an environment problem.
- **E2E debug hook:** e2e tests use `window.__conduit_debug__` to read app state
  (see `e2e/helpers/debug.ts`).
