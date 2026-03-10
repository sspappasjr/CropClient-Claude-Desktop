# v1.6 Session Status — Mac Note
## Feb 18, 2026

### What was done this session:

**File:** `CropClient-MCP-API-Tools-Audit-Q-v1.6.html`

1. **URL display added** — Read-only input box next to env dropdown shows the active URL at all times (`http://api.cropclient.com`, `http://localhost:3101`, or `(offline)`). Auto-updates on dropdown change or `mcp host` command.

2. **Error messages now include the URL** — `mcpCall()` wraps fetch in try/catch. Network failures say the full URL it tried. Server errors append the URL too.

3. **Online = MCP ONLY (CORS fix)** — When mode is Online or Local, ALL calls go through MCP server. No direct CropManage API calls. This eliminates CORS because:
   - Browser → `http://api.cropclient.com` (our server, CORS: `*`) → CropManage (server-to-server, no CORS)
   - Previously the browser tried direct `https://api.dev.cropmanage.ucanr.edu` calls which blocked with CORS from `file://` origin

4. **Offline = Direct CropManage API** — When mode is Offline, the harness still works by calling CropManage directly. (Will hit CORS if opened from `file://`, but works if served from a web server.)

5. **No more force-online on load** — Removed hard-coded `sel.value = 'online'` override. HTML `selected` attribute controls default.

### Functions fixed (Online=MCP only, Offline=direct):
- `getToken()` — uses MCP `get_token` tool when online
- `getRanches()` — uses MCP `get_ranches` tool when online
- `getPlantingsByRanch()` — uses MCP `get_plantings` tool when online
- `getIrrigationEventsByPlanting()` — uses MCP `get_irrigation_details` tool when online
- `loadAllPlantings()` — loops through ranches via MCP when online

### NOT yet fixed (deeper functions, still have direct CropManage calls):
- Line ~2604: individual irrigation event fetch
- Line ~2651: fetchAllRecommendations loop
- Lines ~2969-3026: search/filter functions
- Lines ~3254, 3366: POST/PUT to CropManage v3 API (create/update events)
- These only run when user triggers specific actions, not on page load

### Server check:
- `http://api.cropclient.com` is LIVE, returns `Access-Control-Allow-Origin: *`
- POST to `/tools/get_token` works
- POST to `/tools/get_ranches` works (needs token first)
- No CORS issues from any browser origin

### Next session:
- Test the four main flows in Online mode
- Fix remaining direct CropManage calls in deeper functions if needed
- Title updated to "CropClient MCP API Tools Audit v1.6"
