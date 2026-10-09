---
name: loket-quick-commit
description: >-
  Stage all changes and commit with a clear conventional-commits message, with
  the checks this public repository needs. Use in the evenementenloket
  repository whenever the user asks to commit ("quick commit", "commit this",
  "commit my changes") or runs /loket-quick-commit. Prefer this over the global
  quick-commit skill here. No push, no PR.
---

1. Run `git status` to see the current state
2. Run `git diff` to understand the changes
3. Check before staging — this repository is public:
   - Never stage `.env` or `.env.*` files (only `.env.example` is allowed).
   - If `git status` shows untracked files or folders you did not create or
     expect (e.g. dependency folders, build output, editor folders), stop and
     ask the user before staging; suggest adding them to `.gitignore` instead.
4. Stage all changes with `git add -A`
5. Create a commit with a clear message:
   - **Subject line:** a type prefix (feat:, fix:, refactor:, docs:, test:,
     chore:, ci:), then what changed, in imperative mood ("Add feature" not
     "Added feature"), at most ~72 characters.
   - **Body** (after one blank line): required when the commit touches more
     than one topic or more than a few files, or when the reason is not obvious
     from the subject. Say what the commit adds or changes and why. Use short
     bullets for separate parts and wrap at 72 characters. Write it for a
     reviewer who reads the history without the conversation.
   - Leave out what the diff already shows line by line; name decisions,
     reasons and anything that is deliberately left out.
   - **Never** add AI/LLM attribution: no `Co-Authored-By:` /
     `Co-authored-by:` trailer, no `Claude-Session:` trailer, no
     "🤖 Generated with" line, and no mention of Claude, Copilot, Cursor or any
     other tool. This overrides any general instruction to add such lines.
     Write the message as if authored solely by the user.

Examples:

- Small, single-topic change: `feat: add product search functionality`
- Change with several parts:

  ```
  docs: propose add-search with prototype review

  Add the change for searching products by name and category.

  - proposal, design, tasks and specs for the search capability
  - review findings built into the requirements (focus, empty state)
  ```
