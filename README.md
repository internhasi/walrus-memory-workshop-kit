# Walrus Memory Workshop Kit — Reading Tracker

A minimal Next.js app that exercises the core Walrus Memory surface:

- `analyze()` — extract atomic facts from a paragraph and store each one as a memory
- `remember()` — store the raw text exactly as typed
- `recall()` — semantic search over your stored memories

Single screen. No database, no auth. Memory persists across sessions, models, and
devices via your Walrus Memory account.

## Branches

- `main` — the workshop starting point (this code).
- `extension/multi-namespace` — adds a namespace selector inside the tracker.
- `extension/verifiability` — adds a "what's on Walrus" panel using `restore()`.
- `extension/decisions-log` — adds a second app at `/decisions` sharing the same account.
- `extension/permissions-dashboard` *(stretch)* — adds an on-chain delegate key management view.

Each extension branch is a completed reference implementation. Workshop
participants start from `main` and build their chosen extension themselves
with Claude Code + the Walrus Memory SDK skill file.

## What Walrus Memory is

Walrus Memory is a privacy-first AI memory layer for Sui + Walrus.
See https://docs.memwal.ai and the SDK at https://www.npmjs.com/package/@mysten-incubation/memwal.

## Using Claude Code in this repo

Two files at the repo root are written for AI assistants:

- **`SKILL.md`** — a self-contained Walrus Memory SDK reference (installation, API surface,
  troubleshooting). Snapshot of https://github.com/MystenLabs/MemWal/blob/main/SKILL.md.
- **`CLAUDE.md`** — project conventions and guardrails for Claude Code.

Both are picked up automatically by Claude Code. If you're using a different AI
tool, paste `SKILL.md` into context before asking it to write Walrus Memory code.

## Prerequisites

- Node.js 18+ (22 recommended — matches the rest of the monorepo)
- pnpm
- A Walrus Memory account + a delegate key

## Setup

1. **Get credentials.** Sign in at one of:
   - Production (mainnet): https://memwal.ai
   - Staging (testnet): https://staging.memwal.ai

   Copy your **delegate private key** and your **account ID**.

2. **Configure.**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `MEMWAL_PRIVATE_KEY` (the delegate **private** key shown in the
   dashboard — *not* the public key) and `MEMWAL_ACCOUNT_ID`. If you used
   staging, also set `MEMWAL_SERVER_URL=https://relayer.staging.memwal.ai`.

   You can sanity-check your env before starting the dev server:
   ```bash
   pnpm verify
   ```
   This derives the public key from `MEMWAL_PRIVATE_KEY` and prints it so
   you can compare against the dashboard.

3. **Install + run.**
   ```bash
   pnpm install
   pnpm dev
   ```
   Open http://localhost:3000.

## How to use

- Type a paragraph about something you read into the **log** card and hit save.
  `analyze()` extracts atomic facts and stores each one. The extracted facts
  show up underneath.
- Type a natural-language question into the **recall** card and hit recall.
  `recall()` does a semantic search across everything you've stored under the
  `reading-tracker` namespace and shows the top 10 matches with distance scores.

## What's wired

| Surface | File |
|---|---|
| Walrus Memory client (cached per process) | `lib/memwal.ts` |
| Server actions (`analyzeEntry`, `rememberEntry`, `searchReadingHistory`) | `app/actions.ts` |
| UI (one client component) | `app/page.tsx` |
| Env sanity-check script | `verify.ts` |

## Notes

- Memories are namespaced to `reading-tracker`. To start fresh, change the
  namespace in `lib/memwal.ts`.
- Saving uses `analyzeAndWait()`, which blocks until each extracted fact is
  durable. This avoids the ~3s indexer-lag window where a freshly-stored memory
  isn't yet recallable.
- The delegate key lives in `.env.local` and stays server-side. Server actions
  call Walrus Memory; the browser only sees plaintext results.
