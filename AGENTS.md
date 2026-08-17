# Cursor Cloud specific instructions

This is the **React RealWorld ("Conduit")** frontend. It is a client-only React app
(hooks + Redux Toolkit + React Router); there is **no local backend** — all API calls
go to the hosted API `https://api.realworld.show/api` (see `src/core/api/client.ts`).
Network egress to that host is required for the app and e2e tests to work.

Package manager is **Bun** (installed at `~/.bun/bin/bun`, added to `~/.bashrc`). Standard
commands live in `package.json` and `CLAUDE.md`; use those. Key ones:

- Dev server: `bun run start` → http://localhost:4200 (Vite).
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
- **E2E debug hook:** e2e tests use `window.__conduit_debug__` to read app state
  (see `realworld/specs/e2e/helpers/debug.ts`).
- **Angular → React mapping:** see `MIGRATION.md`.
