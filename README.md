# Teamingful

An app for researchers. You meet someone, press one big button, and capture it: snap a card, badge, slide or poster, hold to talk, or type a note. Teamingful turns that into a "team of two" (you + them), remembers what each side promised, and helps you follow up. The other person opens a share link (no app needed) to see the shared slides and promises, and can join free. Your teams together become your network.

- Phone = capture in the moment.
- Laptop = the work afterwards.

One app, layout switches at 1024px.

Stack: Next.js (App Router, TypeScript), Tailwind CSS 3, Supabase (database, auth, storage).

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the two values
npm run dev                  # http://localhost:3000
```

Other commands: `npm run build`, `npm run typecheck`.

## Environment variables (`.env.local`)

| Name | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project > Project settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page (the anon / publishable key) |

## Supabase setup

1. Run `supabase/migrations/0001_init.sql` (SQL editor or `supabase db push`).
2. Auth > Providers: enable **Google** and **Email**.
3. Auth > URL configuration: add redirect URLs `http://localhost:3000/**` and `https://teamingful.com/**` (callback is `/auth/callback`).
4. Storage: create two **private** buckets by hand (they are not created in SQL): `captures` and `team-files`.

The public share page `/t/[token]` will need a server-side lookup by token later (service role), since anonymous visitors have no row access.

## Layout of the code

- `app/(app)/` signed-in screens, one folder per screen
- `app/signin`, `app/auth/callback` sign-in
- `app/t/[token]` public share page (placeholder)
- `components/` TeamMark, AppFrame, nav
- `tailwind.config.ts` design tokens
- `proxy.ts` sends signed-out users to `/signin`
