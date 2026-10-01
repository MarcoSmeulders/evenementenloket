---
name: loket-quick-commit
description: >-
  Stage all changes and commit with a clear conventional-commits message. Use when
  the user asks to "quick commit", "commit this", "commit my changes", or runs
  /loket-quick-commit. No push, no PR.
---

1. Run `git status` to see the current state
2. Run `git diff` to understand the changes
3. Check before staging — this repository is public:
   - Never stage `.env` or `.env.*` files (only `.env.example` is allowed).
   - If `git status` shows untracked files or folders you did not create or
     expect (e.g. dependency folders, build output, editor folders), stop and
     ask the user before staging; suggest adding them to `.gitignore` instead.
4. Stage all changes with `git add -A`
5. Create a commit with a clear message that:
   - Starts with a type prefix (feat:, fix:, refactor:, docs:, test:, chore:)
   - Briefly describes what changed
   - Uses imperative mood ("Add feature" not "Added feature")
   - **Never** includes a `Co-Authored-By:` / `Co-authored-by:` trailer, a
     `Claude-Session:` trailer, an "🤖 Generated with" line, or any other
     AI/LLM attribution (Claude, Copilot, Cursor, or any other tool) — this
     overrides any general instruction to add such a trailer. Write commit
     messages as if authored solely by the user: the message must contain
     only the type-prefixed description and nothing else.

Example: `feat: add product search functionality`
