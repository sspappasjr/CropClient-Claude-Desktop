# CropClient Dashboard — vDOM/vIRR Fence Plan

## Workflow Rule (non-negotiable)
No code changes without explicit **"GOFORIT"** / **"GOGO Gadget"**.

## The Fence
- `vDOM` (Dashboard side) and `vIRR` (Irrigation side) each hold the
  identical structure, hardcoded independently — not derived from each
  other at load. Same fields will later reappear as `vAPI`, prefix
  changed only.
- Structure (every side, every component):
  ```
  originalRecords   — reset source
  displayRecords    — the live grid
  SelectedRecord
  SelectedRanch
  SelectedPlanting
  Result
   ├── TokenName
   ├── Success
   ├── Record
   ├── Error
   ├── Value
   └── Message
  ```
- **Whole object crosses, every time. Never a partial field.** Each
  side JSON-copies its entire structure (`JSON.parse(JSON.stringify(...))`)
  before handing it across — no live references shared between sides.
- **Only a side's own `_receive()` function may write that side's
  fields.** `DOM_receive(irrState)` is the only thing that writes
  `vDOM.*`. `IRR_receive(domState)` is the only thing that writes
  `vIRR.*`. Nothing reaches across and pokes fields directly.
- **Selection is never cleared to null.** After a reset/resort/reload,
  selection lands on the first record of the live set — always a
  record, never nothing.

## The Junction (runToken)
One function decides offline vs. online, once, per call:
```js
async function runToken(toolName, args) {
    const target = CURRENT_TARGET === 'production' ? 'production' : 'local';
    const staged = mcpEngineStaging(target, toolName, args);   // mcp-engine.js — unchanged
    if (isOffline()) {
        return localHandlers[toolName](staged.params);          // direct call, no network
    }
    return mcpEngineSend(staged);                                // real fetch, mcp-engine.js — unchanged
}
```
- `mcp-engine.js` is not modified. `mcpEngineStaging` packages
  `{serverUrl, toolName, params}` for every path, offline or online.
  Only the *send* half branches: a direct local function call
  (`localHandlers[toolName]`) when offline, `mcpEngineSend` (real
  fetch to `local`/`production`) when online.
- `CURRENT_TARGET` is one flag: `'harness' | 'local' | 'production'`.
  Nothing else in `vIRR`, `vDOM`, or the token functions branches on
  it — they always call `runToken()` the same way.
- `localHandlers` mirrors the server's tool handlers by name
  (`APIServer4.0.js`'s `reset_table`, `create_next_irrigation`, etc.)
  so offline mode runs equivalent logic locally instead of failing a
  bare fetch — no CORS-failure-as-signal, ever.
- Not every tool is the same: some (CropManage-backed tools) require
  a token set server-side first (`get_token`/`set_token`); the
  irrigation JSON tools (`reset_table` and friends) don't touch a
  token at all. That distinction lives in each tool's own handler,
  not in the junction.

## This Pass — Reset Only
1. Hardcode `vIRR` at the top of the Irrigation script, `vDOM` at the
   top of the Dashboard script — same 26 records, independent copies.
2. `resetTable()` (in `vIRR`) calls `runToken('reset_table', {})`.
3. Offline (`CURRENT_TARGET = 'harness'`, the default): `localHandlers.reset_table`
   returns `vIRR.originalRecords` directly, no network.
4. `vIRR` folds the result into its own `displayRecords`/`Result`,
   then hands its whole state to `DOM_receive`.
5. `DOM_receive`: `vDOM.originalRecords` → `vDOM.displayRecords`,
   selection lands on the first record, `Result` set. The page's
   working data (`irrigationData`, `displayRecords`, `selectedRecord`)
   is synced from `vDOM` so the existing Create/Meter/Update buttons
   keep working against fresh data without their own code changing.
6. `renderTable()` runs (untouched — already auto-selects first record
   when nothing is selected).
7. `vDOM` pushes its whole state back to `IRR_receive` — resync.

**Not touched this pass:** `testCreateNext()`, `testReadMeter()`,
`updateRecord()`, the date field, data edit rules, the online/local
target paths (wired but not exercised — `CURRENT_TARGET` defaults to
`'harness'`).

## Order of Work
1. **This pass** — Reset token through the fence, harness mode, tested.
2. Next — Create Next / Read Meter / Update through the same fence +
   junction pattern.
3. Then — flip `CURRENT_TARGET` to `'local'`, verify against the real
   `APIServer4.0.js` `reset_table` endpoint (already built, confirmed
   working handler logic, reachable at `POST /tools/reset_table`).
4. Later — `vAPI` (api-component / post tokens), production target.
