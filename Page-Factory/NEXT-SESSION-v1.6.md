# NEXT SESSION: Build v1.6

## WHO
- Mac (Claude Code) is the coder
- Steve uploads this file to start the session

## WHAT TO DO
1. Read v16-requirements.md in memory folder for full requirements
2. Read the v1.4 HTML file (the working one Steve is using)
3. Create v1.6 as a copy of v1.4 with these THREE fixes:

### Fix 1: Always show the URL
- The URL being used (http://api.cropclient.com or http://localhost:3101) MUST be visible on screen at all times
- Put it near the env dropdown so Steve always sees where the app is pointed

### Fix 2: Show failure message with the URL
- When a fetch fails, the error message MUST include the full URL it tried to reach
- Example: "Failed to reach http://api.cropclient.com/tools/get_ranches"
- Not just "MCP tool failed" — show WHERE it failed

### Fix 3: Allow fallback to local
- Do NOT force online mode on page load
- If online fails, let Steve switch to local without the page fighting him
- The dropdown should stay where he puts it

## URL TO USE
- Online: http://api.cropclient.com (NOT https — no SSL yet)
- Local: http://localhost:3101
- The old url api.crop-client-services.com is DEAD — do not use

## SERVER INFO
- http://api.cropclient.com/ping — LIVE, returns v1.3, 15 tools
- http://api.cropclient.com/tools — returns all 15 tool names
- Express cors() middleware is on — browser fetch should work without addon

## FILES
- v1.4 working copy: Steve will tell you which one he's using
- v1.6 goes in: C:\AICode\CropClient-Claude-Desktop\MCP-API-Tools-Audit\v1.5-restructure\CropClient-MCP-API-Tools-Audit-Q-v1.6.html
- Do NOT touch v1.4 or v1.5

## RULES
- ONE small change at a time
- DO NOT show code in chat
- Short answers — YES or NO when that's the question
- Steve is the designer, Mac is the coder
- Use v1.6.1, v1.6.2, v1.6.3 increments if needed
- Save session docs before ending
