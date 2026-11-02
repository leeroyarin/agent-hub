# agent-hub — Learning Log

This file is only for this project. It is not a general skill, and it
does not apply to other projects.

Rule: while we work on agent-hub, keep learning what needs to be done,
what is right, and what is wrong — and write it down here, in easy
talk, so the next step is clearer.

## How to add a lesson

Use this short format, so the log can grow as the project scales:

- **Date:**
- **Scope:** (e.g. Avinto-ops, Aseprite / Easymetric, agent-hub itself, GitHub, Lovable)
- **What happened:**
- **What worked:**
- **What did not work:**
- **Next time, do this instead:**

Keep each lesson short. One lesson = one thing we learned.

## Lessons so far

### 2026-11-02 — Why agent-hub exists
- **Scope:** agent-hub itself
- **What happened:** We wanted several Muse accounts to talk to each other in real time.
- **What worked:** Talking through the idea made the real problem clear.
- **What did not work:** Muse accounts cannot talk to each other directly inside Muse. Each account is separate, with its own memory and chats.
- **Next time, do this instead:** Give the agents a shared place outside Muse — that is agent-hub — instead of trying to connect the accounts directly.

### 2026-11-02 — One GitHub login at a time
- **Scope:** GitHub
- **What happened:** We switched GitHub from arin-avinto to leeroyarin.
- **What worked:** The new account could see aseprite and project-starter.
- **What did not work:** The old account's repo, Avinto-ops-frontend-prototype, disappeared from view, because it belongs to the old account.
- **Next time, do this instead:** Give one GitHub account access to all the repos we need, instead of trying to connect two GitHub accounts at once.

### 2026-11-02 — Creating a repo with the GitHub tool
- **Scope:** GitHub, agent-hub
- **What happened:** We tried to create leeroyarin/agent-hub with the GitHub tool.
- **What worked:** Creating it in the browser, as the signed-in user, worked.
- **What did not work:** The GitHub tool said 403 and could not create a repo.
- **Next time, do this instead:** If the tool cannot create a repo, create it in the browser first, then check if the tool can see it.

### 2026-11-02 — A new repo is not automatically visible to the tool
- **Scope:** GitHub, agent-hub
- **What happened:** agent-hub was created, but the GitHub tool still said 404 when we asked for it.
- **What worked:** The repo itself exists on github.com, private, with a README.
- **What did not work:** The tool cannot see a new repo until the Muse GitHub App is added to that repo.
- **Next time, do this instead:** After creating a repo, add the GitHub App to it before expecting the tool to read or write in it.

### 2026-11-02 — Use project-starter as the base
- **Scope:** agent-hub, project-starter
- **What happened:** We started with a plain HTML prototype, then switched to project-starter.
- **What worked:** project-starter is clear: Vite + React + TypeScript, with docs for setup, design, workflow and roadmap.
- **What did not work:** The plain HTML version did not match that stack, so it would not fit Lovable as well.
- **Next time, do this instead:** Build on project-starter from the start, so the prototype already matches the stack Lovable expects.

### 2026-11-02 — Lovable needs a connection, and a shared database
- **Scope:** Lovable, agent-hub
- **What happened:** We planned to test the prototype in Lovable.
- **What worked:** A Vite + React + TypeScript prototype is the right shape to import into Lovable.
- **What did not work:** Lovable is not connected through Muse yet, and the prototype only saves data in one browser (localStorage), so different agents would not see the same feed.
- **Next time, do this instead:** In Lovable, replace localStorage with a shared database. That is the step that turns a prototype into a real shared hub.

### 2026-11-02 — Use Graphify to understand code, not just search it
- **Scope:** agent-hub, Graphify
- **What happened:** We mapped the prototype with Graphify while building it.
- **What worked:** The graph showed how the pieces connect — for example, the main file imports App, and App calls load() for posts and rooms.
- **What did not work:** Searching by words alone does not show those connections.
- **Next time, do this instead:** Map a project with Graphify first, then ask the graph how a feature works, before changing code.

### 2026-11-02 — Wait before pushing
- **Scope:** agent-hub
- **What happened:** William said he will push the changes himself and read them first.
- **What worked:** Pausing gave him time to understand the prototype before it went live.
- **What did not work:** Pushing straight away would have skipped that understanding.
- **Next time, do this instead:** When William says wait, do not push. Let him read, then continue when he is ready.

### 2026-11-02 — Import project-starter properly, do not just follow it
- **Scope:** agent-hub, project-starter
- **What happened:** At first we only read project-starter and copied its stack idea. William asked if we had imported its contents, and we had not.
- **What worked:** Cloning project-starter and placing its files correctly: CLAUDE.md at the root, docs in docs/, agents in .claude/agents/, PROGRESS.html in docs/, setup files kept in starter/.
- **What did not work:** Saying we were "on project-starter" while its 35 files were missing from agent-hub.
- **Next time, do this instead:** Import first, check the file list, then build. Leave out the starter's own README, LICENSE and CHANGELOG, as the starter itself says.

### 2026-11-02 — Chat-like, owner can see everything, simple API
- **Scope:** agent-hub
- **What happened:** William said the prototype should be chat-like, user-friendly for a human, the human room owner should see agent conversations like an open book, and agents should use a simple communication API that does not take much work.
- **What worked:** A chat window with message bubbles, rooms on the left, a "Post as" switch (owner or agent), and an owner header that says William can read all rooms. A tiny API in src/lib/api.ts with only listRooms(), listMessages(room) and sendMessage().
- **What did not work:** A plain feed with posts did not feel like a chat, and it did not make the owner view obvious.
- **Next time, do this instead:** Keep the API small. If an agent needs more than list, read and send, stop and ask — do not build a big API first.

### 2026-11-02 — Agent-first: agents are the main users
- **Scope:** agent-hub
- **What happened:** William said the site must be agent-first — agents are the main users, not humans.
- **What worked:** Making the simple API the main interface, defaulting "Post as" to an agent, listing agents first, and treating the human owner view as secondary, read-only oversight.
- **What did not work:** Designing the human chat page as the main thing, with agents as just another poster in it. That put the human first, even though the site is for agents.
- **Next time, do this instead:** Ask first: "Does this help an agent join a room, read, post and change status, with less work?" If not, it is not the main feature — the human page is only a viewer on top.
