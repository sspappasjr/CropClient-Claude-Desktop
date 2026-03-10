
# CropManage Dashboard v1.5 — Visual Design Spec
### Date: February 17, 2026
### Team: Steve (CEO), Mac (Code), George/Gus (Server/Desktop)

---

## THE FULL 2x2 — Bird's Eye View

```
+================================================================+
|                  CropManage Dashboard v1.5                      |
+================================+===============================+
|          S1: COMMAND CENTER    |     S2: AI ASSISTANT          |
|          (Admin builds here)   |     (Chat + Natural Language) |
|                                |                               |
|  User/Role bar at top          |  Chat log scrolls here        |
|  API/Agents grid in middle     |  AI responses appear          |
|  Prompt builder at bottom      |  System messages              |
|                                |                               |
|                                |  [Type command here...] [Send]|
+================================+===============================+
|          S3: CROPMANAGE        |     S4: FIELD DETAILS         |
|              DASHBOARD         |     (Inspect + Edit)          |
|  (User works here ALL DAY)    |                               |
|                                |  Date:      | Interval:       |
|  Production irrigation grid    |  +========================+   |
|  Click rows to inspect in S4   |  | RECOMMENDED HOURS: 1.3|   |
|  Edit, queue changes           |  +========================+   |
|                                |  MgrHrs:    | Applied:        |
| [Reset][Refresh][Update][Post][Save]                          |
|                                |  [Create][Reset][Apply][Update]|
+================================+===============================+
```

---

## USE CASE 1: Admin Logs In & Pulls Fresh Data

```
STEP 1: Admin sees login area at top of S1
+==========================================================+
| [Steve Pappas ▼]  Role: Admin  [Online ▼]       [Login]  |
+==========================================================+
       |
       | Click Login (or auto from history dropdown)
       v
+==========================================================+
| Steve Pappas       Role: Admin  [Online ▼]     [Logout]  |
| Status: Connected to api.cropclient.com                   |
+==========================================================+

  Token obtained behind the scenes — user NEVER sees it
  Role determines what they can access
  Login history dropdown remembers previous users


STEP 2: Admin clicks API filter, selects "Get Irrigation Details"
+==========================================================+
| Steve Pappas       Role: Admin  [Online ▼]      [Logout] |
|----------------------------------------------------------|
| [API*] [Agents]                                          |
| +------------------------------------------------------+ |
| | Get Token              | Get Ranches                 | |
| | Get Plantings          | >> Get Irrigation Details << | |
| | Post Irrigation        | Update Record               | |
| +------------------------------------------------------+ |
|----------------------------------------------------------|
| Prompt: [token:CeK..][ranch:1][planting:1A][irrig_det]  |
| [Get irrigation details for Ranch 1, Planting 1A]       |
|                                          [Send] [Save]   |
+==========================================================+

  Click a tool in the grid → prompt builder fills automatically
  Token, ranch, planting chips snap into the prompt
  Admin can edit the prompt before sending


STEP 3: Send fires → API returns → Data flows down to S3
+==========================================================+
|                    S1                                     |
|  Status: 8 irrigation records loaded from CropManage     |
+==========================================================+
          |
          | Data flows DOWN (Refresh)
          v
+==========================================================+
|  CropManage Dashboard (8)              Records Changed (0)|
|----------------------------------------------------------|
| Ranch    | Planting | Date  | RecHrs | Intv | Mgr | Appl |
|----------|----------|-------|--------|------|-----|------|
| Ranch 1  | 1A       | 10/14 |  1.3   | 1.5d | 1.2 | 1.15|
| Ranch 1  | 1A       | 10/16 |  1.1   | 2.0d | 1.0 | 0.95|
| Ranch 1  | 1B       | 10/14 |  0.9   | 1.5d | 0.8 | 0.75|
| Ranch 1  | 1B       | 10/16 |  1.4   | 2.0d | 1.3 | 1.20|
| Ranch 2  | 2A       | 10/14 |  1.7   | 1.5d | 1.5 | 1.40|
| ...      | ...      | ...   |  ...   | ...  | ... | ... |
|----------------------------------------------------------|
| [Reset] [Refresh] [Update] [Post to CropManage] [Save]  |
+==========================================================+

  S3 title: "CropManage Dashboard" — not "Irrigation Records"
  This IS the production grid. User lives here.
  Footer: Reset on left, Save on right, action buttons in middle
```

---

## USE CASE 2: User Works in S3, Edits in S4

```
STEP 1: User clicks a row in S3
+==========================================================+
|  CropManage Dashboard (8)              Records Changed (0)|
|----------------------------------------------------------|
| Ranch 1  | 1A       | 10/14 |  1.3   | 1.5d | 1.2 | 1.15|
| Ranch 1  | 1A       | 10/16 |  1.1   | 2.0d | 1.0 | 0.95|  <<<< CLICKED
| Ranch 1  | 1B       | 10/14 |  0.9   | 1.5d | 0.8 | 0.75|
+==========================================================+
          |
          | Selected row populates S4
          v
+=================================+
|  Selected Field Details         |
|---------------------------------|
|  Date: 10/16    Interval: 2.0d |
|  +===========================+ |
|  |  RECOMMENDED HOURS: 1.1  | |
|  +===========================+ |
|  MgrHrs: [1.0]  Applied: [0.95]|
|---------------------------------|
| [Create] [Reset] [Apply] [Update]|
+=================================+

  User sees the big green Recommended Hours
  Editable fields: MgrHrs and Applied
  CRUD buttons send prompts to S2 (chat assistant)


STEP 2: User changes MgrHrs from 1.0 to 1.1, clicks Update
+=================================+
|  MgrHrs: [1.1]  Applied: [0.95]|  <<<< CHANGED
|---------------------------------|
| [Create] [Reset] [Apply] [>>Update<<]|
+=================================+
          |
          | Update button sends prompt to S2:
          | "Update water applied for selected record"
          v
+=================================+
|  S2: AI Assistant               |
|---------------------------------|
|  System: Record updated         |
|  MgrHrs changed: 1.0 → 1.1     |
|  Record queued for posting      |
+=================================+

  Change reflected in S3 grid
  Record marked in queue
  "Records Changed" counter goes from (0) to (1)


STEP 3: S3 shows the change is queued
+==========================================================+
|  CropManage Dashboard (8)              Records Changed (1)|
|----------------------------------------------------------|
| Ranch 1  | 1A       | 10/14 |  1.3   | 1.5d | 1.2 | 1.15|
| Ranch 1  | 1A       | 10/16 |  1.1   | 2.0d |*1.1*| 0.95|  <<<< CHANGED & QUEUED
| Ranch 1  | 1B       | 10/14 |  0.9   | 1.5d | 0.8 | 0.75|
|----------------------------------------------------------|
| [Reset] [Refresh] [Update] [Post to CropManage] [Save]  |
+==========================================================+

  Changed values highlighted (asterisks = visual indicator)
  Records Changed counter = 1
  Ready to Post back to CropManage or Save to JSON
```

---

## USE CASE 3: Post Changes Back to CropManage

```
STEP 1: User clicks [Post to CropManage] in S3 footer
+==========================================================+
| [Reset] [Refresh] [Update] [>>Post to CropManage<<] [Save]|
+==========================================================+
          |
          | Posts ALL queued records via API
          v
+=================================+
|  S2: AI Assistant               |
|---------------------------------|
|  System: Posting 1 record...    |
|  Record 10/16 Ranch 1 1A       |
|  MgrHrs: 1.1                   |
|  API Response: 200 OK          |
|  CropManage updated.           |
|  Refreshing dashboard...       |
+=================================+
          |
          | Auto-refresh S3 with new data from API
          v
+==========================================================+
|  CropManage Dashboard (8)              Records Changed (0)|
|----------------------------------------------------------|
|  (fresh data from CropManage — changes confirmed)        |
|----------------------------------------------------------|
| [Reset] [Refresh] [Update] [Post to CropManage] [Save]  |
+==========================================================+

  Queue cleared. Records Changed back to (0).
  S3 shows confirmed data from CropManage.
  Done. Round trip complete.
```

---

## USE CASE 4: Save to JSON (Publish for Other Dashboards)

```
STEP 1: User clicks [Save] in S3 footer
+==========================================================+
| [Reset] [Refresh] [Update] [Post to CropManage] [>>Save<<]|
+==========================================================+
          |
          | Saves displayRecords[] to /data/irrigation-records.json
          v
  /data/irrigation-records.json  ← WRITTEN
          |
          | Now available to:
          +--→ Task Manager (reads JSON, builds tasks from data)
          +--→ Role Manager (filtered views per role)
          +--→ Control Panel (admin overview)
          +--→ Prompt Manager (agents reference this data)
          +--→ Mobile / Field app (offline-capable)
          +--→ Scheduled agents (automated workflows)

  SAVE = PUBLISH
  One save feeds the whole ecosystem.
```

---

## USE CASE 5: Admin Builds & Saves an Agent

```
STEP 1: Admin is in S1, switches to Agents filter
+==========================================================+
| Steve Pappas       Role: Admin  [Online ▼]      [Logout] |
|----------------------------------------------------------|
| [API] [Agents*]                                          |
| +------------------------------------------------------+ |
| | Ranch 1 Weekly Pull      | Ranch 2 Full Refresh      | |
| | Morning Irrigation Check | Post All Pending          | |
| | (empty)                  | (empty)                   | |
| +------------------------------------------------------+ |
|                                                          |
|  (these are agents the admin previously saved)           |
+==========================================================+


STEP 2: Admin switches to API, builds a new multi-step prompt
+==========================================================+
| [API*] [Agents]                                          |
| +------------------------------------------------------+ |
| | >> Get Token <<          | Get Ranches               | |
| +------------------------------------------------------+ |
|----------------------------------------------------------|
| Prompt: [token][ranch:ALL][planting:ALL][irrig_details]  |
| [Get all irrigation details for all ranches]             |
|                                          [Send] [Save]   |
+==========================================================+
          |
          | Admin clicks [Save] instead of [Send]
          v
  Save dialog:
  +----------------------------------+
  | Agent Name: [Morning Full Pull ] |
  | Description: [Pull all irrigation|
  |  data for all ranches at start   |
  |  of day                        ] |
  | [Cancel]              [Save Agent]|
  +----------------------------------+
          |
          v
  Now appears in the Agents grid!
  Any user with right role can click it and run it.


STEP 3: Field worker logs in next day, sees saved agent
+==========================================================+
| Maria Garcia       Role: Field Worker  [Online ▼]        |
|----------------------------------------------------------|
| [API] [Agents*]                                          |
| +------------------------------------------------------+ |
| | >> Morning Full Pull <<  | Ranch 1 Weekly Pull       | |
| | Morning Irrigation Check | (more agents...)          | |
| +------------------------------------------------------+ |
|----------------------------------------------------------|
| Prompt: [Get all irrigation details for all ranches]     |
|                                          [Send]          |
+==========================================================+

  Maria doesn't see [Save] — she's not Admin
  She clicks the agent, clicks Send, data flows to S3
  She works in S3 all day
  Admin built it. User runs it. Same data. Same grid.
```

---

## USE CASE 6: Natural Language via S2 (Chat Assistant)

```
User types in S2 instead of clicking buttons:

+=================================+
|  S2: AI Assistant               |
|---------------------------------|
|  User: Show me all irrigation   |
|        for Ranch 1 this week    |
|                                 |
|  AI: Fetching irrigation data   |
|  for Ranch 1...                 |
|  Found 4 records for this week. |
|  Loading to dashboard.          |
|                                 |
| [Show me Ranch 1 this week] [Send]|
+=================================+
          |
          | AI translates natural language → API call
          | Same result as clicking in S1
          v
+==========================================================+
|  CropManage Dashboard (4)              Records Changed (0)|
|  (filtered to Ranch 1, this week only)                    |
+==========================================================+

  Button path (S1) and chat path (S2) = same result in S3
  User picks their style. Power users type. New users click.
```

---

## THE DATA FLOW — Everything Connects

```
                    ┌─────────────┐
                    │ CropManage  │
                    │   (API)     │
                    └──────┬──────┘
                           │
              api.cropclient.com (George's proxy)
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐     ┌──────▼──────┐   ┌─────▼─────┐
    │ S1      │     │ S2          │   │ Agents    │
    │ API     │     │ Chat/NLP    │   │ Scheduled │
    │ Buttons │     │ Assistant   │   │ Automated │
    └────┬────┘     └──────┬──────┘   └─────┬─────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                    ┌──────▼──────┐
                    │     S3      │
                    │ CropManage  │
                    │ Dashboard   │
                    │ (prod grid) │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐ ┌───▼───┐ ┌─────▼─────┐
        │   S4      │ │ Queue │ │   Save    │
        │ Edit/     │ │ Mark  │ │ to JSON   │
        │ Inspect   │ │ Post  │ │ (PUBLISH) │
        └───────────┘ └───┬───┘ └─────┬─────┘
                          │           │
                    ┌─────▼─────┐     │
                    │ Post Back │     │
                    │ to API    │     │
                    └───────────┘     │
                                      │
                    /data/irrigation-records.json
                                      │
              ┌───────────┬───────────┼───────────┐
              │           │           │           │
         Task Mgr    Role Mgr   Control    Mobile/
                                 Panel     Field
```

---

## WHAT CHANGED FROM v1.4 → v1.5

```
v1.4 (BEFORE)                          v1.5 (AFTER)
========================                ========================
S1: Techie API audit                    S1: Command Center
  - Raw token displayed                   - User/Role login bar
  - 3 mini-grids (Ranch,                  - [API | Agents] grid
    Planting, Recommendations)            - Prompt builder + Save
  - API endpoint URL visible              - Token HIDDEN
  - Irrigation Details table              - Irrigation Details stays
  - Footer: Refresh/Update/Post           - Footer: GONE (moved to S3)

S2: Chat Log (same)                     S2: AI Assistant (same)

S3: "Irrigation Records"               S3: "CropManage Dashboard"
  - Static 12 records                     - Real-time API data
  - No footer buttons                     - Footer: Reset|Action|Save
  - Temp data (lost on refresh)           - Save = PUBLISH to JSON

S4: Field Details (same)                S4: Field Details (same)
  - CRUD buttons → prompt-based           - CRUD buttons → prompt-based
```

---

## ROLES & VISIBILITY

```
+------------------+--------+---------+--------+--------+
|                  | Admin  | Manager | Field  | Viewer |
+------------------+--------+---------+--------+--------+
| S1: API tab      |   YES  |   no    |   no   |   no   |
| S1: Agents tab   |   YES  |   YES   |  YES   |   no   |
| S1: Save Agent   |   YES  |   no    |   no   |   no   |
| S1: Login bar    |   YES  |   YES   |  YES   |  YES   |
| S2: Chat/NLP     |   YES  |   YES   |  YES   |  YES   |
| S3: Dashboard    |   YES  |   YES   |  YES   |  view  |
| S3: Post to API  |   YES  |   YES   |   no   |   no   |
| S3: Save JSON    |   YES  |   YES   |   no   |   no   |
| S4: Edit fields  |   YES  |   YES   |  YES   |   no   |
| S4: CRUD buttons |   YES  |   YES   |  YES   |   no   |
+------------------+--------+---------+--------+--------+
```

---

## THE CROPCLIENT.PRO PROMISE

```
+================================================================+
|                                                                 |
|   "Your operation. Your screens. Your AI."                     |
|                                                                 |
|   1. LOG IN → see YOUR dashboard, YOUR role, YOUR agents       |
|   2. PULL DATA → real-time from CropManage via blessed IP      |
|   3. WORK → edit, queue, post back — all in one screen         |
|   4. BUILD → create agents from prompts, save for your team    |
|   5. SAVE → publish data for every dashboard in the system     |
|   6. LEARN → your AI remembers what works and what doesn't     |
|   7. GROW → factory stamps new screens from your workflows     |
|                                                                 |
|   Admin builds it. User runs it. AI learns it.                 |
|   Same code everywhere. CropClient.pro.                        |
|                                                                 |
+================================================================+
```

---

### Signed Off By
- **Steve Pappas** — CEO, Design Lead
- **Mac** — Lead Programmer (Claude Code)
- **George/Gus** — Server Config, UAT (Claude Desktop)

### Build Priority
1. George: IIS proxy → api.cropclient.com/ping returns JSON
2. Mac: S1 redesign (login bar, API/Agents grid, prompt builder)
3. Mac: S3 rename + footer buttons (Reset|Actions|Save)
4. Mac: Save/Load JSON to /data
5. Mac: Wire to public API
6. Together: Big Banana Test
