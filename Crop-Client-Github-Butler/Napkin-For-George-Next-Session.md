# Napkin for George — Next Session Briefing
**Date:** June 25, 2026
**From:** Steve + Claude Code (web session)

---

## Message 1 — Architecture Planning

> "George — we need to design a clean folder/file template structure for each app in `cropclient-claude-desktop`. The goal is:
> - Small standalone components that can be included by a factory app
> - MCP token compliant from the start, no CORS hacks
> - A folder structure that works like a book — consistent across every app
> - Git as version control, no more version folders inside projects
> - A template that includes spots for: the app code, a CLAUDE.md, napkins, a plan, and a daily log
> - Rules for how components graduate to the demo repo `Crop-Client-Services`
>
> Here are my current apps: Page-Factory, MCP-API-Tools-Audit, Crop-Client-Github-Butler, Crop-Client-AI-Assist, Crop-Client-API-Tools-Admin
>
> Design the template. I'll bring it back to Claude Code to execute."

---

## Message 2 — Butler Token System

> "George — read `github-processes.md` in `Crop-Client-Github-Butler/`. The token/agent system is solid. Now I need two things:
> 1. A standard folder template for every app — works like a book, consistent structure
> 2. MCP token security rules — how each component calls the API without CORS hacks
> The Butler agents will use this template for every new app going forward."

---

## Context for George

- `github-processes.md` has the full token/agent system — already tested and working
- Branch strategy already defined: `dev` → `alpha` → `main`
- The problem we are solving: past apps became complex harnesses that broke MCP token rules and needed CORS workarounds
- The fix: build small independent components first, then include them via factory
- Claude Code (web) will execute whatever plan George approves

---

Happy Trails
Steve
