# CropClient — Project Doc

**What this is:** the standing explanation of *why CropClient exists*, what the regulation
actually requires, and how the product maps to it. Written to be read cold — a new session,
a new developer, or a new investor should be able to read this file and understand the project
without anyone explaining it.

**Last updated:** August 8, 2026
**Maintainer:** Steve Pappas
**Status:** first version — researched and drafted by Claude Code

---

## 1. The one-paragraph version

California made it illegal to keep over-pumping groundwater. Every grower in a
high- or medium-priority basin is being moved onto a metered water budget, and someone has to
prove — with numbers, every year, to a state agency — that they stayed inside it. CropManage
(the UC Cooperative Extension irrigation science system) already computes what a field
*should* use, based on real evapotranspiration data. CropClient is the layer that turns that
science into an operational record a grower can actually run their farm on and hand to a
regulator: budget vs. actual vs. billed, reconciled, per field, all season.

That is the whole thesis. The mandate creates the paperwork. CropManage has the science.
CropClient closes the gap between them.

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

## 3. The rest of the compliance load

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

## 4. What it costs the industry (the market case)

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

## 5. CropManage — the science layer we build on

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

## 6. Where CropClient fits

### The gap

CropManage tells a grower what a field *should* use. It does not, on its own, produce the
artifact the mandate demands: a defensible, per-field, season-long reconciliation of
**budget vs. actual vs. billed**, in the units and on the deadlines each agency wants.

Meanwhile the grower is standing in the field with a phone, and the compliance data is coming
from three different places that have never agreed with each other.

### The product: three-way reconciliation

```
CropManage budget    →  what the science says the field needed   (ET-driven, per planting)
Grower actual usage  →  what was really applied                  (meter reads, run times)
Water company bill   →  what was delivered and charged           (district / pump records)
```

Getting those three to agree, field by field, all season, *is* the compliance record. It's
also how a grower catches a leaking valve, a miscalibrated meter, or a bill that's wrong —
which is why it sells even to someone who doesn't care about the state.

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

## 7. Open questions

1. **Production API host** — dev vs. prod cutover for CropManage (see §5).
2. **Which basin(s) do we target first?** Salinas Valley (CropManage's installed base, seawater
   intrusion urgency) vs. Tulare Lake / Tule (probation, active state fees, maximum pain).
3. **Does the compliance report have a standard format?** Each GSA and the SWRCB GEARS portal
   may want different fields. Need to see actual required forms before designing output.
4. **Where does water-company billing data come from?** Third leg of the reconciliation — API,
   CSV, PDF, or manual entry? This is unresolved and it gates the core value prop.
5. **Does CropManage itself expose a water-budget/applied-water report?** Research didn't
   confirm one. If it does, we integrate; if it doesn't, that absence is our product.
6. **Per-basin de minimis thresholds** — varies by order (see §2).

---

## 8. Research limitations — read this before trusting a number

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

## 9. Sources

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
