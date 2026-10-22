# coach-admin

Internal tool for managing coaches on the shared [coach-calendar](https://github.com/gerencserjani/coach-calendar) backend -- **not** a customer-facing site, and not meant to be publicly deployed. Run it locally.

Lets a platform ADMIN:

- Switch between the local dev backend and a deployed one at runtime (no rebuild needed) -- see the backend switcher at the top of the page.
- List existing coaches, and see/assign each one's site (`frontendUrl`) -- normally set automatically when a coach accepts her invite (see next bullet), but fixable here for the one coach that predates that flow (the seeded ADMIN account).
- Invite a new coach to one of the already-allow-listed sites below ([gerencserjani/coach-calendar#32](https://github.com/gerencserjani/coach-calendar/issues/32)): sends a signed link to her email, and she sets her own password there, which is what actually creates the `Coach` row -- nothing is created here just by sending the invite.
- Manage the platform-wide "Allowed origins" (CORS) list -- every deployed coach frontend has to be added here before that coach can be invited to it, or before its browser can reach the backend at all.
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

## Why a separate repo instead of folding this into coach-monorepo

The backend is designed as one shared service for many independent, coach-branded frontends (see coach-calendar's `CONTEXT.md`, backend issue #14). Coach management is a cross-coach, platform-level concern -- it doesn't belong inside `coach-monorepo` either, even though that repo is itself a monorepo of multiple coaches' sites now: each `apps/<coach>` there is still one coach's own branded site, and this tool manages coaches as a platform-level concern above any of them.
