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
cp .dev.vars.example .dev.vars
```

Set a high-entropy `BETTER_AUTH_SECRET` of at least 32 characters and set
`ADMIN_OWNER_EMAIL` to your email. Then configure the D1 database ID in
`wrangler.jsonc`.

```sh
pnpm db:migrate:local
pnpm dev
```

Create the owner account using the exact `ADMIN_OWNER_EMAIL`. Other accounts remain
pending until the owner approves them.

## Production

Set the production HTTPS origin in `BETTER_AUTH_URL`. Store the auth secret and
owner email as Worker secrets rather than plain Wrangler variables:

```sh
pnpm wrangler secret put BETTER_AUTH_SECRET
pnpm wrangler secret put ADMIN_OWNER_EMAIL
pnpm db:migrate:remote
pnpm deploy
```

Passkeys are origin/domain sensitive, so use a stable production hostname.

## Important files

- `src/lib/auth.ts` — Better Auth and passkey configuration
- `src/lib/auth.functions.ts` — server-side session and authorization checks
- `src/db/schema.ts` — users, sessions, and passkeys
- `src/routes/_protected.tsx` — protected-route boundary
- `src/routes/_protected/admin.tsx` — owner access management
