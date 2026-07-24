# Plan: Verify real api-component-3.4.1.js in Water-Science (S13)

**Date:** 2026-07-24
**For:** next session (fresh chat)
**File in scope:** `mybestdemo/v3/CropClient-Water-Science.html` (mirrored at `mybestdemo/CropClient-Water-Science.html`)
**Branch:** `claude/water-science-dashboard-mcp-p9klpz`
**Last commit:** `321110d` — "Replace custom S13 ApiComponent with real api-component-3.4.1.js"

---

## What is already done (committed and pushed, do not redo)

- Custom S13 (`vAPI` fence: `apiGetToken`, `apiGetRanches`, etc.) is deleted.
- S13 now loads the real, unmodified files via `<script src=>`, same as que:
  - `mcp-engine-4.0.js` (line 649, loads BEFORE `mcp-engine.js` at line 650 —
    this order protects S10's `runToken()`, which still uses v2.1's
    `mcpEngineStaging`/`mcpEngineSend(staged)` two-step call. api-component
    never calls those function names directly, so it's unaffected by which
    one wins.)
  - `api-component-3.4.1.js` (line 1123)
- Hidden (`display:none`) scaffolding elements added so the real file's
  internal render calls don't throw: `#tokenDisplay`, `#ranchesGrid`,
  `#plantingsGrid`, `#recommendationsGrid`, `#irrigationDetailsBody`.
- Bridge functions mirror real global state (`ranchData`, `plantingsData`,
  `selectedRanchGuid`, etc.) into S1's EXISTING visible tables
  (`#ranchesTableBody`, `#plantingsTableBody`). **S1's visible markup itself
  was not touched.**
- S1's 6 tool rows route through `selectToolFromGrid()` → `runRealTool()` to
  the real functions: `getToken()`, `getRanches()`,
  `getPlantingsByRanch()`, `getIrrigationEventsByPlanting()`,
  `postIrrigationToCropManage()`, `updateRecordToCropManage()`.
- `setEnvMode()` calls `mcpEngineLogon()` (local/online) or
  `mcpEngineHarnessOffline()` (offline) from mcp-engine-4.0.js — offline
  mode uses the real files' own harness fallback, not a custom mock.
- Syntax-checked (2 inline script blocks, no errors). Sandbox-only smoke
  test confirmed the functions exist and offline mode switches without
  page errors — **could not test Local mode against a real server**, since
  this sandbox has no network route to `localhost:3101`. That is
  environment isolation, not a bug in the code.

## What is NOT done / open

1. **User verification of Local mode** against the real APIServer (5.0 or
   5.1) on the user's own machine — this is the part the sandbox cannot
   do. Needs: Get Token → Get Ranches → Get Plantings → Get Irrigation
   Details (confirm Applied Hours is no longer 0, confirm RecHrs is
   rounded, confirm no "days days" dupe) → Post New Irrigation → Update
   Irrigation.
2. **Post/Update flow** — que's real `postIrrigationToCropManage()` /
   `updateRecordToCropManage()` are wired to run directly from the tool
   row click. Que's own UI normally goes through a confirmation modal
   (`showPostModal()`/`#postModal`) before calling these — that modal was
   NOT implemented here (per "leave S1 exactly as it is, no new visible
   elements"). Confirm this direct-call behavior is what's wanted, or if a
   confirmation step is needed.
3. **`refreshSelectedIrrigations()` vs `getIrrigationEventsByPlanting()`** —
   S1's "Get Irrigation Details" row currently calls
   `getIrrigationEventsByPlanting(selectedPlantingId)` directly. Que's own
   UI uses `refreshSelectedIrrigations()`, a 3-scenario dispatcher (handles
   "no ranch selected," "ranch but no planting," "specific planting")
   before calling the same function. Confirm which is correct for
   Water-Science's simpler single ranch/planting selection flow.
4. **-5.0 line files** (`mybestdemo/v3/CropClient-Water-Science-5.0.html`,
   `mybestdemo/v5/CropClient-Water-Science-5.0.html`) were explicitly out
   of scope for this change — still on the old custom S13. No action
   unless the user asks.

## What does NOT change (unless the user asks)

- S1's visible markup — untouched, must stay untouched.
- Dashboard.html / `dashboard-component.js` — untouched, confirmed no
  uncommitted diff.
- `mcp-engine.js` v2.1 itself — not deleted, still used by Dashboard and
  by S10 in Water-Science.

## Next step for the next session

Wait for the user to report results from testing Local mode against their
real APIServer on their own machine, then fix only what they report as
broken — do not preemptively touch anything else.
