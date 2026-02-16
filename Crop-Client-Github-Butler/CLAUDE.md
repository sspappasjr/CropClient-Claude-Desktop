# CropClient GitHub Butler

## Project Lead
Steve Pappas - Design, features, UI decisions. His word is final.

## Roles
- **Steve**: CEO, project lead, designer, feature decisions
- **Claude Code (Opus)**: Lead programmer — builds what Steve specs
- **Claude Desktop**: UAT tester, analyst

## Rules
- NO code changes without Steve's approval
- NO stripping, removing, or restructuring without discussion first
- Present recommendations to Steve — he decides
- ONE small change at a time
- DO NOT show code in chat — just confirm what was done
- Use simple, concise language
- Keep the Butler as a single self-contained HTML file
- Version snapshots before making changes

## App Overview
GitHub Butler — a browser-based UI for managing GitHub repos.
- Menu-driven: click buttons, not type commands
- Works with GitHub API using a personal access token
- Steve controls it himself — no AI needed at runtime
- Skill integration planned for Push/Pull/Sync via MCP/Claude Code

## File Structure
```
Crop-Client-Github-Butler/
  CropClient-Github-Butler.html    <- current working file (v1.1)
  CLAUDE.md                        <- this file
  HOW-TO-USE-BUTLER.txt            <- user guide
  v1.0/                            <- snapshot of v1.0 (with irrigation package)
  more/                            <- older versions from Nov 2025
  zips/                            <- archived zips
```

## Path Convention
- Dev root: C:\AICode\
- Repos live at: C:\AICode\{repo-name}
- Claude workspace: C:\AICode\CropClient-Claude-Desktop

## Version History
- **v1.0** — Live GitHub API (login, browse repos, view files, create repo). Irrigation package still embedded.
- **v1.1** — Irrigation package removed (saved in v1.0/). Pure GitHub Butler.

## Current State (v1.1)
- Login/Logout with GitHub PAT (sessionStorage)
- Real repo list from GitHub API
- Browse files and folders with back navigation
- View file contents
- Create new repos
- Grid/List radio buttons exist but not wired
- Pull/Push/Sync buttons exist but show status message only (skill integration next)

## Next Steps (Steve decides priority)
- Wire Pull/Push/Sync to skills via butler-commands.json
- Make Grid/List toggle work
- Create Butler Guide (compact, chapter-based)
- Decide where irrigation package belongs

## GitHub Info
- Username: sspappasjr
- Token: entered at runtime via Login button (never hardcoded)
