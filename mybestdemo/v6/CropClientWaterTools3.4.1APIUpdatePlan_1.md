# CropClient Water Tools — 3.4.1 API Update
The plan is the only source for changes.  No changes unless first in a plan and approved.
   making a change because it seems needed is not DONE here... Only by a written PLAN !!!!!

**Goal:** Water Science sends its API calls the same way que does, start by 1st using
api-component 3.4.1, on both sides — then we will plan how to make the new app and the server with same features 

**Server side:** update `APIServer 5.0` so it handles requests the same
way que's server side does start by using the current api-component 3.4.1.

then we will plan each step in same of new chat depending on scope 

then proceed to change mcp-engine to serve the needs of 
    staging and ... whatever is needed. 

   example let the staging be done as needed instead of hardcoded as in mcp-40-engine.js
the goal is to keep it simple using mcp-engine. version until it works correctly for its role with mcp tools

we stay on 2 fence on our design DOC on one side and MCP on the other side.  careful not to break the rules

Water-Science CAN use the hardcoded logon as done by mcp-engine. ( right now we need temp dev access only)
1st step is to code water-science onload to work according the mcp-engine default ( right now local is default ) 
then we take the latest api-component and get it clean with just mcp on one side of the fence like we did with cropclientdashboard.html

token getranches and plantings is first loading water science grids onload thru the tokens . 
then we do get-irrigation-details next.  with a clean mcp api-component injected into the apiserver after being tested in the water science as as a harness

lets get this done as planed. 
Steve