---
name: loket-ux-reviewer
description: >-
  Run the loket-ux-reviewer on a component, design, live URL, or screenshot of
  this project — audits against WCAG 2.2 AA, EN 301 549 / EAA, the WAI-ARIA APG
  and usability heuristics, then writes a teaching report (Dutch by default) to
  docs/ux-reviews/. Never edits the reviewed artefact. Use ONLY when the user
  runs /loket-ux-reviewer or explicitly asks to run the UX / accessibility review.
---

# loket-ux-reviewer — run the UX & accessibility reviewer

Delegate to the **loket-ux-reviewer** subagent (`.claude/agents/loket-ux-reviewer.md`).
It never modifies the artefact it reviews; two PreToolUse guards in `.claude/scripts/`
confine it to reading and to writing only its report under `docs/ux-reviews/`.

## Scope

- If an argument is given, review that — a code path or glob, a live URL, an
  image/screenshot path, or a Figma export/description.
- Otherwise, ask which screen/flow to review and against which level (AA is the
  default). Ask that one question only — don't interrogate further.

## What to ask the agent for

Have the loket-ux-reviewer follow its **loket-ux-review-core** workflow: frame the
input type and state plainly what it can and cannot verify, evaluate conformance and
usability together, run real a11y tooling only if it is already installed (and
never present a clean scan as proof of accessibility), then write
`docs/ux-reviews/ux-review_[target]_[YYYY-MM-DD].md` with prioritised findings
(severity · effort · confidence, each mapped to a WCAG criterion and the person
affected), a "Verdieping" deep-dive, and a "Groei als UX Engineer" section. Offer a
CSV/JSON tracker on request. It must not modify the reviewed code, design, or app.
