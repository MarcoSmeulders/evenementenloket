#!/usr/bin/env bash
# loket-ux-validate-bash.sh
# PreToolUse guard for the ux-reviewer subagent.
#
# The UX reviewer is allowed to RUN read-only accessibility/analysis tooling
# (axe via Playwright, Pa11y, Lighthouse, eslint in check mode, etc.) — including
# via npx / pnpm exec — because that is how a live audit is performed. This guard
# therefore BLOCKS (exit 2) only commands that would MUTATE the repo, dependencies,
# git state, or system; everything read-only or analysis-only passes through (exit 0).
#
# What stays blocked: filesystem writes/deletes, in-place edits, shell redirection
# to real files, git state changes, package-manager install/add/remove/update,
# auto-fix/--write flags, privileged/destructive/system commands, file downloads.
#
# This is defense-in-depth alongside the agent's `tools` list (no Edit/MultiEdit)
# and the companion write guard. A block here is expected behaviour, not an error —
# the reviewer should describe the fix or recommend the tool, not force it. Note:
# this guard inspects the shell command string; it cannot stop an analysis tool the
# reviewer legitimately runs from writing its own scan-output files (e.g. a
# Lighthouse JSON report). Source protection comes from the tools allowlist + the
# write guard, not from policing tool byproducts.
#
# Used by .claude/agents/loket-ux-reviewer.md via $CLAUDE_PROJECT_DIR.

set -euo pipefail

INPUT="$(cat)"

# --- Extract the command field (jq preferred, python fallback, raw last) ---
extract_command() {
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$INPUT" | jq -r '.tool_input.command // empty'
  elif command -v python3 >/dev/null 2>&1; then
    printf '%s' "$INPUT" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null || true
  else
    # Last resort: scan the whole payload.
    printf '%s' "$INPUT"
  fi
}

CMD="$(extract_command)"
[ -z "$CMD" ] && exit 0

block() {
  echo "Blocked by ux read-only guard: $1 The ux-reviewer may run read-only analysis tooling but must not modify the repo, dependencies, or system. Describe the fix (or recommend the tool) instead of applying it." >&2
  exit 2
}

# Normalise for matching.
LC="$(printf '%s' "$CMD" | tr '[:upper:]' '[:lower:]')"

# --- 1. File-system mutations -------------------------------------------------
echo "$LC" | grep -Eq '(^|[;&|[:space:]])(rm|rmdir|unlink|mv|cp|touch|mkdir|tee|truncate|shred|ln|chmod|chown|chgrp|install)([[:space:]]|$)' \
  && block "filesystem-modifying command detected."

# In-place editors
echo "$LC" | grep -Eq '(sed[[:space:]]+-i|perl[[:space:]]+.*-i|ed[[:space:]])' \
  && block "in-place file edit detected."

# --- 2. Output redirection to a real file (allow only /dev/null & fd dups) ----
STRIPPED="$(printf '%s' "$LC" \
  | sed -E 's/(1|2|&)?>>?[[:space:]]*\/dev\/null//g; s/(1|2)?>&[12]//g; s/&>[[:space:]]*\/dev\/null//g')"
echo "$STRIPPED" | grep -Eq '>>?' \
  && block "output redirection to a file detected. Use a tool's own --output flag if it must write a scan report."

# --- 3. Git state mutations ---------------------------------------------------
echo "$LC" | grep -Eq 'git[[:space:]]+(add|commit|push|pull|fetch|checkout|switch|reset|restore|rebase|merge|cherry-pick|revert|stash|clean|rm|mv|tag|branch|apply|am|filter-branch|gc|prune|remote|init|clone|worktree|notes|update-ref|config)([[:space:]]|$)' \
  && block "git command that can change repository state."
# (Allowed git: status, diff, log, show, blame, grep, ls-files, shortlog, describe, rev-parse, cat-file.)

# --- 4. Package / dependency mutations ---------------------------------------
# Note: npx / pnpm exec / dlx / bunx are intentionally ALLOWED so the reviewer can
# run analysis tools. Only mutating subcommands are blocked.
echo "$LC" | grep -Eq '(npm|pnpm|yarn|bun)[[:space:]]+(i|in|ins|install|ci|add|remove|rm|uninstall|update|upgrade|up|link|unlink|publish|dedupe|prune)([[:space:]]|$)' \
  && block "package manager mutation detected. The toolchain must already be installed; recommend it instead."

# --- 5. Auto-fix / write flags on linters & formatters ------------------------
echo "$LC" | grep -Eq '(\-\-fix|\-\-write|\-\-apply|\-\-fix-dry-run=false)([[:space:]]|$)' \
  && block "auto-fix/write flag detected; run the tool in check-only mode."

# --- 6. Privilege / destructive system commands & file downloads -------------
echo "$LC" | grep -Eq '(^|[;&|[:space:]])(sudo|doas|dd|mkfs|mount|umount|systemctl|service|kill|killall|pkill|shutdown|reboot|crontab|wget)([[:space:]]|$)' \
  && block "privileged or destructive system command detected."
echo "$LC" | grep -Eq 'curl[[:space:]]+.*(-o|-O|--output|--remote-name)' \
  && block "curl download-to-file detected. Use WebFetch for page content."

# --- Passed all checks: allow ------------------------------------------------
exit 0
