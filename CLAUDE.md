# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`ba-ide-mvp` — a browser-based Business Analyst IDE for creating and editing flow diagrams. Static Next.js export served by a Rust/Axum backend. Frontend code lives in `src/`, backend in `backend/`.

## Commands

Frontend (run from repo root):

```bash
npm run dev      # Dev server at localhost:3000
npm run build    # Static export → /out directory
npm run lint     # ESLint
```

Backend (run from `backend/`):

```bash
cp .env.example .env   # first time — set JWT_SECRET
cargo check            # compile check
cargo run              # start server (default :8080)
cargo build --release  # production binary
cargo test             # run integration tests
```

No frontend test suite is configured yet.

## Architecture

### Layout

VS Code-style three-panel layout, entirely in one client component (`src/app/page.tsx`):

- **Left sidebar** — file explorer (static; only `diagram.mmd` is shown)
- **Center** — Monaco code editor above an optional error terminal panel
- **Canvas** — React Flow interactive diagram fills remaining space
- **Right panel** — Shapes Library for drag-and-drop node insertion

All panels are resizable via drag handles; widths are local state (`explorerWidth`, `editorWidth`, `rightPanelWidth`).

### Bidirectional Sync: Code ↔ Diagram

The core mechanic is two-way sync between a Mermaid text string and React Flow `nodes`/`edges` state:

- **Code → Diagram**: `parseMermaid(code)` produces `{ nodes, edges }`. Triggered by the "Sync Code to Visual" button. Parse errors appear in the Problems terminal with Monaco error markers on the offending line.
- **Diagram → Code**: `generateMermaidFromFlow(nodes, edges)` rebuilds the Mermaid string. Called automatically via `updateCodeFromFlow()` on every canvas interaction (drag stop, connect, drop, resize).

### Extended Mermaid Syntax

The parser extends standard Mermaid with `%%` metadata to persist node geometry across round-trips:

```
nodeId["Label"] %% shape:actor x:100 y:200 w:120 h:40
```

`generateMermaidFromFlow` always writes this metadata back. Standard Mermaid tools will ignore the `%%` comments.

### Custom React Flow Components

- **`CustomShapeNode`** — renders 20 shape types via CSS transforms/border-radius on a single `div`. Supports inline double-click editing, `NodeResizer`, and 8 connection handles (appear on hover/select).
- **`SmartEdge`** — computes source/target positions from node center + dimensions directly, bypassing React Flow's built-in handle routing. Handles self-loops (cubic bezier), bidirectional edges (curved offset paths), and inline double-click label editing.

### Edge Consolidation

`consolidateEdges(edges)` runs on every edge mutation: if two nodes have edges in both directions, merges them — same label → one bidirectional arrow (`markerStart` + `markerEnd`), different labels → two parallel curved edges (`data.isCurved: true`).

### Theme System

`isDarkMode` state drives a `theme` object mapping semantic keys (`bgMain`, `border`, `toolbar`, etc.) to Tailwind class strings. All components consume `theme.X` instead of hardcoded dark/light classes.

## Backend (Rust / Axum)

Source tại `backend/`. Chạy từ thư mục đó:

```bash
cp .env.example .env          # lần đầu — sửa JWT_SECRET
cargo check                   # kiểm tra compile
cargo run                     # khởi động server (mặc định :8080)
cargo build --release         # production binary
```

`GET /api/health` → `{ "ok": true, "version": "..." }` (ping DB thực sự, không chỉ process check).

Frontend static build (`next build`) được serve bởi `ServeDir` trỏ vào `STATIC_DIR` (mặc định `../out` — relative to `backend/`). Không cần CORS vì cùng origin.

Migrations chạy tự động lúc startup (`sqlx::migrate!("./migrations")`). Thêm migration mới = tạo file `migrations/00N_name.sql` (không sửa file cũ).

## Key Constraints

- **Static export only** — `next.config.ts` sets `output: 'export'` and `images.unoptimized: true`. No server features, API routes, or Server Components.
- **Single-file component** — all logic is in `page.tsx`. Extracting to `components/` and `hooks/` subdirectories is the natural next step if the file grows.
- **No persistence** — diagram state is in-memory only. The Save/Download toolbar buttons are visual placeholders not yet implemented.
- **`panActivationKeyCode={null}`** on `ReactFlow` — panning is always active (no modifier key required).

---

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **UBA** (41 symbols, 57 relationships, 1 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/UBA/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/UBA/context` | Codebase overview, check index freshness |
| `gitnexus://repo/UBA/clusters` | All functional areas |
| `gitnexus://repo/UBA/processes` | All execution flows |
| `gitnexus://repo/UBA/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->