# Plan: Replace Water-Science's custom S13 with real api-component-3.4.1.js

**Date:** 2026-07-24
**For:** next session (fresh chat)
**File in scope:** `mybestdemo/v3/CropClient-Water-Science.html` (also mirrored at `mybestdemo/CropClient-Water-Science.html`)

---

## Why

Water-Science has a custom-built "S13 ApiComponent" (a `vAPI` fence with its own
`apiGetToken`/`apiGetRanches`/`apiGetPlantings`/`apiGetIrrigationDetails`/
`apiPostNewIrrigation`/`apiUpdateIrrigation`) that was hand-written this session
to mirror que 3.4.1's 6 CropManage API tools. It has repeatedly diverged from
the real, working implementation:

- Sent fake credentials (`demo@cropclient.com`/`demo-password`) in local/online
  mode instead of real ones — fixed once found, but only because it was hand-built
  wrong in the first place.
- Never computes `appliedHours` from `WaterApplied` (inches) the way que's real
  client does (`api-component-3.4.1.js` lines 1139-1140, 1156) — still broken,
  shows 0 always.

Every bug so far has the same root cause: reimplementing logic that already
exists, correct and proven, in `api-component-3.4.1.js` (que's real client file,
already sitting in this repo at `mybestdemo/v3/api-component-3.4.1.js`).

**Decision: stop patching the reimplementation. Delete it. Use the real file.**

---

## The compatibility catch (read this before starting)

`api-component-3.4.1.js` depends on `mcpServerUrl`, which is only set by
`mcp-engine-4.0.js` (via `mcpEnginePublishHarnessUrl()`). Water-Science currently
loads the older `mcp-engine.js` (v2.1), which has no such concept — so bringing
in the real api-component means also bringing in `mcp-engine-4.0.js`.

That creates a second problem: Water-Science's existing IRR/CRUD side (S10 —
`runToken()`, used by reset/create/meter/update, all still working today) also
calls functions named `mcpEngineStaging`/`mcpEngineSend` — but from the *old*
engine, with a different call signature:

- v2.1 (current): `mcpEngineStaging(target, toolName, params)` → returns a
  staged object → `mcpEngineSend(staged)`
- v4.0: `mcpEngineSend(toolName, params)` directly — no staged object; it does
  its own staging internally via `mcpEnginePrepare()`

If both engine files load on the same page, the later one's function
definitions win (plain global functions, no namespacing) — so loading
`mcp-engine-4.0.js` after `mcp-engine.js` would silently break S10's
`runToken()`, since it would suddenly be calling v4.0's `mcpEngineSend` with a
staged object instead of a toolName string.

**Resolution:** update S10's `runToken()` to call v4.0's API directly instead of
staging-then-send. This is a small, mechanical change (confirmed earlier this
session) — not a redesign.

---

## Steps

1. **Add the real files** — `mcp-engine-4.0.js` and `api-component-3.4.1.js`
   already exist in `mybestdemo/v3/`. Add `<script src="mcp-engine-4.0.js">`
   and `<script src="api-component-3.4.1.js">` to Water-Science.html, in that
   order, before S10.

2. **Delete S13 entirely** — remove the whole `vAPI` fence: `vAPI`, `API_receive`,
   `apiGetToken`, `apiGetRanches`, `apiGetPlantings`, `apiGetIrrigationDetails`,
   `apiPostNewIrrigation`, `apiUpdateIrrigation`, `apiSelectRanch`,
   `apiSelectPlanting`, `buildParamsForTool`, `renderApiPanel`, the offline
   `localHandlers` mocks for the 6 API tools, `API_DEMO_USER`/`API_DEMO_PASS`.
   Not retire — delete.

3. **Rewire S1's tool clicks** to que's real functions instead of the deleted
   `apiGet*` ones:
   - Get Token → `getToken()`
   - Get Ranches → `getRanches()`
   - Get Plantings → `getPlantingsByRanch(selectedRanchGuid)`
   - Get Irrigation Details → `refreshSelectedIrrigations()` (que's real
     equivalent — confirm exact name/behavior against the uploaded que file
     before wiring)
   - Post New Irrigation → `postRecordToCropManage()`
   - Update Irrigation → `updateRecordToCropManage()`

4. **Match que's DOM IDs** so api-component-3.4.1.js's own render functions
   (`populateRanchesGrid`, `populatePlantingsGrid`, etc.) have somewhere to
   write: `ranchesGrid`, `plantingsGrid`, `tokenDisplay`, `credentialsInput`,
   `urlDisplay`. Current Water-Science S1 uses different IDs
   (`ranchesTableBody`/`plantingsTableBody` from the Claude Design pass) —
   these need to be reconciled, either by adopting que's IDs or adapting
   api-component-3.4.1.js's render calls. Prefer adopting que's IDs — less
   code to touch, matches "inject the real 3.4.1" intent literally.

5. **Fix the engine collision** — update S10's `runToken()`:
   ```js
   // Before (v2.1 two-step):
   const staged = mcpEngineStaging(target, toolName, args);
   return mcpEngineSend(staged);

   // After (v4.0 direct):
   return mcpEngineSend(toolName, args);
   ```
   Add `mcpEngineLogon()` call at startup (window.onload, local/online modes
   only) so the tool registry loads — v4.0's `mcpEngineSend` returns
   "MCP not armed" without it.

6. **Test offline first** (Playwright, same pattern as every change this
   session) — confirm reset/create/meter/update still work after the engine
   swap, confirm the 6 API tools still work through the real api-component's
   own offline/CORS-fallback path.

7. **User tests Local mode** against the real APIServer5.1 — this is the part
   that can't be verified in the sandbox (no network access to localhost or
   CropManage).

---

## What does NOT change

- Dashboard.html and `dashboard-component.js` (S11) — untouched, this is
  Water-Science-only.
- S2 (Command Log), S3 (grid), S4 (Water Form) — layout untouched.
- `mcp-engine.js` (v2.1) itself — not deleted, just no longer loaded by
  Water-Science (Dashboard.html and the old non-5.0 files may still use it;
  check before removing the file from disk).

---

## Open question for the user, next session

Que's que 3.4.1 "Get Irrigation Details" equivalent is `refreshSelectedIrrigations()`
— confirm this is the right function to wire the S1 row to before implementing
step 3, since its behavior (confirms before overwriting pending records, handles
3 ranch/planting scenarios) is more elaborate than the deleted `apiGetIrrigationDetails()`.
