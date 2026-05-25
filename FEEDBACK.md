# Feedback Log

Your AI assistant has been instructed to log friction here as it works on
the extension. Add your own observations too — anything that surprised you,
slowed you down, or felt awkward.

**The Walrus Memory team reads this file after the workshop.** Specific is better
than polite. Mild observations are still useful — log them.

---

## How to log an entry

Each entry has four short lines. Bullet points are fine; full sentences
aren't required.

- **Where it hit:** The moment, file, or command where you ran into it.
- **What was missing:** What didn't `SKILL.md`, `CLAUDE.md`, or the docs
  tell you that you needed to know?
- **What you did instead:** Where did the answer actually come from —
  Claude/your AI, the Sui docs, the SDK source, trial and error?
- **Workshop impact:** If the next participant hits this, would it block
  them? Confuse them? Be a minor annoyance?

---

## What counts as "worth logging"

- Something in `SKILL.md` that was ambiguous, missing, or wrong
- An SDK call that returned a shape you weren't expecting
- A dashboard step that wasn't obvious
- A naming choice that confused you
- A workflow that took more steps than you expected
- An error message that didn't help you understand what was wrong
- Anywhere your AI had to fill a gap by reading source or external docs

If in doubt, log it.

---

## SDK & docs gaps

- **Where it hit:** Running `pnpm setup` and `pnpm install` on a Windows environment.
- **What was missing:** `SKILL.md` and `CLAUDE.md` do not mention cross-platform CLI script restrictions for `approve-builds` on Windows.
- **What you did instead:** Troubleshooted shell execution policies and manually overrode pnpm build configs with the AI.
- **Workshop impact:** Confuse / Block for Windows users.

## SDK & UX surprises

- **Where it hit:** Getting a `401 Unauthorized` error right after running `pnpm dev`.
- **What was missing:** The SDK error was too generic. It didn't specify that the Public Key was accidentally pasted instead of the Private Key in `.env.local`.
- **What you did instead:** Re-verified dashboard keys and used the correct hex private key with the AI's help.
- **Workshop impact:** Confuse.

## Dashboard & onboarding

- **Where it hit:** Copying credentials into `.env.local` using standard Windows Notepad.
- **What was missing:** No warning that basic text editors might introduce hidden carriage returns (`\r`), causing the `.env` parser to fail silently.
- **What you did instead:** Sanitized the environment file lines.
- **Workshop impact:** Minor annoyance.

## AI assistant friction

- **Where it hit:** Parsing environment variables in Next.js backend.
- **What was missing:** The AI got initially confused by the hidden Windows character formats (`\r\n`) inside the `.env.local` file when reading credentials.
- **What you did instead:** Explicitly guided the AI to analyze the raw file structure and clean up the strings.
- **Workshop impact:** Minor annoyance.

## What worked well

- The two-verb model (`remember` / `recall`) is incredibly intuitive and clean to understand!
- Having `SKILL.md` and `CLAUDE.md` directly in the root is an amazing paradigm for prompting AI assistants.

## One thing I'd change

- Provide a clearer Windows onboarding guide or script compatibility since most developers might face strict execution policies or notepad encoding bugs.
