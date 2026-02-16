First Skill Features — Thoughts from Claude Desktop
=====================================================
Date: February 15, 2026
Butler Version: v1.1 (frozen)
Status: Recommendation for Steve's review

GOAL
----
Wire Butler's Push/Pull/Sync buttons to real operations via skills.
First skill = "Repo Deploy" — gets code from local machine to GitHub and server.

STEVE'S 4 PRIORITIES
--------------------
1. Push Crop-Client-Services to GitHub (first version of MCP server project)
2. Resolve the placeholder repo already on GitHub
3. Push that repo to crop-client-services.com server
4. Install APIServer1.2 and get it running for audit 1.3 testing

HOW IT WORKS
------------
Butler (browser UI) --> butler-commands.json --> Claude Code (executes)

Butler is the menu. Skills do the work.
User clicks a button, Butler writes a command with params,
Claude Code reads it and runs the git/deploy operations.

SKILL BREAKDOWN
---------------

Skill 1: "Push to GitHub"
  What it does:
    - git init (if needed)
    - git add + commit
    - Create GitHub repo via API (or use existing)
    - git remote add origin
    - git push
  Butler UI:
    - Push button on selected repo
    - Status bar shows progress
  Params in butler-commands.json:
    - action: "push-to-github"
    - localPath: "C:\AICode\Crop-Client-Services"
    - repoName: "Crop-Client-Services"
    - visibility: "public" or "private"

Skill 2: "Deploy to Server"
  What it does:
    - Push repo files to crop-client-services.com
    - Method TBD (SSH/SCP, FTP, git remote, cPanel deploy)
  Butler UI:
    - New "Deploy" button or menu option
    - Status bar shows progress
  Params:
    - action: "deploy-to-server"
    - repoName: "Crop-Client-Services"
    - serverHost: "crop-client-services.com"
    - deployMethod: TBD

Skill 3: "Start API Server"
  What it does:
    - SSH to server (or remote command)
    - npm install (if needed)
    - node APIServer1.2.js
    - Verify it responds on expected port
  Butler UI:
    - "Start Server" button
    - Status shows running/stopped
  Params:
    - action: "start-server"
    - serverFile: "APIServer1.2.js"
    - serverHost: "crop-client-services.com"

QUESTIONS FOR STEVE (before building)
--------------------------------------
1. What's on the placeholder GitHub repo right now? Empty? Old files? Name?
2. How do you access crop-client-services.com? SSH? FTP? cPanel?
3. Does that server have Node.js installed?
4. Should the GitHub repo be public or private?

butler-commands.json DRAFT FORMAT
----------------------------------
{
  "command": "push-to-github",
  "params": {
    "localPath": "C:\\AICode\\Crop-Client-Services",
    "repoName": "Crop-Client-Services",
    "commitMessage": "Initial commit - MCP server project v1.0",
    "visibility": "public"
  },
  "status": "pending",
  "timestamp": ""
}

EXECUTION ORDER
---------------
Step 1: Create butler-commands.json schema (contract between Butler and skills)
Step 2: Push Crop-Client-Services to GitHub
Step 3: Resolve placeholder repo
Step 4: Deploy to server + install APIServer1.2
Step 5: Wire Butler buttons to write commands
Step 6: Test end-to-end: Butler click --> skill executes --> status returns

NOTES
-----
- Crop-Client-Services has files but no commits yet (git status showed all untracked)
- APIServer1.2.js lives in MCP-API-Tools-Audit/v1.2-restructure/
- Nothing happens without Steve's go-ahead
