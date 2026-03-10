# GitHub Processes — Token Definitions for Butler Agents
**Date:** February 16, 2026
**Updated:** After first real use — pushed 2 repos to GitHub
**By:** Claude Desktop + Steve Pappas
**Purpose:** Define the reusable tokens that chain into agents — DOCUMENTED FROM REAL USE

---

## THE IDEA

Every GitHub operation breaks down into small reusable **tokens** (tasks).
Tokens have a **FROM** and a **TO**. That's it.
Chain tokens together = an **agent** (a workflow).
Butler's skill grid shows agents. Each agent is made of tokens.

---

## CORE TOKENS (The Building Blocks)

These are the atomic actions. Every agent is built from these.
**Tested = actually used in a real operation today**

### Token: INIT ✅ Tested
**What:** Initialize a folder as a git repo
**From:** Local folder (not yet tracked)
**To:** Same folder (now tracked by git)
**When:** First time only — new project setup
**Command:** `git init`
**Real use:** `cd C:\AICode\CropClient-Claude-Desktop && git init`

### Token: GITIGNORE ✅ Tested
**What:** Create .gitignore to exclude files from tracking
**From:** Nothing
**To:** .gitignore file in repo root
**When:** Before first commit — keep node_modules, .env, logs out
**Command:** Create file with exclusion rules
**Real use:** Created `.gitignore` with `node_modules/`, `.env`, `*.log`, `nul`

### Token: CONFIG ✅ Tested
**What:** Set git user identity for commits
**From:** No identity
**To:** Name + email configured
**When:** First time on a machine
**Command:** `git config user.email "email"` + `git config user.name "name"`
**Real use:** `git config user.email "stevep@sspnet.com"` + `git config user.name "Steve Pappas"`

### Token: STAGE ✅ Tested
**What:** Mark files as ready to save
**From:** Changed files in working folder
**To:** Git staging area
**Command:** `git add .` or `git add <specific files>`
**Real use:** `git add .` (staged 127 files for crop-client-services)

### Token: COMMIT ✅ Tested
**What:** Save a snapshot with a message
**From:** Staged files
**To:** Local git history
**Command:** `git commit -m "message"`
**Real use:** `git commit -m "Initial commit - CropClient MCP services alpha"`

### Token: CREATE-REPO ✅ Tested
**What:** Create a new repo on GitHub
**From:** Nothing (new)
**To:** GitHub remote repo
**Command:** `gh repo create <name> --public --description "desc"`
**Real use:** `gh repo create CropClient-Claude-Desktop --public --description "Butler app, MCP API tools audit, design docs"`
**Note:** Requires `gh` CLI installed and authenticated

### Token: ADD-REMOTE ✅ Tested
**What:** Connect local repo to GitHub remote
**From:** Local repo (no remote)
**To:** Local repo → linked to GitHub
**Command:** `git remote add origin https://github.com/<user>/<repo>.git`
**Real use:** `git remote add origin https://github.com/sspappasjr/crop-client-services.git`

### Token: PUSH ✅ Tested
**What:** Send local commits to GitHub (filing cabinet)
**From:** Local git repo
**To:** GitHub remote
**Command:** `git push -u origin main`
**Real use:** Pushed both repos. First push uses `-u` to set tracking.
**Note:** If remote has existing content, may need `--force` (see ARCHIVE first)

### Token: ARCHIVE ✅ Tested
**What:** Save existing remote branch before overwriting
**From:** GitHub branch (e.g., old main)
**To:** New archive branch (e.g., archive/v0)
**Command:** `git push origin origin/main:refs/heads/archive/v0`
**When:** Remote has placeholder/old content you want to preserve before force push
**Real use:** Archived old crop-client-services main to `archive/v0` before pushing real alpha

### Token: FORCE-PUSH ✅ Tested
**What:** Overwrite remote with local (after archiving old content)
**From:** Local repo
**To:** GitHub remote (replaces what was there)
**Command:** `git push --force origin main`
**When:** After ARCHIVE — replacing placeholder with real content
**Real use:** Force pushed real alpha to crop-client-services after archiving v0

### Token: FETCH ✅ Tested
**What:** Download remote info without changing local files
**From:** GitHub remote
**To:** Local tracking refs
**Command:** `git fetch origin`
**When:** Check what's on remote before merging or force pushing
**Real use:** `git fetch origin` to see what was in placeholder repo

### Token: RENAME-BRANCH ✅ Tested
**What:** Rename local branch (e.g., master → main)
**From:** Old branch name
**To:** New branch name
**Command:** `git branch -m <old> <new>`
**Real use:** `git branch -m master main`

### Token: PULL
**What:** Get latest from GitHub to local
**From:** GitHub remote
**To:** Local git repo
**Command:** `git pull origin <branch>`

### Token: CLONE
**What:** Copy entire repo from GitHub to a new location
**From:** GitHub remote
**To:** New local folder
**Command:** `git clone <url>`

### Token: BRANCH-CREATE
**What:** Create a new working branch (like alpha, release, feature)
**From:** Current branch
**To:** New branch name
**Command:** `git checkout -b <branch-name>`

### Token: BRANCH-SWITCH
**What:** Switch to a different branch
**From:** Current branch
**To:** Target branch
**Command:** `git checkout <branch-name>`

### Token: MERGE
**What:** Combine one branch into another
**From:** Source branch (e.g., alpha)
**To:** Target branch (e.g., main/production)
**Command:** `git merge <source-branch>`

### Token: TAG
**What:** Mark a commit as a release version
**From:** Current commit
**To:** Named tag (e.g., v1.0-alpha)
**Command:** `git tag -a v1.0-alpha -m "Alpha release"`

### Token: STATUS
**What:** Check what's changed, what's staged, what's clean
**From:** Local repo
**To:** Status report
**Command:** `git status`

### Token: DIFF
**What:** See exactly what changed in files
**From:** Local changes
**To:** Comparison report
**Command:** `git diff`

### Token: LOG
**What:** See history of commits
**From:** Git history
**To:** Activity report
**Command:** `git log --oneline`

### Token: NOTIFY
**What:** Send a message to a person or team
**From:** Butler/Agent
**To:** Person, team, or partner
**Method:** Status message, email, webhook, etc.

### Token: GH-AUTH ✅ Tested
**What:** Authenticate GitHub CLI for command line operations
**From:** Unauthenticated machine
**To:** Authenticated — can create repos, push, pull
**Command:** `gh auth login --web -p https`
**When:** First time on a machine
**Real use:** Installed `gh` CLI via winget, authenticated via browser device code

---

## AGENTS (Token Chains = Workflows)

Each agent is a sequence of tokens. Butler shows these as skill cards.
**Tested agents marked with what actually happened.**

---

### Agent: NEW PROJECT SETUP ✅ TESTED (both repos)
**Purpose:** Take a local folder and get it on GitHub for the first time
**Actual tokens used (crop-client-services):**
1. GITIGNORE — created .gitignore (node_modules, .env, *.log)
2. CONFIG — set user.email + user.name
3. ADD-REMOTE — connected to existing GitHub repo
4. STAGE — `git add .` (127 files)
5. RENAME-BRANCH — master → main
6. COMMIT — "Initial commit - CropClient MCP services alpha"
7. FETCH — checked what was on remote
8. ARCHIVE — saved old main as archive/v0
9. FORCE-PUSH — pushed real alpha to main

**Actual tokens used (CropClient-Claude-Desktop):**
1. GITIGNORE — created .gitignore
2. INIT — `git init`
3. CONFIG — set user.email + user.name
4. RENAME-BRANCH — master → main
5. STAGE — `git add .` (93 files)
6. COMMIT — "Initial commit - CropClient Claude Desktop workspace"
7. CREATE-REPO — `gh repo create` (repo didn't exist yet)
8. ADD-REMOTE — connected to new GitHub repo
9. PUSH — `git push -u origin main`

**Lesson:** Two variations of same agent — one with existing repo (needs ARCHIVE), one creating new repo. Agent needs to handle both.

**Butler card:** ⚡ New Project

---

### Agent: SAVE WORK (Check In)
**Purpose:** Save current work to GitHub — daily/regular use
**Tokens:**
1. STATUS — see what's changed
2. STAGE — add changed files
3. COMMIT — save with message
4. PUSH — send to filing cabinet

**Butler card:** 💾 Save Work

---

### Agent: GET LATEST (Check Out)
**Purpose:** Get the latest code from GitHub to a location
**Tokens:**
1. PULL — get from filing cabinet
2. STATUS — confirm everything is clean

**Butler card:** ⬇️ Get Latest

---

### Agent: FRESH INSTALL
**Purpose:** Set up a repo on a new location (new machine, new server)
**Tokens:**
1. CLONE — copy entire repo from GitHub
2. STATUS — verify files arrived
3. NOTIFY — "Location set up and ready"

**Butler card:** 📦 Fresh Install

---

### Agent: NEW-TOOLS-API
**"Install my new API tools"** — NEW-TOOLS (parm: API)
**Script:** scripts/new-tools-api.js | **Butler card:** 📦 New Tools

**Token 1: CLONE** — copy repo from GitHub
`git clone https://github.com/sspappasjr/Crop-Client-Services.git C:\AICode\Crop-Client-Services`

**Token 2: NPM-INSTALL** — install dependencies
`cd C:\AICode\Crop-Client-Services && npm install && cd api-server && npm install`

**Token 3: START** — start API server
`cd C:\AICode\Crop-Client-Services\api-server && node APIServer1.2.js`

**Token 4: STATUS** — verify running
`GET http://localhost:3101/ping` + `GET http://localhost:3101/tools` → 15 tools

**Token 5: NOTIFY** — "Your new API tools are ready."

---

### Agent: ALPHA RELEASE
**Purpose:** Move dev work to alpha branch on GitHub for server install
**Tokens:**
1. STATUS — verify dev work is clean
2. STAGE — add all changes
3. COMMIT — "Alpha release ready"
4. BRANCH-CREATE — create/switch to alpha branch (if needed)
5. PUSH — send alpha to filing cabinet
6. TAG — mark as alpha release (e.g., v1.0-alpha)
7. NOTIFY — "Alpha is on GitHub, ready for server install"

**Butler card:** 🚀 Alpha Release

---

### Agent: SERVER PULL (Install Alpha on Server)
**Purpose:** Pull alpha from GitHub to the CropClient server
**Tokens:**
1. BRANCH-SWITCH — switch to alpha branch
2. PULL — get alpha from filing cabinet
3. STATUS — confirm files are there
4. NOTIFY — "Alpha pulled to server, ready for install"

**Butler card:** 🖥️ Server Pull

---

### Agent: PRODUCTION PUSH
**Purpose:** After server testing passes, push to production branch on GitHub
**Tokens:**
1. BRANCH-SWITCH — switch to main/production
2. MERGE — merge alpha into production
3. PUSH — send production to filing cabinet
4. TAG — mark as production release (e.g., v1.0)
5. NOTIFY — "Production release pushed, team notified"

**Butler card:** 🏁 Go Live

---

### Agent: SYNC CHECK
**Purpose:** Compare local vs GitHub — are they in sync?
**Tokens:**
1. STATUS — local changes?
2. DIFF — what's different?
3. LOG — recent history

**Butler card:** 🔍 Sync Check

---

### Agent: PARTNER NOTIFY
**Purpose:** Tell partners the API is ready for testing
**Tokens:**
1. STATUS — confirm production is live
2. NOTIFY — send to MobileFrame / CropManage
3. LOG — record the notification

**Butler card:** 🤝 Partner Notify

---

## MACHINE SETUP (One-time per location)

Before any agent can run on a new machine, these tokens run once:
1. Install git
2. Install `gh` CLI (`winget install --id GitHub.cli`)
3. GH-AUTH — `gh auth login --web -p https` (browser device code)
4. CONFIG — `git config user.email` + `git config user.name`

---

## BRANCH STRATEGY (Simple)

Three branches:

| Branch | Purpose | Who uses it |
|--------|---------|-------------|
| **main** | Production — the live release | Server, partners |
| **alpha** | Testing — ready for server install | Dev team, testers |
| **dev** | Daily work — where coding happens | Steve + Claude Code |

Flow: **dev** → alpha → main
Each promotion is an agent run.

---

## WHAT BUTLER NEEDS TO KNOW

For every agent run, Butler provides:
- **Repo:** which project (from dropdown)
- **Location:** which machine/server (from location selector)
- **Branch:** which branch to work on (agent knows this)
- **Who:** logged-in user

Butler writes this to **butler-commands.json**.
CropClient MCP server reads it and runs the token chain.
Status comes back to Butler's status bar.

---

## REAL EXECUTION LOG

### Feb 16, 2026 — First Real GitHub Push

**crop-client-services:**
- Local: C:\AICode\crop-client-services
- Remote: https://github.com/sspappasjr/Crop-Client-Services
- Status: 127 files, main branch, archive/v0 preserves old placeholder
- Agent used: NEW PROJECT SETUP (with ARCHIVE variant)

**CropClient-Claude-Desktop:**
- Local: C:\AICode\CropClient-Claude-Desktop
- Remote: https://github.com/sspappasjr/CropClient-Claude-Desktop
- Status: 93 files, main branch, fresh repo
- Agent used: NEW PROJECT SETUP (with CREATE-REPO variant)

**Tools installed:**
- gh CLI v2.86.0 (via winget)
- Authenticated as sspappasjr

### Feb 16, 2026 — Server Deploy (NEW-TOOLS-API)

**Server:** GoDaddy Windows Server — 184.168.20.205 (cropclient.com)
**Agent used:** NEW-TOOLS-API
**Tokens executed:**
1. CLONE ✅ — `git clone` to C:\AICode\Crop-Client-Services
2. NPM-INSTALL ✅ — root + api-server deps installed
3. START ✅ — APIServer1.2.js running on localhost:3101, 15 tools
4. STATUS ✅ — /ping and /tools verified from server browser
5. NOTIFY ✅ — "Your new API tools are ready"

**DNS:** api.cropclient.com A record added in GoDaddy → 184.168.20.205 (propagating)
**IIS:** Pending — need URL Rewrite + ARR + new site for api.cropclient.com
**Pre-reqs installed on server:** Git for Windows, Node v22.21.0
