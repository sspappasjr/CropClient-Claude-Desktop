# CropClient — Project Doc

**What this is:** the standing explanation of *why CropClient exists*, what the regulation
actually requires, and how the product maps to it. Written to be read cold — a new session,
a new developer, or a new investor should be able to read this file and understand the project
without anyone explaining it.

**Last updated:** August 8, 2026
**Maintainer:** Steve Pappas
**Status:** first version — researched and drafted by Claude Code

---

## Prompt — reusable

<details>
<summary>The prompt that generates this document. Re-run it to refresh the research.</summary>

```
Research California's agricultural water mandate and CropManage (UC ANR), then write the
standing project doc for CropClient. Write it to be read COLD -- someone with no context
should understand the project from this file alone.

Cover, in this order:
  1. One-paragraph thesis, then the product vision.
  2. The mandate. Frame it accurately: there is NO statewide blanket percentage cut for
     farms. SGMA requires local agencies to bring basins into balance by 2040/2042, and
     the GSA passes that down to the grower as an ALLOCATION. Use the words "water budget"
     and "allocation," never "statewide water reduction mandate."
  3. THE REPORTING -- this is the product, not a byproduct. Both tiers: what the GSA
     requires (allocation, carryover, transfers, penalties) and what the State Water Board
     requires via GEARS (per well, per month, acre-feet, water year). Include the required
     fields.
  4. Adjacent obligations that draw on the same records: nitrogen (INMP/TNA) and surface
     water diversion (SB 88).
  5. Market sizing and economics.
  6. CropManage: what it is, who funds it, what it computes, and the API endpoints this
     repo actually calls -- read them from the source, not from the vendor's docs.
  7. Where CropClient fits, and the competitive landscape.
  8. Open questions, ordered by what BLOCKS the reporting product.

Rules:
  · Read the repo first. Ground the API and data-flow sections in the actual code.
  · Cite sources. Flag every number you could not verify against a primary source.
  · Where sources disagree, show both figures and mark the conflict.
  · Note research limitations honestly at the end.
```

</details>

---

## 1. The one-paragraph version

California made it illegal to keep over-pumping groundwater. Every grower in a
high- or medium-priority basin is being moved onto a metered water budget, and someone has to
prove — with numbers, every year, to a state agency — that they stayed inside it. CropManage
(the UC Cooperative Extension irrigation science system) is the system of record: it computes
what a field *should* use from real evapotranspiration data, and it holds what was actually
applied. CropClient is the field-side layer that captures the real meter reading at the valve
and writes it back into CropManage's Applied Hours — so the record is complete, current, and
defensible instead of half-filled from memory at the end of the week.

That is the whole thesis. The mandate creates the paperwork. CropManage has the science and
the system of record. CropClient makes sure the actuals actually get in there.

### The vision (Steve, August 2026)

> **CropClient is the grower's complete budget, actual, and reporting system — with history,
> feedback, and follow-up.**

Three things in that sentence, and the third is the one everybody else skips:

| | | |
|---|---|---|
| **Budget** | what you're allocated and what the science says you need | forward-looking |
| **Actual** | what you really applied, captured in the field | present tense |
| **Reporting** | what the state and the GSA require, produced from the above | the obligation |

Then the part that makes it a *system* rather than a form:

- **History** — a season-over-season record. Not just this year's filing, but the trail that
  shows a pattern, defends a number, and supports an appeal or a carryover claim.
- **Feedback** — the grower sees budget vs. actual *while there's still time to act*, not in a
  filing at the end of the year when it's too late to change anything.
- **Follow-up** — the system chases the missing entry. An irrigation event with no Applied
  Hours is a hole in the compliance record; the software should know it's there and ask.

Everything below serves that. Section 3 is the requirement it has to satisfy.

---

## 2. The mandate — SGMA

### Say it accurately

**There is no single statewide blanket "cut your water by X%" mandate for California farms.**
Anyone who says there is will lose credibility with a grower in about ten seconds, because the
grower knows better.

What actually exists is a **water-budget and sustainability mandate**: SGMA requires *local*
agencies to bring their groundwater basins into balance by 2040 (or 2042), and it is that
local, basin-by-basin balancing that forces the cuts to agricultural pumping. The obligation
lands on the GSA; the GSA passes it to the grower as an **allocation**.

The practical consequence for the grower is the same as a mandate — a metered budget, a
reporting duty, and a bill if you go over — but the mechanism is local allocation under state
supervision, not a state percentage. **Our language should always be "water budget,"
"allocation," and "sustainability mandate," never "statewide water reduction mandate."**

### What it is

The **Sustainable Groundwater Management Act (SGMA)**, enacted in 2014, is the first law in
California history to regulate groundwater. Before SGMA, if you owned the land, you pumped
what you wanted. SGMA ended that.

The structure:

- The state designates groundwater basins by priority (high / medium / low / very low).
- High- and medium-priority basins must form a **Groundwater Sustainability Agency (GSA)**.
- Each GSA writes a **Groundwater Sustainability Plan (GSP)** showing how the basin reaches
  balance.
- The Department of Water Resources (**DWR**) reviews the plans.
- If the local plan fails, the **State Water Resources Control Board (SWRCB)** takes over.

### The deadlines that matter

| Milestone | Date |
|---|---|
| GSPs due — critically overdrafted basins | January 31, 2020 |
| GSPs due — other high/medium priority basins | January 31, 2022 |
| **Sustainability achieved — critically overdrafted basins** | **2040** |
| **Sustainability achieved — other high/medium basins** | **2042** |

2040 is not a soft target. It is the date by which pumping must actually be in balance, and
GSAs are stepping allocations down on interim milestones to get there. The cuts are happening
now, not in 2039.

### Scale

- **21 basins** are designated critically overdrafted, 8 of them in the San Joaquin Valley.
- **261 GSAs** formed across ~140 basins; 116 GSPs submitted, ~85% approved or conditionally
  approved (as of 2024).
- First real pumping limits began landing in **2026**.

### Teeth: probation

When DWR finds a plan inadequate, the State Water Board can designate the basin
**probationary**. That is the moment the state, not the local agency, starts collecting from
individual growers:

- **$300 per well**, plus
- **~$20 per acre-foot** pumped in probationary basins (up to ~$25/AF in unmanaged areas)
- Extractors above a volume threshold must install **certified flow meters**
- **Monthly** extraction tracking, filed **annually** with the State Water Board via the
  GEARS portal
- If deficiencies aren't cured within a year, the Board can impose an **interim management
  plan** — the state running the basin directly

Probation history so far:

| Subbasin | Status |
|---|---|
| **Tulare Lake** | First basin ever placed on probation — April 16, 2024 |
| **Tule** | Placed on probation September 2024 (with exceptions) |
| **Kaweah** | Hearing held; returned to DWR oversight |
| **Chowchilla** | Returned to DWR oversight (2025) |
| **Kern** | Hearing continued to Sept 2025; avoided probation, sent back to DWR |
| **Delta-Mendota, Pleasant Valley** | Awaiting hearings |

**Litigation:** the Kings County Farm Bureau sued the State Water Board, and a Kings County
Superior Court judge issued a preliminary injunction that delayed penalties/fees on Tulare
Lake growers. The legal fight over whether the state can charge individual farmers directly is
live and unresolved.

**2026 reporting dates in play:** initial extraction reports due to SWRCB **February 1, 2026**;
extraction reports covering July 15, 2024 – September 30, 2025 due **May 1, 2026**. Press
coverage in April 2026 reported the state's GEARS reporting portal buckling under load — one
irrigation district GSA reported only 4 of 50 landowner uploads succeeding.

> **That portal failure is the product opportunity in miniature.** The state built a form.
> Nobody built the system that produces the number that goes in the form.

### De minimis exemption

Under SGMA statute, a **de minimis extractor** — 2 acre-feet/year or less, domestic use only —
is exempt from extraction reporting and fees, but should still notify the Board through GEARS
to avoid compliance notices. Note: individual probationary-basin orders have used *different*
volume thresholds for exclusion (a 20 AF/year figure appears in reporting on Tulare Lake, and
the Tule Subbasin has a separate "minimal impact exclusion"). **Per-basin thresholds must be
checked per basin — do not hard-code 2 AF.**

---

## 3. The reporting — this is the product

Everything else in this document is context. **This section is the requirement.** If CropClient
produces these outputs correctly, from a record the grower trusts, the product works.

Reporting comes in two tiers, and a grower can be subject to both at once.

### Tier 1 — to your GSA (routine, every managed basin)

This is the water-budget machinery, run locally at **parcel / farm-unit precision**:

- An **allocation** is issued per parcel or farm unit
- **Pumping is reported against it**
- **Carryover credits** — SGMA expressly lets a GSA allow unused allocation to carry from one
  year into the next
- **Voluntary transfers** — allocation can be traded between growers where the GSA permits it
- **Overdraft penalties** — example from South Fork Kings GSA: **$500 per acre-foot** over
  allocation, *and* the following year's allocation is reduced by the exact amount of the
  overage
- Growers receive **annual statements** of their water account

> Read that penalty structure twice. An acre-foot you can't account for costs $500 **and** is
> subtracted from next year. Conversely, an acre-foot you *save and can prove* becomes a
> carryover credit — an asset. Accurate records have value in both directions. That is the
> economic argument for this product, and it doesn't depend on anyone caring about regulation
> for its own sake.

### Tier 2 — to the State Water Board, via GEARS

Required for extractors in **probationary basins** and in **unmanaged areas**. Filed annually
for the preceding water year through the **Groundwater Extraction Annual Reporting System
(GEARS)** portal.

The annual extraction report must identify:

| Required field | Notes |
|---|---|
| **Well owner information** | registered account holder |
| **Well location** | plotted and described |
| **Well capacity** | maximum rate, **gallons per minute** |
| **Monthly extraction volumes** | **per well, per month**, for the water year |
| **Place(s) of use** | where the water went |
| **Purpose(s) of use** | irrigation, domestic, etc. |

**Measurement rules:**

- Volumes must be measured by a device or method **satisfactory to the State Water Board**
- In the Tule Subbasin: measurement required from **Jan 1, 2025**; extractors pumping
  **>500 AF/yr** must use **certified flow meters** — or a Board-approved alternative — from
  **March 1, 2025**
- The Board has approved **evapotranspiration-based methods** as an alternative for tracking
  some large extractions *(note: that is CropManage's native domain)*
- Meter readouts in **acre-feet, cubic feet, or gallons**; meters must be installed,
  maintained, operated, inspected and monitored for accuracy
- **De minimis** (≤2 AF/yr, domestic only) are exempt — but should still notify the Board
  through GEARS or they'll keep receiving compliance notices

### ⚠️ The core engineering problem

The two systems do not speak the same units:

```
The mandate's unit:     acre-feet   per WELL      per MONTH,  tied to a place of use
CropManage's unit:      hours       per PLANTING  per EVENT,  tied to a field
```

**Bridging those is the central technical work of this project.** It requires, at minimum:

1. **Hours → volume** — flow rate per irrigation system/block, applied to run time
2. **Planting → well** — which well(s) served which planting; a many-to-many mapping that
   CropManage may not hold at all
3. **Event → month** — roll up by water year, not calendar year
4. **Field → place of use** — parcel/APN mapping for the GEARS record

Item 2 is the one to worry about. CropManage is organized around ranches and plantings;
GEARS is organized around **wells**. If that mapping doesn't exist in CropManage, **CropClient
has to own it** — and that is arguably the single most defensible piece of the product,
because whoever holds the well↔planting map is the only one who can produce the report.

### What a finished report needs to survive

A filing is only as good as its defensibility. The record behind it should carry:

- Who entered the number, and when (`updatedBy`, `lastUpdatedDate` — already in our records)
- What the recommendation was vs. what was applied (`mgrHours` vs. `appliedHours`)
- The measurement method used for each well
- An audit trail of corrections, not silent overwrites
- Gaps flagged rather than hidden — a missing Applied Hours entry is a known hole, not a zero

---

## 4. The rest of the compliance load

SGMA is the headline, but a Central Coast or Central Valley grower is carrying more than one
reporting obligation. Any of these is a hook for the same underlying field data.

### Surface water — SB 88 (2015)

Anyone diverting **more than 10 acre-feet/year** of surface water must measure and report
timing, rate, and volume of diversions to the State Water Board.

- Accuracy required: **±10–15%**, depending on right size
- Monthly recording, annual electronic filing
- Phase-in began Jan 1, 2017 for rights ≥1,000 AF/yr
- Large diverters must publish **daily telemetered** data, updated at least weekly

### Nitrogen — Irrigated Lands Regulatory Program (ILRP)

Administered by the Regional Water Quality Control Boards (Central Coast Region 3, Central
Valley Region 5). Growers must file:

- **Total Nitrogen Applied (TNA) report** — N from fertilizer, organic amendments, compost,
  *and irrigation water*
- **Irrigation & Nitrogen Management Plan (INMP) summary report** — applied vs. removed at
  harvest
- In **high vulnerability areas** for nitrate leaching, the INMP must be **certified** —
  either by a certified professional or by grower self-certification through CDFA's training
  and exam (80% pass, 3 hrs continuing ed per 3 years)

**Why this matters to us:** nitrogen applied *through irrigation water* is a TNA line item.
Water records and nitrogen records are the same records. CropManage already computes both.
This is the second mandate CropClient can serve off one dataset.

### Agricultural Water Management Plans

Water suppliers serving **>25,000 irrigated acres** must adopt and submit an AWMP to DWR —
which pushes measurement and reporting demands *down onto their grower customers*. This is a
channel: the district needs the data, the grower has to produce it.

---

## 5. What it costs the industry (the market case)

PPIC's analysis of the San Joaquin Valley:

- Farm water availability drops **~3.15 million acre-feet by 2040** — about **20% of current
  supply**. SGMA alone accounts for **2.7 maf** of that.
- **~500,000 acres** must come out of fully irrigated production even under optimistic
  supply-augmentation scenarios.
- Without new supply or water trading: **~900,000 acres** fallowed.
- Economic hit: **$4.5 billion** in farm GDP, **50,000 jobs**.

The read: every acre-foot a grower can document, defend, or avoid wasting has direct dollar
value. Water is moving from a fixed cost of doing business to a *traded, metered, penalized*
input. Software that measurably reduces applied water while producing the compliance record
is selling into a market that is being created by law.

---

## 6. CropManage — the science layer we build on

**What it is:** a free, web-based irrigation and nitrogen management decision support tool from
**UC Cooperative Extension / UC ANR**, developed by **Michael Cahn**, funded by **CDFA's
Fertilizer Research and Education Program (FREP)**. First released **2011** for lettuce on the
Central Coast; since expanded to many crops and into the Central Valley.

**How it computes:**

- Crop water need from **CIMIS** evapotranspiration (ETo) data
- Multi-year local research models for crop growth and N uptake
- Soil nitrate quick test to adjust fertilizer recommendation
- Outputs: **when to irrigate, how long to run, how much N to apply**

**Structure:** grower creates a **Ranch** → adds **Fields/Plantings** → confirms soil type →
associates **weather stations** and **water sources** → logs **irrigation events**.

**Crops:** strawberries, raspberries, broccoli, cauliflower, cabbage, celery, spinach, bell
peppers, cilantro, lettuce (head/romaine/leaf/baby), and more.

**Geography:** Salinas Valley / Central Coast origin, expanding into the San Joaquin Valley
and Tulare Lake Basin. Note that the Salinas Valley 180/400-foot aquifer is itself
**critically overdrafted** with seawater intrusion **more than five miles inland** — CropManage's
home turf is under the same mandate as the Valley.

### The API — what we actually consume

Register at `cropmanage.ucanr.edu`, then authenticate with username/password to receive an
`access_token` used on subsequent requests. v2 methods are prefixed `/v2/`; UC ANR recommends
v2 over the older methods, which are being phased out. Our code also calls `/v3/`.

Endpoints in use in this repo:

| Purpose | Call |
|---|---|
| Auth | `POST /Token` |
| Ranches | `GET /v2/ranches.json` |
| Plantings for a ranch | `GET /v2/ranches/{ranchGuid}/plantings.json` |
| Irrigation events + recommendations | `GET /v2/plantings/{plantingId}/irrigation-events/details.json` |
| Single event | `GET /v2/irrigation-events/{eventId}.json` |
| Create event | `POST /v3/plantings/{plantingId}/irrigation-events.json` |
| Update event | `PUT /v3/irrigation-events/{eventId}.json` |

> ⚠️ **Open item:** every base URL in the repo points at **`api.dev.cropmanage.ucanr.edu`** —
> the *development* server. The production host and the cutover plan need to be confirmed and
> documented before any customer runs on this.

---

## 7. Where CropClient fits

### How the data actually flows

*(Corrected August 8, 2026 per the CropManage program manager, and confirmed against
`irrigation-component.js` in this repo. An earlier draft of this doc got this wrong.)*

**CropManage already tracks actual water usage.** It is not recommendation-only. Growers record
usage in the field and it goes into the **Applied Hours** field on CropManage's online data
entry form. So CropManage holds *both* legs — what was recommended and what was applied.

CropClient's job is **field-side capture and write-back**:

```
1. CropManage  →  recommendation           (ET/CIMIS-driven, per planting)
2. CropClient  →  create_next_irrigation   (next event from last record + interval;
                                            recommended hours land in Manager Hours)
3. CropClient  →  read_meter               (finds the LAST record for the selected
                                            ranch/planting, selects it, and prompts the
                                            Applied Hours field — the person types the
                                            number in; it does not read a device)
4. CropClient  →  update_record            (writes mgrHours + appliedHours, status = -1)
5. CropClient  →  sync                     (batch all status = -1 → POST new / PUT existing
                                            into CropManage's Applied Hours via /v3/)
```

Our grid mirrors CropManage's data entry form field-for-field — `scheduledDate`, `interval`,
`mgrHours`, `appliedHours` — which is why the sync is a straight write rather than a
translation layer.

### Where the value is

The mandate needs a complete, current record of applied water. CropManage has the right field
for it. The friction is **getting the number in there** — today that means someone remembers
the meter reading and types it into a web form back at the office, later, from memory or a
scrap of paper.

CropClient's value is closing that loop at the point of work:

- **Capture at the point of work**, on a phone, by the person who turned the water on —
  `read_meter` puts the right record on screen with the Applied Hours field waiting, so
  there's nothing to search for and nothing to remember later
- **Manager Hours vs. Water Applied** side by side — planned vs. real, visible immediately
- **Batch sync** so field entry is offline-tolerant and reconciles later
- **Natural language** via ClientAI, so a field worker talks instead of navigating forms

A record that's actually complete is what makes the compliance report possible. Incomplete
Applied Hours is the difference between a defensible filing and a guess.

### The third leg (Steve's additional layer)

Beyond what CropManage holds, the **water company / district bill** is a third number:

```
Recommended (CropManage)  →  what the science said the field needed
Applied     (CropManage)  →  what the meter says went on           ← CropClient puts it here
Billed      (district)    →  what was delivered and charged        ← not in CropManage
```

Reconciling billed against applied is how a grower catches a leaking valve, a miscalibrated
meter, or a wrong invoice. That leg lives outside CropManage and is CropClient's own
differentiator — and its data source is still an open question (see §8).

### Architecture as built (see `OurCropClientState.md`)

- **CropManage** — system of record for irrigation truth
- **CropClient** — interaction and automation layer: mobile, web, grids, CRUD
- **ClientAI** — controlled natural-language layer, mapped to approved MCP tools only
- **MCP server** (stdio) + **HTTP API server** (`JsonCrudAPI.js`) + MongoDB, with a
  JSON → MongoDB → SQL Server storage evolution
- The **crown jewel** tool is `create_irrigation_recommendation` — block + date in,
  recommended inches/minutes + budget status out. ClientAI must never fabricate a
  recommendation and must read current data before calling.

Note that `budget_status` is already an output field of the crown jewel tool. **That field is
where the mandate lives in the product.** It is the thing worth building out.

### Product concept — the Grower Almanac

*(Steve, August 2026)*

An online almanac scoped to **the grower's selected planting**. Pick a planting, get its whole
season on one page: what the crop needs, what it has had, where it stands against budget, and
every date that matters between now and harvest.

Why it fits: it takes the same data the compliance record is built from and turns it into
something a grower actually *wants* to open. Compliance is a thing you must do; an almanac is a
thing you check. The almanac is the daily habit that keeps the record complete — which is
exactly what the filing needs.

Candidate contents for a planting almanac:
- Crop stage and days since planting
- ET demand to date vs. water applied to date
- Position against allocation, and which tier that puts the planting in
- Next recommended irrigation, and the last one recorded
- Any irrigation event still missing an Applied Hours entry
- Nitrogen applied to date against the plan
- The dates ahead: next filing, allocation statement, expected harvest window

### Competitive landscape

- **Groundwater Accounting Platform** — state-supported, open-source, built with DWR and the
  California Water Data Consortium; pilots at Rosedale–Rio Bravo, Yolo County FC&ID, Merced
  Irrigation-Urban GSA, Pajaro Valley WMA. **Aimed at GSAs, not growers.**
- **GSA Water Dashboard** — commercial SGMA platform for GSAs: allocation tracking, pumping
  reports, compliance workflow.
- **AgWaterAI** — sensors + water budgets + SGMA reports.

**The positioning gap:** the funded, mature tools are built for the *agency* — the regulator's
side of the meter. CropClient is on the *grower's* side, and it is the only one sitting on top
of UC's actual agronomic recommendation engine. "The agency's dashboard tells you what you
owe. CropClient tells you what to do about it, and proves you did."

---

## 8. Open questions

**Blocking — these gate the reporting product:**

1. **Does CropManage hold a well ↔ planting mapping?** GEARS reports **per well**; CropManage
   is organized **per planting**. If that link doesn't exist upstream, CropClient must own it.
   *This is the highest-value unknown in the project* — answer it first.
2. **Where does hours → acre-feet conversion come from?** Flow rate per block / irrigation
   system. Does CropManage store it, do we, or does the grower enter it? Without this there is
   no report, because the state does not accept hours.
3. **Does CropManage expose a water-budget / applied-water *report*?** It holds the data
   (Applied Hours), but whether it produces a season-total, per-field, acre-feet output in a
   form a GSA will accept is unconfirmed. If it does, we feed it. If it doesn't, that report is
   ours to build.

**Important — shape the product:**

4. **What does the target GSA actually require?** Allocation basis, carryover rules, transfer
   rules, penalty schedule, statement format, filing deadline. These vary by GSA and are the
   real spec for Tier 1 output (§3).
5. **Will a GSA accept a grower-generated report**, or must everything go through the agency's
   own portal? Determines whether we produce a filing or a defensible worksheet behind one.
6. **Which basin(s) do we target first?** Salinas Valley (CropManage's installed base, seawater
   intrusion urgency, SVBGSA covers six subbasins) vs. Tulare Lake / Tule (probation, active
   state fees and GEARS filing, maximum pain).
7. **Where does water-company billing data come from?** Third leg of the reconciliation — API,
   CSV, PDF, or manual entry?
8. **Per-basin de minimis and exclusion thresholds** — vary by order (see §2).

**Worth confirming:**

9. **Production API host** — dev vs. prod cutover for CropManage (see §6).
10. **Is CropManage's ET method itself a Board-approved measurement alternative?** The Board
    has approved ET-based methods for some large extractions. If CropManage's ET modeling
    qualifies, that is an extraordinarily strong position — the science tool becomes an
    accepted *measurement device*. Needs verification with the Board and with UC ANR.

---

## 9. Research limitations — read this before trusting a number

This document was assembled under a restricted network. The environment's egress proxy
**blocked direct page fetches** to `cropmanage.ucanr.edu`, `api.cropmanage.ucanr.edu`,
`cropclient.com`, `ucanr.edu`, and `waterboards.ca.gov` (403 at the proxy tunnel). Everything
above came from **web search results and summaries**, plus **source code and docs already in
this repo** — not from reading the primary agency pages directly.

Consequences:

- Dates, dollar figures, and basin statuses are **as reported in search results** and should be
  verified against the State Water Board and DWR before going into marketing copy, a filing, or
  a customer commitment.
- Numbers where sources disagreed are flagged inline ($20 vs. $25/AF; 2 AF vs. 20 AF de
  minimis).
- Post-2025 items (2026 deadlines, Kern outcome, GEARS portal problems) are the least verified.

**To fix:** allow those domains in the environment's network policy
(claude.ai/code → environment settings), and this can be re-run against primary sources.

---

## 10. Sources

CropManage / UC ANR:
- [CropManage — UC ANR Irrigation and Nutrient Management](https://ucanr.edu/site/irrigation-and-nutrient-management/cropmanage)
- [Let's Get Started with CropManage — Knowledge Base](https://help.cropmanage.ucanr.edu/2021/12/17/lets-get-started-with-cropmanage/)
- [CropManage API Documentation](https://api.cropmanage.ucanr.edu/help)
- [CDFA FREP — CropManage brochure (PDF)](https://www.cdfa.ca.gov/is/ffldrs/frep/pdfs/CropManageBrochureweb.pdf)
- [FREP — Benefits of CropManage in the Central Valley](https://blogs.cdfa.ca.gov/FREP/index.php/research-update-benefits-of-cropmanage-for-optimum-irrigation-and-nitrogen-management-in-central-valley/)
- [Field evaluations of the CropManage decision support tool — ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0378377423002664)

SGMA:
- [What is SGMA? — State Water Board](https://www.waterboards.ca.gov/sgma/about_sgma.html)
- [SGMA — State Water Resources Control Board](https://www.waterboards.ca.gov/sgma/)
- [SGMA Reporting and Fees](https://waterboards.ca.gov/sgma/reporting_and_fees.html)
- [Groundwater Basins — State Water Board](https://www.waterboards.ca.gov/sgma/groundwater_basins/)
- [Tulare Lake Subbasin Updates](https://www.waterboards.ca.gov/sgma/groundwater_basins/tulare_lake_subbasin_updates.html)
- [Tule Subbasin — Minimal Impact Exclusion FAQ (PDF)](https://www.waterboards.ca.gov/sgma/docs/tule/20260408-tule-min-impact-faq.pdf)
- [SGMA — DWR](https://water.ca.gov/programs/groundwater-management/sgma-groundwater-management)
- [Critically Overdrafted Basins — DWR](https://water.ca.gov/programs/groundwater-management/bulletin-118/critically-overdrafted-basins)
- [Spring SGMA Snapshot: Plans, Probation, Litigation, Legislation — AALRR](https://www.aalrr.com/newsroom-alerts-4129)
- [SGMA at 10 Years — Allen Matkins](https://www.allenmatkins.com/real-ideas/sgma-at-10-years-navigating-californias-groundwater-future.html)
- [State puts second SJV groundwater basin on probation — SJV Water](https://sjvwater.org/state-puts-second-san-joaquin-valley-groundwater-basin-on-probation/)
- [Kern Subbasin Saved from Probation — Valley Ag Voice](https://www.valleyagvoice.com/kern-subbasin-saved-from-probation/)
- [Kings County judge rules against state Water Board — Hanford Sentinel](https://hanfordsentinel.com/kings-county-judge-rules-against-state-water-board-in-high-stakes-groundwater-case/article_7e60c7b0-747a-11ef-9880-c38be57909a3.html)
- [California Groundwater Portal Grinds to a Halt as Deadline Approaches — GV Wire](https://gvwire.com/2026/04/14/california-groundwater-portal-grinds-to-a-halt-as-deadline-for-farmers-approaches/)
- [Groundwater Pumping Allocations under SGMA — EDF (PDF)](https://www.edf.org/sites/default/files/documents/edf_california_sgma_allocations.pdf)

Reporting requirements (§3):
- [GEARS — Groundwater Extraction Annual Reporting System portal](https://gears.waterboards.ca.gov/QuickReporting)
- [GEARS User Guide (PDF)](https://www.waterboards.ca.gov/water_issues/programs/sgma/docs/gears-user-guide.pdf)
- [GEARS Resources — State Water Board](https://waterboards.ca.gov/water_issues/programs/gmp/gears_resources.html)
- [Measuring Groundwater — State Water Board (PDF)](https://waterboards.ca.gov/water_issues/programs/sgma/docs/reporting/measuring_gw.pdf)
- [Notice of Groundwater Extraction Reporting — Tule Subbasin (PDF)](https://www.waterboards.ca.gov/sgma/docs/tule/tule-reporting-letter-en.pdf)
- [New SGMA Reporting Requirements for Tule Subbasin Extractors — Maven's Notebook](https://mavensnotebook.com/2024/10/10/notice-new-sgma-reporting-requirements-for-groundwater-extractors-in-the-tule-subbasin/)
- [SFKGSA Groundwater Allocation Policy FAQs — South Fork Kings GSA](https://southforkkings.org/sfkgsa-groundwater-allocation-policy-faqs/)
- [Non-De Minimis Well Metering & Reporting Program — Santa Clarita Valley GSA](https://scvgsa.org/well-metering-reporting-program/non-de-minimis/)
- [Salinas Valley Basin GSA — regulatory fee process](https://svbgsa.org/regulatory-fee-process/)

Surface water / nitrogen:
- [Water Measurement and Reporting Regulation — State Water Board](https://www.waterboards.ca.gov/waterrights/water_issues/programs/diversion_use/water_measurement.html)
- [SB 88 Measurement Infographic — Brownstein (PDF)](https://www.bhfs.com/Templates/media/files/SB%2088%20Measurement%20Infographic_123016.pdf)
- [TNA Report / INMP Summary Report — Central Coast Water Board](https://www.waterboards.ca.gov/rwqcb3/water_issues/programs/ilp/tna_inmp.html)
- [Irrigated Lands Program — Central Coast Water Board](https://www.waterboards.ca.gov/centralcoast/water_issues/programs/ilp/)
- [Irrigation & Nitrogen Management Plan — Kings River WQC](https://kingsriverwqc.org/inmp/)

Economics / market:
- [Water and the Future of the San Joaquin Valley — PPIC (PDF)](https://www.ppic.org/wp-content/uploads/water-and-the-future-of-the-san-joaquin-valley-overview.pdf)
- [Managing Water and Farmland Transitions in the San Joaquin Valley — PPIC](https://www.ppic.org/publication/managing-water-and-farmland-transitions-in-the-san-joaquin-valley/)
- [The Future of Agriculture in the San Joaquin Valley — PPIC](https://www.ppic.org/publication/policy-brief-the-future-of-agriculture-in-the-san-joaquin-valley/)
- [Salinas Valley Seawater Intrusion — SVBGSA](https://svbgsa.org/resources/seawater-intrusion/)

Competitive:
- [Groundwater Accounting Platform — CA Water Data Consortium](https://cawaterdata.org/projects/groundwater-accounting-data-reporting-pilot-project/)
- [California Water Agencies Collaborate on Groundwater Digital Platform — DWR](https://water.ca.gov/News/News-Releases/2022/Dec-22/California-Water-Agencies-Collaborate-on-Groundwater-Digital-Platform)
- [GSA Water Dashboard](https://sgmawaterdashboard.com/)
- [AgWaterAI](https://agwaterai.com/)
