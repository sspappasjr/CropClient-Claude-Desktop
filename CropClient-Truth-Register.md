# CropClient — Truth Register

**What we can actually stand behind, and what we cannot.**

This is the document that keeps us honest with growers. Every regulatory claim we make in a
deck, on a web page, or in a room with a grower must trace back to a row in this table.

**Last verification pass:** August 8, 2026
**Method:** cross-checking each claim across multiple independently-worded web searches and
requiring convergence. **No primary agency page was read directly** — network egress to
waterboards.ca.gov, water.ca.gov, ucanr.edu and every other external host is blocked in this
environment. That ceiling applies to everything below.

---

## Prompt — reusable

<details>
<summary>The prompt that generates this register.</summary>

```
Verify every regulatory claim in the CropClient briefing. For each one, run multiple
independently-worded searches and require the sources to CONVERGE before upgrading its
status. Where sources disagree or a claim rests on a single source, say so plainly.

Classify each claim:
  CONFIRMED   -- multiple independent sources agree, wording consistent
  SUPPORTED   -- credible but thin; usable internally, cite carefully
  UNVERIFIED  -- single source, or post-cutoff, or contradicted. DO NOT REPEAT.
  CORRECTED   -- we had it wrong; state the correction and what it changes

Note the verification ceiling honestly: if primary sources could not be read directly,
say so at the top and do not let any claim be graded as if they had been.

Rank findings by what changes the product or the sales story, not by topic.
```

</details>

---

## Status levels

| Level | Meaning | Use |
|---|---|---|
| **CONFIRMED** | Multiple independently-worded searches converge; wording consistent across sources | Usable with a grower |
| **SUPPORTED** | Credible, but resting on one source or one basin's documents | Usable internally; verify before external use |
| **UNVERIFIED** | Single source, post-cutoff, or contradicted | **Do not repeat to anyone** |
| **CORRECTED** | We had it wrong | Fix downstream documents |

---

## 1. Corrections — we had these wrong

These changed on verification. They matter more than the confirmations, because they were
already in our documents.

### ⚠️ CORRECTED — Allocations are tiered, not a single flat number

**What we said:** a grower gets an allocation of X acre-feet per acre.

**What's actually true:** real GSA allocations are **banded**, with a free tier, one or more
paid tiers, and a penalty tier above that.

| GSA | Structure |
|---|---|
| **Greater Kaweah GSA** | 0.83 AF/acre at no cost · +0.83 AF/acre tier 1 (fee) · +1.04 AF/acre tier 2 (higher fee) = **2.7 AF/acre total** |
| **East Kaweah GSA** (WY2023) | Penalty tier 1 begins at 1.15 AF/acre · **hard cap 2.5 AF/acre** |
| **Kern Subbasin** | Native groundwater supply estimated at ~0.15 AF/yr — scarcity of a different order |

**What this changes in the product:** the water ledger is not `allocation − used = balance`. It
is a **tiered account** where each acre-foot is priced by which band it falls in, and there may
be a hard cap that cannot be exceeded at any price. Gap alerting has to say *which tier you are
about to cross*, not just whether you are over. This is a real design requirement and we would
have built it wrong.

### ⚠️ CORRECTED — Salinas Valley has not adopted basin-wide pumping allocations

**What we said:** the Rancho Del Sol example put a per-acre allocation on a Salinas Valley farm.

**What's actually true:** SVBGSA is pursuing **projects** — aquifer storage and recovery
(estimated $278–383M), expansion of the Castroville Seawater Intrusion Project (~$60M) — rather
than basin-wide grower allocations. Searches found no adopted allocation program applying to
growers basin-wide.

**What this changes:** the worked example's *basin* is wrong for an allocation story. The
allocation machinery is real in the **Kaweah and Tule subbasins**, not yet in Salinas. Either
move the example to Kaweah/Tule, or reframe Salinas as "projects now, allocations later" — but
do not tell a Salinas grower he has an allocation today.

**Note the tension this creates:** CropManage's installed base is the Central Coast; the binding
allocation pressure is in the San Joaquin Valley. That is a real strategic question, not a
detail.

---

## 2. The finding that matters most

### ✅ CONFIRMED — There is a documented pathway for ET-based reporting, with stated criteria

This was our most speculative claim. It is now the strongest thing in the register.

For the **Tule Subbasin**, the State Water Board's own framework provides:

- Extractors above **500 AF/yr** who do not already have meters **may propose an alternative
  approach** to measure or estimate extractions, for the Board's consideration.
- **The Board has approved evapotranspiration methods** as an alternative approach for tracking
  some large extractions.
- Certified flow meters are required from **March 1, 2025** for >500 AF/yr — but that
  requirement applies to **wells whose uses cannot be measured by ET methodology**.

**The Board's stated evaluation criteria** for an ET alternative:

| The Board asks | CropManage's answer |
|---|---|
| Is it reliable and accurate? | Multi-year UC field research, published validation |
| Does it rely on readily verifiable information — e.g. publicly available ET models? | **CIMIS** — the state's own ET network |
| Is groundwater extracted for uses **not** captured by ET? | Known per planting |
| Are sufficient details about **crop irrigation and irrigation efficiency** provided? | This is literally what CropManage models |
| Are contributions of **precipitation and other sources** to consumptive use accounted for? | Part of the ET water balance |

**Read that table again.** The Board published the criteria for an acceptable ET-based
alternative, and they describe CropManage. Independently, OpenET satellite ET is already
accepted for water-use reporting to the State Board under the **Delta Alternative Compliance
Plan** (launched March 16, 2023, Central and South Delta Water Agencies), with research showing
ET-based irrigation estimates agreeing with reported withdrawals at a **1.6–4.9% bias** on a
growing-season timescale.

**Careful — two separate threads, don't merge them:** the Delta ACP is *surface water diversion*
reporting; the Tule provision is *groundwater extraction* under SGMA. Both point the same way,
but they are different programs. Do not tell a grower the Delta plan covers his well.

**What this is worth:** a grower above 500 AF/yr facing certified-meter installation may have a
software alternative. That is a sales conversation with a hard dollar number attached, and it
positions CropClient as a *measurement pathway*, not just a record-keeper. **Confirm directly
with the State Water Board before selling it.**

---

## 3. Confirmed — usable with a grower

| Claim | Status | Notes |
|---|---|---|
| SGMA enacted 2014; GSAs form plans, DWR reviews, State Board intervenes on failure | **CONFIRMED** | Statutory structure |
| Plan deadlines: Jan 31 2020 (critically overdrafted), Jan 31 2022 (other high/medium) | **CONFIRMED** | Statutory |
| Sustainability: **2040** critically overdrafted, **2042** other high/medium | **CONFIRMED** | Statutory |
| State fees: **$300/well** plus **$25/AF in unmanaged areas** or **$20/AF in probationary basins** | **CONFIRMED** | Two independent searches state the distinction explicitly — this resolves our earlier $20-vs-$25 conflict |
| De minimis = **2 AF/yr, domestic use only**, exempt from reporting and fees | **CONFIRMED** | Statutory definition |
| GEARS is the State Board's extraction reporting portal for probationary basins and unmanaged areas | **CONFIRMED** | |
| GEARS requires: well owner, well location, **well capacity in GPM**, **monthly extraction volumes**, place(s) of use, purpose(s) of use | **CONFIRMED** | Two independent searches, consistent wording. **This drives our data model.** |
| Tule: measurement from Jan 1 2025; certified flow meters from Mar 1 2025 above 500 AF/yr | **CONFIRMED** | Basin-specific — do not generalize |
| Tulare Lake first subbasin placed on probation, April 2024 | **CONFIRMED** | Multiple outlets |
| SB 88: surface diverters above **10 AF/yr** must measure and report; **±10–15%** accuracy | **CONFIRMED** | |
| ILRP requires Total Nitrogen Applied and INMP summary; certification in high-vulnerability areas | **CONFIRMED** | |
| Carryover credits and trading are real mechanisms — also called carryover rights, in-lieu recharge, soft caps, intertemporal trading | **CONFIRMED** | GSAs may halt trading when levels approach a Minimum Threshold |
| CropManage: UC ANR/UCCE, CDFA-FREP funded, Michael Cahn, from ~2011, CIMIS ET-based | **CONFIRMED** | |
| Salinas Valley 180/400-foot aquifer critically overdrafted, seawater intrusion inland | **CONFIRMED** | |
| **The CropManage API endpoints we call** | **CONFIRMED** | Read from our own source code — the single most reliable item in this register |

---

## 4. Supported — internal use, verify before external

| Claim | Status | Why it's not confirmed |
|---|---|---|
| Overdraft penalty pumping **$310–$500/AF** in Eastern Tule GSA | **SUPPORTED** | Named GSA and a real range — but one GSA's schedule. **Never present $500/AF as what a grower will pay.** |
| Madera County GSA fees: ~$246/acre/yr (Madera subbasin), ~$203/acre/yr (Chowchilla) | **SUPPORTED** | Note this is per **acre**, not per acre-foot — fee structures differ in *kind* between GSAs, not just rate |
| 21 critically overdrafted basins · 261 GSAs · 116 plans · ~85% approved | **SUPPORTED** | Counts as of 2024; certainly moved since |
| PPIC: 3.15 maf lost by 2040, 500k–900k acres fallowed, $4.5B farm GDP, 50,000 jobs | **SUPPORTED** | Real study, scenario-dependent figures, report not read directly |
| Kaweah, Chowchilla, Kern returned to DWR oversight | **SUPPORTED** | Trade press; statuses change |
| Board approved ET methods specifically for **groundwater** extraction tracking | **SUPPORTED** | Strong and specific for Tule — confirm scope before generalizing to other basins |

---

## 5. Unverified — do not repeat

| Claim | Problem |
|---|---|
| Feb 1 2026 and May 1 2026 reporting deadlines | Post-cutoff, single-source, basin-specific |
| GEARS portal failing April 2026 (4 of 50 uploads) | One trade article, one anecdote. Color, not evidence. |
| 20 AF de minimis threshold | Contradicts the statutory 2 AF. Probationary orders set their own exclusions — **check per basin, per order** |
| Current status of the Kings County injunction | Litigation moves |
| Any specific SVBGSA rate or allocation figure | Not verified at all |
| Rancho Del Sol's 2.0 AF/acre allocation | **Invented by us** — and now known to be the wrong *shape* (see corrections) |

---

## 6. What to verify next, in priority order

1. **The GEARS form itself.** Our data model is being built from a summary of its field list.
   Open the form or the user guide and confirm field-by-field, including formats and units.
2. **The ET alternative pathway.** Call the State Water Board. Ask: what has actually been
   approved, in which basins, on what evidence, and would a CropManage-based submission qualify?
   This is our highest-value unknown.
3. **The target GSA's actual allocation ordinance** — tier structure, rates, cap, carryover
   rules, transfer rules, penalty schedule, filing deadline and format. This is the real spec
   for Tier 1 output, and it differs by agency.
4. **Whether a GSA accepts a grower-generated report** or requires its own portal.
5. **CropManage's well ↔ planting mapping** and whether it stores flow rate. Ask the program
   manager directly — he has already corrected us once and was right.

---

## 7. The standing rule

> A grower knows his own basin better than any document we hand him. One wrong fee figure costs
> us the room, and these growers have been sold ten years of stories already.
>
> **Nothing leaves this project as fact unless it is CONFIRMED here, or it is stated with its
> source and its uncertainty attached.** "We don't know yet, and here's how we'll find out" is a
> credible thing to say. A confident wrong number is not.

---

## Sources for this verification pass

- [SGMA Reporting and Fees — State Water Board](https://waterboards.ca.gov/sgma/reporting_and_fees.html)
- [GEARS user guide (PDF)](https://www.waterboards.ca.gov/water_issues/programs/sgma/docs/gears-user-guide.pdf)
- [GEARS portal](https://gears.waterboards.ca.gov/)
- [Tule Subbasin — State Water Board](https://www.waterboards.ca.gov/sgma/groundwater_basins/tule-subbasin.html)
- [State Water Board Resolution 2024-0030 (PDF)](https://water.waterboards.ca.gov/board_decisions/adopted_orders/resolutions/2024/rs2024-0030.pdf)
- [New SGMA reporting requirements, Tule Subbasin — Maven's Notebook](https://mavensnotebook.com/2024/10/10/notice-new-sgma-reporting-requirements-for-groundwater-extractors-in-the-tule-subbasin/)
- [Greater Kaweah GSA adopts a groundwater allocation — Milk Producers Council](https://www.milkproducerscouncil.org/post/greater-kaweah-groundwater-sustainability-agency-board-adopts-a-groundwater-allocation)
- [East Kaweah GSA — allocation](https://ekgsa.org/allocation)
- [Groundwater allocation FAQs — East Kaweah GSA (PDF)](https://ekgsa.org/wp-content/uploads/2025/05/20230220-GW-Allocation-FAQs.pdf)
- [Kern Subbasin GSP FAQs](https://kerngsp.com/faqs/)
- [Counting groundwater: the devil is in the details — SJV Water](https://sjvwater.org/counting-groundwater-the-devil-is-in-the-details/)
- [Madera County GSA — a split decision on a big fee — Milk Producers Council](https://www.milkproducerscouncil.org/post/madera-county-gsa-a-split-decision-on-a-big-fee)
- [Markets and trading — Groundwater Exchange](https://groundwaterexchange.org/markets-and-trading/)
- [Understanding groundwater markets and water accounting frameworks — Montgomery & Associates](https://elmontgomery.com/hydro-notes/understanding-groundwater-markets-and-water-accounting-frameworks/)
- [Groundwater pumping allocations under SGMA — EDF (PDF)](https://www.edf.org/sites/default/files/documents/edf_california_sgma_allocations.pdf)
- [Groundwater use can be accurately monitored with satellites using OpenET — DRI](https://www.dri.edu/groundwater-use-can-be-accurately-monitoredwith-satellites-using-openet/)
- [OpenET study helps water managers and farmers put Landsat to work — NASA](https://science.nasa.gov/missions/landsat/openet-study-helps-water-managers-and-farmers-put-landsat-to-work/)
- [Estimating irrigation water use from remotely sensed ET data — OSTI](https://www.osti.gov/pages/biblio/2440819)
- [Salinas Valley faces urgent groundwater sustainability deadline — Monterey County Now](https://www.montereycountynow.com/svnow/news/the-clock-is-ticking-on-water-projects-to-bring-local-groundwater-basins-into-compliance/article_56486cc7-0d5e-4aa7-9712-301e9485284b.html)
- [Salinas Valley Basin GSA — LandWatch](https://landwatch.org/issues-actions/policy/water/salinas-valley-basin-groundwater-sustainability-agency/)
