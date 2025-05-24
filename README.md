# Agent Memory For Cursor IDE
Persistent Agent Memory For Cursor  
Allows agent to remember what you've requested of it and all the work you've done in the past, across dev sessions.
- project specific, no spillover effects into other projects
- simple to use, there is only one command to know: "@bootagent"


## What it can do
### Agent Memory Prompt Examples:
- "from here on out, always respond as if you are Geoffrey Hinton"
- "remember that signup form feature we were talking about last week but ended up scrapping? can we revisit that, I have a new idea for it"
- "remind me what we worked on last week? my brain is scrambled after the weekend and I can't remember."
- "your name is Hal from here on out, and you can call me Dave."
- "don't ever say 'okay' in your responses, spell it as 'ok' instead."

### git automation from Chat Prompt Examples:
- "commit the latest."
- "commit and push."
- "discard all changes."

## Setup
### Preparation:
- By default we will assume you have a @/docs folder in your project root containing all of your project specification documents. customize the bootagent.mdc rules if your docs are in a different location or (gasp!) if you have no docs.
- already have a local copy you are working from of a published remote repository set up.
  
### Installation:
1. copy all the files in this repo to the matching directories in your cursor project (except for this readme)
2. add these to your package.json "scripts" section:
```
"git:discard": "git reset --hard HEAD && git clean -fd",
"git:commit": "sh -c 'COMMIT_MSG=\"$1\"; git add . && git commit -m \"$COMMIT_MSG\" && echo \"### $COMMIT_MSG\" > scripts/.tmp_changelog_content.md && ts-node scripts/update-technical-changelog.ts --contentFile scripts/.tmp_changelog_content.md' --"
  
```
3. (optional) edit @.cursor/rules/bootagent.mdc to reflect any unique considerations for your specific project.
### Verify it's working:
1. open a new chat and prompt "@bootagent" it should give feedback that its all up to speed with your project and memories.
2. try one of the examples above. prompt: "I'm going to call you Hal, and you can call me Dave." this should log a memory.
3. close the chat window, exit cursor.
4. re-launch cursor
5. open a new chat and prompt "@bootagent"
6. ask it what your name is, the agent should remember.

   
## Usage:
1. start every new chat thread with "@bootagent". this will invoke the bootagent rule and load all the project specs and agent memory into context.
2. carry on prompting as normal.
3. stick with the same chat thread until you bring a minor feature to completion or the thread gets ridiculously long.
4. whenever your project is in a good working state, prompt "commit the latest" or "commit and push." (or whatever similar wording you prefer). when you commit this way instead of by typing git commands manually, the agent will record a memory of the commit.



   
   
## How it works:
to maintain agent memory, memories are recorded into two separate logs:
1. @/docs/ai/agent_changelog.md  
records behavioral, operational, and system prompt requests such as names or communication style.

2. @/docs/ai/technical_changelog.md  
records a changelog of every commit with summaries of changes and a link to the commit on github.  

the bootagent rule has the agent read all these logs and all your project rules which loads it into the current chat's context. 

It might not be perfect but it's quite effective for me! report any issues you have in the issues tab in github.

## See Also:
I'm building a personal cursor rules repo: . you can browse and pick and choose any of the rules you find helpful there for your own project. 
