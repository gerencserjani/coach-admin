# coach-admin

Internal tool for managing coaches on the shared [coach-calendar](https://github.com/gerencserjani/coach-calendar) backend -- **not** a customer-facing site, and not meant to be publicly deployed. Run it locally.

Lets a platform ADMIN:

- Switch between the local dev backend and a deployed one at runtime (no rebuild needed) -- see the backend switcher at the top of the page.
- List existing coaches.
- Create a new coach (currently password-based -- an admin sets an initial password directly and hands it to the coach out of band; see [gerencserjani/coach-calendar#32](https://github.com/gerencserjani/coach-calendar/issues/32) for the planned invite-based flow where the coach sets her own password instead).
- Revoke a coach's sessions (forces re-login everywhere, e.g. for a leaked token or an offboarded coach).

## Getting started

```bash
npm install
npm run dev     # starts on localhost:5173, defaults to talking to localhost:3000
npm run build   # type-check and build
npm run lint    # ESLint
```

Log in with an existing ADMIN account's email/password (this tool only accepts ADMIN-role logins -- a COACH-role login is rejected with a clear message). To point it at a deployed backend instead of local dev, use the "Use URL" field in the backend switcher; this is stored in the browser's `localStorage`, not a build-time env var, specifically so you can switch without rebuilding.

## Regenerating API types

```bash
npm run generate:api-types   # requires the backend running locally on :3000
```

## Why a separate repo instead of folding this into betti-coaching

The backend is designed as one shared service for many independent, coach-branded frontends (see coach-calendar's `CONTEXT.md`, backend issue #14). Coach management is a cross-coach, platform-level concern -- it doesn't belong inside any single coach's own branded site.
