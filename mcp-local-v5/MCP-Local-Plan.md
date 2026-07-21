# Irrigation Component → MCP Local Mode — Plan

## Workflow Rule (carried over, still non-negotiable)
No code changes without explicit **"GOFORIT"** / **"GOGO Gadget"**.

## Where We Are Coming From
The dashboard (`mybestdemo/CropClient-Dashboard.html`) has all four
irrigation tokens — `reset_table`, `read_meter`,
`create_next_irrigation`, `update_record` — running through the
`vDOM`/`vIRR` fence in **harness mode**: `runToken()` calls
`localHandlers[toolName]` directly, no network, everything simulated
in-browser. That pass is done and tested (see
`mybestdemo/Dashboard-Fence-Plan.md`).

## What This Pass Proves
That the same tokens work identically when `vIRR`'s business logic is
real MCP tools on a live Node server instead of in-browser functions —
proving the fence design is genuinely MCP-aware, not just a browser
simulation.

## Test Model
**`APIServer5.0.js`** — based on the user's current working
`APIServer3.4.1.js` (uploaded, not the repo's stale copies — that file
is the one confirmed still correct "up to get-irrigation-detail").
Renamed/version-stamped to 5.0. Everything it already has (10
CropManage `apiServiceTools`, 7 `jsonFileTools` including
`data_operation`/`json_read`/`json_write`, the HTTP bridge on
`/ping` `/tools` `/tools/:toolName`) stays untouched.

**Key finding from inspecting it:** this server has no
`reset_table`/`read_meter`/`create_next_irrigation`/`update_record`
tools — those only ever existed in the 4.0 server (the one that got
abandoned). So irrigation's business logic doesn't already live
server-side here; it has to be added.

## The Approach: Extract From 1.5, Not Rewrite
`irrigation-component.js` is not new code written to match the
dashboard's behavior — it **is** the dashboard's own code, taken out.
The harness pass wasn't a rehearsal we throw away: it was the MCP
token language (the `success`/`statusMessage`/`data` shape, the date
rules, the record math) being written and proven correct before it had
a real server to live on. Extracting it now is close to mechanical:

- **Source: `mybestdemo/CropClient-Dashboard.html` (v1.5)** —
  specifically the `localHandlers` object (`reset_table`, `read_meter`,
  `create_next_irrigation`, `update_record`) and its helper functions
  (`parseAndNormalizeDate`, `parseEventDate`, `formatDate`). Same
  bodies, same rules, same error messages — carried over, not
  reauthored.
- **`irrigation-component.js`** — that extracted code, wrapped as a
  standalone Node module: a factory function
  `(handleDataOperation) => [tools...]`, returning the four tools in
  the exact shape (`name`, `description`, `inputSchema`, `handler`)
  `APIServer5.0.js` already uses for its own tools.
- **The one real seam that changes:** in the dashboard, each handler
  reads/writes `vIRR.displayRecords` directly — an in-memory JS
  variable in the browser tab. As server tools, they read/write
  through `handleDataOperation('read'/'write', 'irrigation', ...)`
  instead — same shape of operation (get the records, mutate, save
  them back), different storage underneath (a JSON file on the
  server instead of a page-scoped variable). Everything else —
  arguments in, results out, the date/duplicate/null rules — is
  unchanged.
- **Persistence** — the module calls the *host server's own*
  `handleDataOperation(action, table, data)` (already defined in
  `APIServer5.0.js` for the JSON file tools) rather than inventing a
  separate store. Table name: `irrigation`. Reset restores from
  `irrigation_snapshot`.
- **Self-seeding** — on first call, if `irrigation`/
  `irrigation_snapshot` don't exist yet as files, the module seeds
  both with the same 26 hardcoded records `vIRR` already carries — no
  manual seed step needed from the dashboard.
- **Injection point in `APIServer5.0.js`** — one require + one
  register loop, right after the existing `jsonFileTools.forEach(...)`
  line:
  ```js
  const irrigationTools = require('./irrigation-component.js')(handleDataOperation);
  irrigationTools.forEach(tool => server.registerTool(tool));
  ```
  Plus the three existing `[...apiServiceTools, ...jsonFileTools]`
  array spreads (`/ping` tool count, `/tools` list, `/tools/:toolName`
  dispatch) get `...irrigationTools` added. Nothing else in the file
  changes — the CropManage and JSON-file tools you already have are
  untouched.

## Why This Is the Right Shape
Because the tool names now match exactly what the dashboard's
`runToken()` already calls, **no client-side recipe is needed**. The
online branch of `runToken()` — `mcpEngineSend(staged)` via
`mcp-engine.js` — already works unmodified. The only client-side
change to go live is flipping one flag:
```js
let CURRENT_TARGET = 'local'; // was 'harness'
```
Everything above `runToken()` — the fence, `vDOM`/`vIRR`,
`DOM_receive`/`IRR_receive`, all four token functions — stays exactly
as built and tested. That's the actual proof: swapping the transport
underneath `runToken()` requires touching nothing else.

## Files in This Folder
- `APIServer5.0.js` — the server, ready to run
- `irrigation-component.js` — the injected module
- `package.json` — `express` + `cors`, so it's `npm install && node APIServer5.0.js`

## Order of Work (next session)
1. **GOFORIT** — extract `localHandlers` + helpers from
   `mybestdemo/CropClient-Dashboard.html` into `irrigation-component.js`
   (swapping direct `vIRR.displayRecords` access for
   `handleDataOperation` calls), and add the injection edit to
   `APIServer5.0.js`.
2. You run it locally (`npm install`, then `node APIServer5.0.js`,
   port 3101).
3. Confirm `GET http://localhost:3101/tools` lists the four new tools
   alongside the existing ones.
4. Flip `CURRENT_TARGET` to `'local'` in the dashboard.
5. Test Reset first (same order as the harness pass), then Read
   Meter, Create Next, Update — same regression checks as before, this
   time against the real server.
6. Confirm the `vDOM`/`vIRR` fence behavior is bit-for-bit identical
   to harness mode.
7. Later, separate plan: `vAPI` (the CropManage-backed
   `apiServiceTools` — these *do* require a token via
   `get_token`/`set_token`, unlike the irrigation tools).
