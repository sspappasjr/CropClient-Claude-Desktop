# MCP_API_Update_and_Test_v1.4 Status

## Current Position (Post Revert to Stable Versions 7 & 5)

### Stable Local MCP Verified
- Local MCP server (`http://localhost:3101`) confirmed working.
- Token acquired onload and properly stored on MCP.
- Tools verified:
  - set_token
  - get_ranches
  - get_plantings
  - get_irrigation_details
- Full flow working:
  - Ranch → Planting → Irrigation Details

### Harness Enhancements in v1.3
- Environment dropdown added:
  - Local (default)
  - Online
  - Offline
- Mode + URL logging added to chat for traceability.
- Online failure visibility verified during testing branch.

### Token Behavior Clarified
- Browser token and MCP server token are separate stores.
- Stable versions kept them in sync implicitly.
- Test branch exposed desync when fallback logic was removed.
- Reverted to stable behavior for v1.4 deployment phase.

---

## Objective for v1.4

Deploy stable MCP server to:

https://crop-client-services.com

---

## v1.4 Deployment Plan

### 1) Freeze Stable Local Build
- Confirm:
  - Token onload works
  - set_token executed correctly
  - Ranch → Planting → Irrigation flow fully operational
- No experimental fallback removals.

### 2) Deploy MCP Server to Hosted Environment
- Install same MCP server version currently running locally.
- Verify endpoints:
  - /tools/set_token
  - /tools/get_ranches
  - /tools/get_plantings
  - /tools/get_irrigation_details

### 3) Online Mode Validation
- Switch harness to Online.
- Confirm:
  - Token stored on hosted MCP
  - Ranches load
  - Plantings load
  - Irrigations load
- Mode + URL visible in chat.

### 4) Big Banana Test (End-to-End)
- Token
- Ranch
- Planting
- Irrigation
- Queue (status = -1)
- Post Irrigations
- Confirm parity between Local and Online.

---

## Not Included in v1.4
- No queue listener implementation yet.
- No token architecture redesign.
- No fallback behavior restructuring.
- No major refactors.

v1.4 Goal:
Replicate stable Local MCP behavior on Hosted MCP.