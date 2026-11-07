# Changelog — MojoSoMint app (PWA)

## v1.1 — 2026-11-07
- New **Plan** tab: daily schedule ported from the desktop prototype — hour timeline, default repeating day (Sleep, Train weekdays + weekend session, Work / Lunch / Work), overnight blocks, week strip, previous/next/today and date picker, add/edit/delete blocks, repeat (none, daily, weekdays, weekends, weekly), skip this day, mark done, now line, "Your repeating day" rebuild.
- Storage schema 2 → 3 under `mm.pwa`; existing data kept, schedule added.
- Home-screen icon: lotus-hand enlarged to ~78% of icon (from vector source); new maskable 512 icon; icon/manifest URLs use `?v=2`.
- Service worker cache: **mm-v2**.

## v1.0 — 2026-11-06 (initial release)
- Today commitment + reflection, Discipline Code archetypes, weekly review and goals, private journal, export / delete data, About. Offline via service worker.
- Service worker cache: **mm-v1**.

## How to revert
- Undo a release, keeping history: `git revert <commit>` then `git push` (GitHub Pages redeploys in ~1 min).
- Redeploy an earlier tag exactly: `git checkout v1.0 -- . && git commit -m "Redeploy v1.0" && git push`.
- Whenever you redeploy, bump the cache name in `sw.js` (e.g. mm-v3) so installed phones pick up the change.
