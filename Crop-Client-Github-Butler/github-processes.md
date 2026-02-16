# GitHub Processes — Token Definitions for Butler Agents
**Date:** February 16, 2026
**By:** Claude Desktop (GitHub expertise) for Steve's review
**Purpose:** Define the reusable tokens that chain into agents

---

## THE IDEA

Every GitHub operation breaks down into small reusable **tokens** (tasks).
Tokens have a **FROM** and a **TO**. That's it.
Chain tokens together = an **agent** (a workflow).
Butler's skill grid shows agents. Each agent is made of tokens.

---

## CORE TOKENS (The Building Blocks)

These are the atomic actions. Every agent is built from these.

### Token: INIT
**What:** Initialize a folder as a git repo
**From:** Local folder (not yet tracked)
**To:** Same folder (now tracked by git)
**When:** First time only — new project setup
**Git:** `git init`

### Token: STAGE
**What:** Mark files as ready to save
**From:** Changed files in working folder
**To:** Git staging area
**Git:** `git add .` or `git add <specific files>`

### Token: COMMIT
**What:** Save a snapshot with a message
**From:** Staged files
**To:** Local git history
**Git:** `git commit -m "message"`

### Token: PUSH
**What:** Send local commits to GitHub (filing cabinet)
**From:** Local git repo
**To:** GitHub remote
**Git:** `git push origin <branch>`

### Token: PULL
**What:** Get latest from GitHub to local
**From:** GitHub remote
**To:** Local git repo
**Git:** `git pull origin <branch>`

### Token: CLONE
**What:** Copy entire repo from GitHub to a new location
**From:** GitHub remote
**To:** New local folder
**Git:** `git clone <url>`

### Token: BRANCH-CREATE
**What:** Create a new working branch (like alpha, release, feature)
**From:** Current branch
**To:** New branch name
**Git:** `git checkout -b <branch-name>`

### Token: BRANCH-SWITCH
**What:** Switch to a different branch
**From:** Current branch
**To:** Target branch
**Git:** `git checkout <branch-name>`

### Token: MERGE
**What:** Combine one branch into another
**From:** Source branch (e.g., alpha)
**To:** Target branch (e.g., main/production)
**Git:** `git merge <source-branch>`

### Token: TAG
**What:** Mark a commit as a release version
**From:** Current commit
**To:** Named tag (e.g., v1.0-alpha)
**Git:** `git tag -a v1.0-alpha -m "Alpha release"`

### Token: STATUS
**What:** Check what's changed, what's staged, what's clean
**From:** Local repo
**To:** Status report
**Git:** `git status`

### Token: DIFF
**What:** See exactly what changed in files
**From:** Local changes
**To:** Comparison report
**Git:** `git diff`

### Token: LOG
**What:** See history of commits
**From:** Git history
**To:** Activity report
**Git:** `git log --oneline`

### Token: CREATE-REPO
**What:** Create a new repo on GitHub
**From:** Nothing (new)
**To:** GitHub remote repo
**API:** `POST /user/repos`

### Token: NOTIFY
**What:** Send a message to a person or team
**From:** Butler/Agent
**To:** Person, team, or partner
**Method:** Status message, email, webhook, etc.

---

## AGENTS (Token Chains = Workflows)

Each agent is a sequence of tokens. Butler shows these as skill cards.

---

### Agent: NEW PROJECT SETUP
**Purpose:** Take a local folder and get it on GitHub for the first time
**Tokens:**
1. INIT — make it a git repo
2. STAGE — add all files
3. COMMIT — "Initial commit"
4. CREATE-REPO — make the repo on GitHub
5. PUSH — send it up to the filing cabinet
6. NOTIFY — "New project created on GitHub"

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

## BRANCH STRATEGY (Simple)

We don't need complicated. Three branches:

| Branch | Purpose | Who uses it |
|--------|---------|-------------|
| **main** | Production — the live release | Server, partners |
| **alpha** | Testing — ready for server install | Dev team, testers |
| **dev** | Daily work — where coding happens | Steve + Claude Code |

Flow: **dev** → alpha → main
Each promotion is an agent run.

---

## HOW IT MAPS TO BUTLER

| Butler Skill Card | Agent | When you use it |
|-------------------|-------|-----------------|
| ⚡ New Project | NEW PROJECT SETUP | Once per project |
| 💾 Save Work | SAVE WORK | Daily — check in your code |
| ⬇️ Get Latest | GET LATEST | Start of day — get fresh code |
| 📦 Fresh Install | FRESH INSTALL | New machine or server setup |
| 🚀 Alpha Release | ALPHA RELEASE | Dev done, ready for testing |
| 🖥️ Server Pull | SERVER PULL | Install alpha on server |
| 🏁 Go Live | PRODUCTION PUSH | Testing passed, go to prod |
| 🔍 Sync Check | SYNC CHECK | Anytime — am I up to date? |
| 🤝 Partner Notify | PARTNER NOTIFY | Release ready for partners |

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

## NEXT STEP

Turn these agents into Butler skill cards with a test bed.
Each card click shows its tokens and lets you run/test them.
This becomes the working prototype.

Steve decides what's right, what's wrong, what's missing.
