MCP Tool Maker Napkin

I have a thought about a nice the have now. i would like to make links on a page i can click on Github and it will contain simple list for me the create a repo push one of my project, plull one of my project and apply changes to an existing project . i can download it on my desktop tops or my cropclient.com server which is what i am building right now it will need a new rep called (of course ) CropClient-Services

Claude specs:

Need GitHub credentials stored somewhere safe (config file or env vars)
Need repo name: CropClient-Services
Need these operations:
- Create new repo on GitHub
- Push local project to repo (git init, add remote, push)
- Pull from repo (git pull)
- Apply changes to existing project (git pull, merge, push)
Need to work from two locations:
- Desktop
- cropclient.com server
Simple HTML page with clickable links that trigger git commands
Maybe use MCP tools for git operations?
Or simple bash scripts that get called?


