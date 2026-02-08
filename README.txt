Kjapp oppstart (lokalt):
1) Lag et nytt Supabase-prosjekt.
2) Kjør SQL-en jeg ga deg (tabeller + view + RLS).
3) Kopier .env.local.example til .env.local og lim inn URL + ANON KEY.
4) npm install
5) npm run dev

Netlify:
- Repo til GitHub -> New site from Git
- Build command: npm run build
- Plugin: @netlify/plugin-nextjs (ligger i netlify.toml)
- Environment variables: NEXT_PUBLIC_SUPABASE_URL og NEXT_PUBLIC_SUPABASE_ANON_KEY
