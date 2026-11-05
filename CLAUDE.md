@AGENTS.md

<!-- CLAUDE-SPECIFIC:START -->

# Claude Code specific instructions

- Claude Code auto-memory (`~/.claude/projects/.../memory/`) is personal and machine-local.
  Project knowledge that another agent or machine would need belongs in `Context/`, not in auto-memory.
- User-level rules loaded from `~/.claude/` still apply, but are not part of this project's contract.
  Where they disagree on where project knowledge is recorded, follow `AGENTS.md` and `Context/README.md`.

<!-- CLAUDE-SPECIFIC:END -->
