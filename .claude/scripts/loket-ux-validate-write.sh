#!/usr/bin/env bash
# loket-ux-validate-write.sh
# PreToolUse guard for the ux-reviewer subagent (Write/Edit/MultiEdit/NotebookEdit).
#
# The UX reviewer produces an artefact (its report) and, in the memory variant,
# curates its own notebook. Enabling those means Write is available — this guard
# keeps that power scoped. It ALLOWS writes only to:
#   1. the review report / tracker:  docs/ux-reviews/*.{md,csv,json};
#   2. the reviewer's memory dir:     …/agent-memory[-local]/loket-ux-reviewer/…
# and BLOCKS (exit 2) writes to source code, config, or anywhere else. The reviewer
# stays read-only for the artefact it audits — it advises; it never applies the fix.
#
# Used by .claude/agents/loket-ux-reviewer.md via $CLAUDE_PROJECT_DIR.

set -euo pipefail

INPUT="$(cat)"

extract_path() {
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$INPUT" | jq -r '.tool_input.file_path // .tool_input.notebook_path // empty'
  elif command -v python3 >/dev/null 2>&1; then
    printf '%s' "$INPUT" | python3 -c 'import sys,json; t=json.load(sys.stdin).get("tool_input",{}); print(t.get("file_path") or t.get("notebook_path") or "")' 2>/dev/null || true
  else
    printf '%s' "$INPUT"
  fi
}

P="$(extract_path)"

block() {
  echo "Blocked by ux write guard: $1 The ux-reviewer may only write its review report (docs/ux-reviews/*.md / .csv / .json) and its own memory directory. It must not modify the reviewed code or design — describe the fix instead." >&2
  exit 2
}

# No path resolved -> can't verify -> block to be safe.
[ -z "$P" ] && block "could not determine the target path."

# 1. Review report / tracker inside the project's docs/ux-reviews/ folder.
printf '%s' "$P" | grep -Eq '(^|/)docs/ux-reviews/[^/]+\.(md|csv|json)$' && exit 0

# 2. The reviewer's memory directory (user, project, or local scope).
printf '%s' "$P" | grep -Eq 'agent-memory(-local)?/loket-ux-reviewer/' && exit 0

block "target '$P' is outside the report outputs and the memory directory."
