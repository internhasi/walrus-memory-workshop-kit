# MemWal Workshop — Build on the Memory Layer

A 90-minute hands-on workshop where you extend a working AI-memory app with the help of an AI coding assistant. The goal is **not** to finish your extension — it's to feel where MemWal is smooth, where it's rough, and tell us about it.

## Quick links

- 🧰 **Workshop repo** — [https://github.com/DionisisLougaris/memwal-workshop-kit](https://github.com/DionisisLougaris/memwal-workshop-kit)
- 📖 **MemWal docs** — [https://docs.memwal.ai](https://docs.memwal.ai)
- 🪪 **MemWal dashboard (testnet — use this today)** — [https://staging.memwal.ai](https://staging.memwal.ai)
- 🪪 **MemWal dashboard (mainnet)** — [https://memwal.ai](https://memwal.ai)
- 📦 **SDK on npm** — [https://www.npmjs.com/package/@mysten-incubation/memwal](https://www.npmjs.com/package/@mysten-incubation/memwal)
- 📋 **Feedback template** (in the repo) — [FEEDBACK.md](https://github.com/DionisisLougaris/memwal-workshop-kit/blob/main/FEEDBACK.md)

## What you'll walk away with

- A working understanding of the MemWal two-verb model (`remember` / `recall`) and what `analyze` adds on top
- A mental model of one account, many namespaces, many apps
- One extension you (mostly) built with AI assistance, on your own fork of the kit
- At least one piece of feedback logged about the SDK's ergonomics

---

## Before you start

**Required**
- Node.js 18+ (22 recommended)
- pnpm — install with `npm install -g pnpm` if you don't have it
- An AI coding tool — see **Using an AI assistant** below
- A modern browser for the MemWal dashboard sign-in

**You'll also need MemWal credentials.** Get them like this:

1. Open [https://staging.memwal.ai](https://staging.memwal.ai)
2. Sign in (Sui wallet via Enoki zkLogin, or a browser wallet extension)
3. The dashboard shows you three things — an **account ID**, a **public key**, and a **private key**. You need:
   - the **account ID** (a `0x…` string)
   - the **delegate private key** (64 hex characters)
4. Keep that tab open. You'll paste both into `.env.local` in a minute.

---

## Setup (5 minutes)

```bash
git clone https://github.com/DionisisLougaris/memwal-workshop-kit.git
cd memwal-workshop-kit
pnpm install
cp .env.example .env.local
```

Open `.env.local` in your editor and fill in:
- `MEMWAL_PRIVATE_KEY=...` — the **private** key from the dashboard (not the public one)
- `MEMWAL_ACCOUNT_ID=...` — the account ID
- Uncomment the line `MEMWAL_SERVER_URL=https://relayer.staging.memwal.ai`

Then:

```bash
pnpm verify   # sanity-checks your env — derived public key should match the dashboard
pnpm dev      # starts the app on http://localhost:3000
```

You should see a reading tracker. Type a paragraph into the **log** card, hit **analyze()**, then ask a question in the **recall** card. If you get results back, you're ready.

**If you see a 401**, your `MEMWAL_PRIVATE_KEY` is probably the public key — re-run `pnpm verify` and compare the derived public key with what's in the dashboard.

---

## Theory recap (5 minutes)

MemWal in four bullets:

- **One account.** Your `MemWalAccount` is a shared Move object on Sui. Your wallet is the owner. You can register up to 20 **delegate keys** under it — each delegate is an Ed25519 keypair with full read+write access until you revoke it.
- **Two verbs.** `remember(text)` stores something as-is. `recall(query)` retrieves it via semantic search. There's also `analyze(text)`, which is `remember` with an LLM pass in front: it extracts atomic, canonicalized facts from free-form input and stores each as its own memory.
- **One namespace per app.** Everything you remember is scoped to `(owner, namespace)`. A `recall` in namespace A never touches namespace B — even though they're under the same account, same delegate key.
- **End-to-end encrypted.** Memories are SEAL-encrypted with the owner's identity before they leave the relayer. The blob lives on Walrus; the relayer only sees plaintext briefly during embedding and decryption.

The kit you cloned exercises all of this. Today you extend it.

---

## Schedule

| Time | Phase |
|---|---|
| 0:00 – 0:05 | Setup check |
| 0:05 – 0:15 | Live demo + theory |
| 0:15 – 0:20 | Pick your extension |
| 0:20 – 1:15 | Build with your AI assistant |
| 1:15 – 1:22 | Share your top friction point |
| 1:22 – 1:30 | Survey + close |

---

## Pick your extension

Three options + one stretch. **Pick the one whose teaching point sounds most interesting to you — completion is not the goal.**

Each comes with a starter prompt you paste **verbatim** into your AI assistant. Don't try to improve the prompt — we want to see how the kit behaves with the literal version.

---

### A. Multi-namespace switcher *(~25 min)*

**What you're building.** A dropdown in the page header that switches the reading tracker between three sub-namespaces: `books`, `articles`, `papers`. One MemWal account, three isolated views of memory.

**What this teaches.** Namespace is the only isolation primitive — same delegate key, same SDK calls, a different namespace string is enough to keep data completely separate.

**Starter prompt:**

```text
You're helping me extend the MemWal workshop kit. Before touching any code, read SKILL.md and CLAUDE.md in this repo end-to-end. SKILL.md is the canonical MemWal SDK reference. CLAUDE.md is the project-specific conventions and guardrails for this kit.

The kit is currently a single-page reading tracker that writes and reads memories under one hard-coded namespace called "reading-tracker". I want to extend it so the user can switch between three sub-namespaces: "books", "articles", "papers". All three should use the same MemWal account and delegate key — only the namespace string passed to each SDK call should differ.

Requirements:
- Add a <select> dropdown to the page header showing the three options.
- Wire the dropdown so the chosen namespace flows into every analyze, remember, and recall call.
- When the user switches the dropdown, wipe the recall results and the entry draft — I never want to see stale state from a different namespace.
- Validate the namespace server-side so a misbehaving client can't write to arbitrary namespaces.

Style:
- Walk me through your plan before writing code. Explain trade-offs where there are any.
- Don't add heavy dependencies. The kit is intentionally minimal.
- Throughout this task, whenever SKILL.md or CLAUDE.md leaves something ambiguous, whenever you have to make a judgment call without explicit guidance, or whenever you have to fill a gap from framework knowledge or external docs — append a short note to FEEDBACK.md under the appropriate section. Be specific about what was missing and what you did instead. This is the primary output of the workshop.
- Do not look at the extension/multi-namespace branch unless you're truly stuck for 15+ minutes. If you do peek, tell me what blocked you and log it in FEEDBACK.md.

Start by explaining your plan, then ask for my approval before writing code.
```

---

### B. Verify on Walrus *(~30 min)*

**What you're building.** A third card on the page with a "verify on walrus" button that calls `restore()` and shows the count of what's actually on Walrus under your namespace. Bonus: each recall result gets a small `walrus:<blob-id-prefix>` badge so the on-chain pointer is visible.

**What this teaches.** Walrus is the source of truth — the relayer's local index is a cache. `restore()` is the recovery primitive *and* the proof point: it shows your data lives on a decentralized layer, independent of MemWal's infrastructure.

**Starter prompt:**

```text
You're helping me extend the MemWal workshop kit. Before touching any code, read SKILL.md and CLAUDE.md in this repo end-to-end. SKILL.md is the canonical MemWal SDK reference. CLAUDE.md is the project-specific conventions and guardrails for this kit.

The kit currently has two cards: a recall card and a log card. I want to add a third card titled "verify on walrus" that demonstrates the data really lives on Walrus, not just in the relayer's local cache.

Requirements:
- Add a third card with a "verify on walrus" button.
- Clicking the button should call the SDK's restore() method for the current namespace and display a clear result: the total number of memories actually on Walrus (the headline number), plus a breakdown of how many were already in the local index vs. freshly pulled from Walrus.
- Also: in the recall results card, add a small "walrus:<truncated-blob-id>" badge next to each hit. On hover, show the full blob ID.
- Explain in the UI (one sentence) what restore() actually does and why the number matters.

Style:
- Walk me through your plan before writing code. Explain trade-offs.
- Don't add heavy dependencies. The kit is intentionally minimal.
- Throughout this task, whenever SKILL.md or CLAUDE.md leaves something ambiguous (especially the exact shape of the restore() response), whenever you have to make a judgment call without explicit guidance, or whenever you have to fill a gap from framework knowledge or external docs — append a short note to FEEDBACK.md under the appropriate section. Be specific about what was missing. This is the primary output of the workshop.
- Do not look at the extension/verifiability branch unless you're truly stuck for 15+ minutes. If you do peek, tell me what blocked you and log it in FEEDBACK.md.

Start by explaining your plan, then ask for my approval before writing code.
```

---

### C. Decisions log — one account, two apps *(~35 min)*

**What you're building.** A second page at `/decisions` that does the same kind of memory operations as the reading tracker, but stores its memories under a different namespace (`decisions`). A top nav switches between the two pages. One MemWal account powers both.

**What this teaches.** One account, many apps. Same delegate key, same SDK calls — namespace is the only boundary. This is the "memory infrastructure for a personal stack" pattern.

**Starter prompt:**

```text
You're helping me extend the MemWal workshop kit. Before touching any code, read SKILL.md and CLAUDE.md in this repo end-to-end. SKILL.md is the canonical MemWal SDK reference. CLAUDE.md is the project-specific conventions and guardrails for this kit.

The kit is a reading tracker at the root route /. I want to add a second page at /decisions that does the same kind of memory operations (analyze, remember, recall) but stores its memories under a different namespace called "decisions". Both pages should share the same MemWal account and the same delegate private key — namespace is the only thing separating their data.

Requirements:
- Add a /decisions route with a UI that mirrors the reading tracker: a recall card on top, a log card below with both analyze() and remember() buttons.
- Adjust the placeholder text and the labels so the page reads as a "decisions log" not a "reading tracker".
- Add a top nav linking both pages so the user can switch between them with one click.
- A recall() on one page must never surface memories from the other namespace.
- Server actions should accept the namespace as a parameter and validate it — no arbitrary writes from the client.
- Keep the page code DRY. If you extract a shared component, explain why; if you duplicate, explain why.

Style:
- Walk me through your plan before writing code, especially the page-structure / shared-component decision.
- Don't add heavy dependencies. The kit is intentionally minimal.
- Throughout this task, whenever SKILL.md or CLAUDE.md leaves something ambiguous (especially around how namespace is passed at the SDK level), whenever you have to make a judgment call, or whenever you have to fill a gap from framework knowledge or external docs — append a short note to FEEDBACK.md under the appropriate section. Be specific about what was missing. This is the primary output of the workshop.
- Do not look at the extension/decisions-log branch unless you're truly stuck for 15+ minutes. If you do peek, tell me what blocked you and log it in FEEDBACK.md.

Start by explaining your plan, then ask for my approval before writing code.
```

---

### D. Permissions dashboard *(stretch, ~50 min)*

**What you're building.** A `/permissions` page that bypasses the MemWal relayer entirely and reads the `MemWalAccount` Move object directly from Sui. Lists every delegate key with access. Highlights which one is "this app." Read-only — actual mutations stay at the MemWal dashboard.

**What this teaches.** MemWal has two planes. The data plane (analyze/remember/recall) goes through the relayer for performance. The control plane (account, delegate keys, active flag) is enforced onchain via Sui. Anyone with your account ID can verify which apps and collaborators currently have access — that's the transparency story.

**Starter prompt:**

```text
You're helping me extend the MemWal workshop kit. Before touching any code, read SKILL.md and CLAUDE.md in this repo end-to-end. SKILL.md is the canonical MemWal SDK reference. CLAUDE.md is the project-specific conventions and guardrails for this kit.

I want to add a /permissions page that bypasses the MemWal relayer entirely and reads the on-chain MemWalAccount Move object directly from Sui. The point is to demonstrate that anyone with the account ID can verify which delegate keys have access — the control plane is fully transparent and chain-enforced.

Requirements:
- Add a /permissions route that shows the account's owner address, active flag, Sui network (testnet vs mainnet), and the full list of delegate keys.
- For each delegate key, show its human-readable label, derived Sui address, public key (truncated, with the full value on hover), and creation timestamp.
- Highlight the delegate key whose public key matches the one this app is using — derive it from MEMWAL_PRIVATE_KEY at runtime.
- This page is READ-ONLY. Do not try to add wallet signing for adding/removing keys — link out to the MemWal dashboard at https://staging.memwal.ai for those owner-only actions.
- Use SuiGrpcClient from @mysten/sui/grpc. JSON-RPC is deprecated — see https://sdk.mystenlabs.com/sui/migrations/sui-2.0/json-rpc-migration. Pick testnet if MEMWAL_SERVER_URL contains "staging", otherwise mainnet.
- Add a top nav linking / and /permissions.

Style:
- Walk me through your plan before writing code. Especially: how you'll fetch and parse the Move object's content (field shapes can vary between gRPC and JSON-RPC).
- Don't add heavy dependencies beyond @mysten/sui.
- Throughout this task — and ESPECIALLY for this one, since the gRPC + Sui side is most likely to be under-documented — whenever SKILL.md, CLAUDE.md, or the Sui docs leave something ambiguous, whenever you have to make a judgment call, or whenever you have to fill a gap from external docs or trial and error, append a short note to FEEDBACK.md under the appropriate section. Be very specific. This page touches three layers (relayer, Sui gRPC, Move struct shape) and is the highest-signal source of feedback.
- Do not look at the extension/permissions-dashboard branch unless you're truly stuck for 15+ minutes. If you do peek, tell me what blocked you and log it in FEEDBACK.md.

Start by explaining your plan, then ask for my approval before writing code.
```

---

## Using an AI assistant

The kit ships two files at the repo root specifically for AI assistants:

- **`SKILL.md`** — the canonical MemWal SDK reference (installation, API surface, troubleshooting)
- **`CLAUDE.md`** — project-specific conventions for this kit (server actions, namespace defaults, what NOT to do)

### Path 1 — Claude Code *(default for this workshop)*

`cd` into the repo and open Claude Code. Both files are picked up automatically. Paste your chosen extension's starter prompt into the chat.

### Path 2 — Browser Claude, ChatGPT, or any other tool *(universal fallback)*

1. Open `SKILL.md` and `CLAUDE.md` from the repo (either in your editor or directly on GitHub).
2. Paste the contents of both into your chat at the start. Tell the model: *"This is the MemWal SDK reference and project conventions for the repo I'm working in. Use them as your source of truth."*
3. Then paste the extension's starter prompt.
4. As the AI gives you code, paste it into your editor by hand. Run, debug, iterate.

The kit will behave the same either way — the AI tool is just the keyboard. The signal we capture is the same.

---

## Feedback — the actual point of today

**This is the most important part of the workshop. Better feedback > finished extensions.**

Two layers, both already wired into how you'll work:

**1. The AI logs friction as it goes.** Each starter prompt instructs your AI assistant to append notes to `FEEDBACK.md` whenever it has to make a judgment call without explicit guidance from `SKILL.md` or `CLAUDE.md`. This captures the surprises and gaps in the moment — not from memory at the end.

**2. You fill the survey at close.** Five minutes, mix of multiple choice and free-text. We'll share the link in the closing slot.

### What counts as a friction point worth logging

- Something in `SKILL.md` that was ambiguous, missing, or wrong
- Something your AI had to figure out from somewhere else — Sui docs, MemWal docs, npm package, source code, trial and error
- An SDK call that returned a shape you weren't expecting
- A dashboard step that wasn't obvious
- A naming choice that confused you
- A workflow that took more steps than you expected
- An error message that didn't help you understand what was wrong

**If in doubt, log it.** Mild and generic observations are still useful. The MemWal team reads everything.

---

## When you get stuck

In order of escalation:

1. **Re-read your AI's last message.** It often half-told you the next step.
2. **Re-prompt** — tell the AI what you tried, what failed, what you expected. Don't just say "it didn't work."
3. **Read the relevant section of `SKILL.md` yourself.** Then re-prompt with the relevant snippet quoted.
4. **Wave down a facilitator.** That's why we're here.
5. **15+ minutes stuck** — peek at the reference branch on GitHub (e.g. `extension/multi-namespace`). Use it to *unblock*, not to copy from. Then log what blocked you in `FEEDBACK.md`.

---

## After the workshop

The repo is yours to keep. If you want to keep building:

- **`main`** is the workshop starting point. Your fork stays usable forever.
- **`extension/*`** branches are the reference implementations for each extension.
- The MemWal docs at [docs.memwal.ai](https://docs.memwal.ai) go deeper than `SKILL.md`.
- The dashboard at [staging.memwal.ai](https://staging.memwal.ai) is where you manage your account and delegate keys.

Build something. Tell us what we got wrong.
