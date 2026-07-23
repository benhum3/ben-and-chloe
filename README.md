# Benjamin & Chloe Wedding Website

The public wedding website, personalised RSVP journey and private planning
dashboard for Benjamin and Chloe's wedding on 19 December 2026.

## Local development

Install dependencies and start the local site:

```bash
npm install
npm run dev
```

The site is then available at `http://localhost:3000`.

## Required environment variables

Create `.env.local` with these server configuration values:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
ADMIN_PASSWORD=
```

`ADMIN_PASSWORD` must remain private. Never prefix it with `NEXT_PUBLIC_`.

The same variables must be configured for the Production environment in
Vercel. Preview and Development values can be added there when needed.

## Database migrations

SQL files in `supabase/migrations` are applied in filename order. Before a
deployment that relies on a new migration, run that SQL in the Supabase SQL
Editor and confirm it completes successfully.

The launch-readiness migration:

- repairs existing invitation lookup keys;
- makes invitation lookup names unique; and
- saves each household RSVP atomically so a failed request cannot leave a
  partially updated response.

## Release checklist

Before pushing a release:

```bash
npm run lint
npm run build
git diff --check
```

Then verify the public homepage, one day invitation, one evening invitation,
an updated response, the admin dashboard and each CSV export.

## Backups

The private dashboard includes a **Full Backup CSV**. Download it regularly
once invitations have been sent, and always before bulk guest-list changes.

The production site is deployed from the `main` branch by Vercel.
