# Changelog — MojoSoMint app (PWA)

## v1.2 — 2026-11-07
- Talk-to-text: mic button (44px) beside every text field — Today commitment and reflection, goals, journal, schedule block title and notes. Uses the Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) with live interim text appended to the field; tap again to stop. Clear listening/stopped states.
- Graceful errors: microphone permission denied, no speech, other errors; when recognition is unavailable (e.g. some iOS home-screen installs) the field is focused with a hint to use the keyboard's dictation mic.
- Service worker cache: **mm-v3**. About: Version 0.3.

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
