<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Base44 sandbox (development)

- Run: `docker compose -f docker-compose.base44.yml up -d --build`, then http://localhost:3000.
- The app is a TanStack Start (Vite 8) app. Dependencies come from `bun.lock`
  into a named `node_modules` volume on container start; source is bind-mounted
  at `/workspace`, so edits hot-reload — no image rebuild needed.
- **The dev server runs under Bun (`bun ./node_modules/vite/bin/vite.js`) on
  purpose.** Yahoo Finance answers Node/undici requests from a datacenter IP
  with `429 Too Many Requests`, while Bun's client gets `200`. Do not switch it
  back to `node` without re-checking `/markets`.
- Vite host allowlisting: only one pattern can be appended via
  `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` (Vite appends it as a single entry),
  so compose passes `.<BASE44_SANDBOX_HOST_DOMAIN>`.
- Market data (`src/lib/markets/market-data.server.ts`) uses the batched
  `spark` endpoint: max 20 symbols per request, one request per 180s, stale data
  served with a warning when the feed is throttled. Symbols: SGX 12, US 9, HK 4,
  plus 4 indices and 2 FX pairs.
- Verify: `docker compose ... exec -T web sh -lc 'node ./node_modules/typescript/bin/tsc --noEmit'`
  and the same path for eslint. A curl of http://localhost:3000/markets should
  contain "Live feed", stock names and rating labels, because the route loads
  quotes in its loader (SSR).
