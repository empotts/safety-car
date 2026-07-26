# safety-car

A private-app starter built with TanStack Start, Cloudflare Workers + D1,
Drizzle ORM, and Better Auth.

## Authentication and access

- Email/password bootstrap and recovery
- WebAuthn passkey registration and sign-in
- New accounts default to `pending`
- The configured owner can approve or revoke users at `/admin`
- Revocation deletes the user's active sessions
- Protected routes require both a valid session and active access

The account whose email matches `ADMIN_OWNER_EMAIL` is always treated as the owner.
Set that value before exposing the app publicly.

## Local setup

```sh
pnpm install
cp .env.local.example .env.local
cp .env.production.example .env.production
```

Set a high-entropy `BETTER_AUTH_SECRET` of at least 32 characters and set
`ADMIN_OWNER_EMAIL` to your email. Alchemy declares the Worker, D1 database,
bindings, secrets, and migrations in `alchemy.run.ts`.

```sh
pnpm dev
```

`pnpm dev` loads `.env.local` and uses Alchemy's default personal stage,
`dev_$USER`. The Worker runs locally while Alchemy provisions a separate,
stage-namespaced D1 database in Cloudflare. Local development therefore uses
real Cloudflare bindings without changing production resources.

Create the owner account using the exact `ADMIN_OWNER_EMAIL`. Other accounts remain
pending until the owner approves them.

## Production

Set the production HTTPS origin in `BETTER_AUTH_URL`. Alchemy reads the three
values from `.env.production`; the auth secret and owner email are deployed as
encrypted Worker secrets. Both environment files are ignored by Git, while
their `.example` templates are committed.

```sh
pnpm check
pnpm plan
pnpm run deploy
```

Passkeys are origin/domain sensitive, so use a stable production hostname.
The plan and deploy commands target the isolated `prod` stage. Production uses
the existing `safety-car` Worker and `safety_car_db` database; Alchemy reconciles
those resources and applies pending SQL migrations automatically.

Shell environment variables are a fallback for values absent from the selected
file. This is useful in CI, where secrets can be injected by the CI provider
instead of written to disk; omit `--env-file` there if no environment file is
created.

## Important files

- `src/lib/auth.ts` — Better Auth and passkey configuration
- `src/lib/auth.functions.ts` — server-side session and authorization checks
- `src/db/schema.ts` — users, sessions, and passkeys
- `alchemy.run.ts` — Cloudflare infrastructure, bindings, secrets, and deploy
- `src/routes/_protected.tsx` — protected-route boundary
- `src/routes/_protected/admin.tsx` — owner access management
