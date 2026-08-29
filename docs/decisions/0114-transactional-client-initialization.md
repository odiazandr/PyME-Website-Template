---
owner: docs/decisions/0114-transactional-client-initialization.md
authority: canonical
status: active
answers: ["Why is client initialization staged and locked?"]
---
# 0114 — Transactional client initialization

## Decision

Client initialization acquires an exclusive repository-local lock, stages all three canonical replacements beside their owners, moves originals to recoverable backups, commits staged files, and restores originals when staging or commit fails.

## Rationale

The initializer changes one logical client identity across `src/config/site.ts`, `src/data/business.json`, and `memory.toml`. Sequential direct writes could leave some owners changed when a later filesystem write failed, and two simultaneous invocations could both pass the template-mode guard. A lightweight filesystem transaction is justified because it protects existing file-owned state without introducing a runtime database, backend, or external service.

## Recovery

An ordinary failed transaction restores the original owners. A process crash may leave `.pyme-init.lock` or same-directory `.pyme-init-*` staging/backup files. Operators preserve those files, confirm no initializer remains active, and follow the client-initialization runbook before manually removing a stale lock or restoring a backup.

