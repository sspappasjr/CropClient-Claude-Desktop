# PLAN: Enhancement 194 — Water Tools Demo → 3src Pattern

**Date:** 2026-04-10  
**Status:** PLANNING - AWAITING STEP-BY-STEP APPROVAL  
**Target File:** `0. Pages/CropClient-MCP-Water-Tools-Demo-V1.html`

---

## Strategy
Keep the existing working format and layout. Modularize one piece at a time with approval gates.

---

## CRITICAL GOAL: Dual-App Testing & State Persistence
**Why Two Apps Grow Together:**
- Both apps share the SAME `2. Src=` files (mcp-engine, api-component, irrigation-component)
- Changes to src= are tested against BOTH apps simultaneously
- Each app must save/restore state via JSON files
- **Goal:** Switch between apps seamlessly — grids auto-populate with current saved state
  - App A saves record → JSON file
  - Switch to App B → loads same JSON file → grid displays current data
  - Both apps work with same data, proving src= components are solid

---

## STEP 1: Add Section Markers
**What:** Add `@@@@ SECTION_NAME id:xxx @@@@` comments to organize existing code  

**Sections to mark:**
- `@@@@ HTML_TEMPLATE id:water-tools @@@@` — layout structure
- `@@@@ CSS_VARIABLES id:theme @@@@` — styling (keep as-is)
- `@@@@ GRID_SECTION id:irrigation-grid @@@@` — data table
- `@@@@ FORM_SECTION id:record-form @@@@` — record detail form
- `@@@@ CRUD_FUNCTIONS id:crud-ops @@@@` — read/create/update/delete
- `@@@@ INITIALIZATION id:onload @@@@` — window.onload

**Outcome:** Code organized, no changes to behavior

**Approval Gate:** Steve review before Step 2

---

## STEP 2: Link mcp-engine (First src=)
**What:** Add external script link at bottom of HTML

```html
<!-- @@@@ MCP_ENGINE id:mcp-engine-link @@@@ -->
<script src="2. Src=/mcp-engine.js"></script>
<!-- @@@@ MCP_ENGINE id:mcp-engine-link @@@@ -->
```

**Keep:** All demo code as-is (for now)  
**Result:** mcp-engine loads, demo still works exactly the same

**Approval Gate:** Steve review before Step 3

---

## STEP 3: Change onload → Load steve.json
**What:** Replace hardcoded mock data with JSON file

**Current:** `window.onload = function() { read(); ... }`  
**New:** `window.onload = async function() { await loadData('steve.json'); ... }`

**Data File:** `steve.json` (created by src=3, contains real irrigation records)

**Outcome:** Demo pulls real data from file, grid displays same way

**Approval Gate:** Steve review before Step 4

---

## STEP 4: Wire Dropdown/Buttons to MCP Calls
**What:** Connect UI interactions to actual mcp-engine calls

- Dropdown → call `get_ranches`
- Grid rows → call `get_irrigation_details`
- Update button → call `update_record`

**Keep:** dashboard as-is (will become src=4 later when needed)

**Approval Gate:** Staged as needed

---

## Future: Dashboard → src=4
When demo dashboard is modified/perfected, extract and link as 4th component.

---

## Team
- **Steve** — approval gates, design decisions
- **Mac** — implementation, one step at a time

---

## Rules
- ✅ Keep working format
- ✅ One step at a time
- ✅ Approval before each step
- ✅ No code rewrite until necessary
