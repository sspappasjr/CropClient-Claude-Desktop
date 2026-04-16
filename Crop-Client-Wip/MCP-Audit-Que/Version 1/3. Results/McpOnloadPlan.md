# McpOnloadPlan.md
# Date: 2026-04-06
# Status: IN PROGRESS

## THE DESIGN

mcp-engine owns: DEFAULT_MODE, mcpServers, mcpMode, mcpServerUrl
CC_STATE is declared and owned by api-component-3.0.js — moved there from HTML dashboard block
mcp-engine never touches CC_STATE
window.onload and dropdown listener read mcp-engine vars and set CC_STATE

## CC_STATE DECLARATION — same change in BOTH files

### api-component-3.0.js — add at top
### APIServer3.0.js — add at injection point (same declaration)

```javascript
const CC_STATE = {
    mode:      'online',               // 'local' | 'online' | 'offline'
    localBase: 'http://localhost:3101',
    onlineBase: 'https://api.cropclient.com',
    serverUrl:  'https://api.cropclient.com',
    overrideBase: ''
};
```

## WINDOW.ONLOAD — HTML DASHBOARD_COMPONENT
```javascript
window.onload = async function() {
    read();                            // demo data renders
    mcpEngineInit(DEFAULT_MODE);       // mcp-engine sets its own vars
    CC_STATE.mode      = mcpMode;      // push mcp vars to CC_STATE
    CC_STATE.serverUrl = mcpServerUrl;
    await getTokenAndRanches();        // api now knows where to go
};
```

## DROPDOWN LISTENER — HTML DASHBOARD_COMPONENT
```javascript
sel.addEventListener('change', (e) => {
    CC_STATE.overrideBase = '';
    setEnvMode(e.target.value);
    mcpEngineInit(e.target.value);     // mcp-engine updates its own vars
    CC_STATE.mode      = mcpMode;      // push mcp vars to CC_STATE
    CC_STATE.serverUrl = mcpServerUrl;
});
```

## OWNERSHIP RULE
mcp-engine owns:    DEFAULT_MODE, mcpServers, mcpMode, mcpServerUrl
api-component owns: CC_STATE declaration and structure
APIServer3.0 gets:  same CC_STATE declaration via injection
window.onload sets: CC_STATE from mcp-engine vars before first API call
listener sets:      CC_STATE from mcp-engine vars on every dropdown change
mcp-engine NEVER touches CC_STATE directly

## FILES TO CHANGE
1. api-component-3.0.js — add CC_STATE declaration at top
2. APIServer3.0.js — add same CC_STATE declaration at injection point
3. HTML — remove CC_STATE declaration from DASHBOARD_COMPONENT block
4. HTML window.onload — already updated
5. HTML dropdown listener — already updated

## WHEN MOVED TO x.History
Rename to: DONE-McpOnloadPlan-4.6.2026.md

---
## DISCUSSION
CC_STATE drives API behavior — which server URL to use, which mode we are in.
The browser listener (dropdown) tells api-component what happened on the browser.
api-component uses CC_STATE to know where to send token, ranches, plantings.
Dashboard block should not own API state. api-component should.
api-component is injected into APIServer3.0.js — so the same declaration covers both worlds.
MCP server (Node/APIServer3.0.js) never sees CC_STATE — it just listens on its port.
The browser decides which server to call based on CC_STATE — that decision belongs in api-component.
