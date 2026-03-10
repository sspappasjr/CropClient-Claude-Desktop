# Mac's Note — v1.6 Build

## Status: NOT STARTED
- v1.6 file does not exist yet
- Need to find v1.4 HTML first (check alpha: C:\AICode\crop-client-services\Pages\)
- Copy v1.4 → v1.6, then apply three fixes

## Three MUST Fixes
1. Always show the URL on screen (near env dropdown)
2. Failure messages include the full URL that failed
3. Allow fallback to local — do NOT force online on page load

## Key Info
- Online: http://api.cropclient.com (HTTP, no SSL)
- Local: http://localhost:3101
- OLD dead URL: api.crop-client-services.com — do NOT use
- Server has CORS enabled — no addon needed
- v1.6 goes to: CropClient-MCP-API-Tools-Audit-Q-v1.6.html in this folder

## Where the bugs are in v1.5
- Line 1378: DOMContentLoaded forces online mode — that's the force-back bug
- getMcpBase() resolves URL but never shows it
- mcpCall() builds full URL but error messages don't include it
- No fallback path when online fails

## Rules
- ONE small change at a time
- Do NOT show code in chat
- Short answers
- Use v1.6.1, v1.6.2, v1.6.3 increments if needed
