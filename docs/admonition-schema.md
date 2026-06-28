# Admonition & Aside Authoring Schema

How to place an aside in a content entry. Every callout/aside is tagged on **two axes**: *what it is* (Type) and *how prominent it should be* (Tier). The container you write it in decides placement; the `[!TYPE]` marker decides flavor.

> One rule to remember: **the marker always sits right after the container opener** — `> [!TYPE]`, `>>> [!TYPE]`, `[^id]: [!TYPE]`.

> See **[Content features](./content-features.md)** for the rest of the markdown/prose pipeline (figures, directives, math, mermaid, sidenotes, the reading apparatus, search, and media). This doc owns the aside Type×Tier system.

## Axis 1 — Type (what it is)

| Type | Glyph | Color | Use for | Smell test |
|------|-------|-------|---------|------------|
| `NOTE` | info | accent blue | neutral clarification, a definition, context | "To be clear…", "Note that…" |
| `TIP` | lightbulb | green | actionable advice, a shortcut, a recommendation | "Pro tip…", "What worked for me…" |
| `CAUTION` | ☡ (one bend) | amber | subtle/tricky material, easy to misread, a common mistake | "Careful…", "Counterintuitively…" |
| `DANGER` | ☡☡ (two bends) | red | a serious pitfall, costly mistake, strong "don't" | "This will burn you", "Never…" |

## Axis 2 — Tier (how prominent)

| Tier | Vehicle | Reader meets it… | Right for content that's… |
|------|---------|------------------|---------------------------|
| 1. Inline | body prose | always, in the flow | core to the argument |
| 2. Body admonition | full-width box | always — *interrupts* | important to **every** reader (a real warning / key tip) |
| 3. Margin admonition | a **typed sidenote** (icon + tint in the gutter) | wide screens, optional; folds to a footnote on mobile | a *flavored* aside worth flagging but skippable |
| 4. Plain sidenote | margin note | optional | neutral elaboration, a "by the way" |
| 5. Footnote / citation | bottom of page | only if they dig | a pure source / attribution |

## The markup

| Tag (Type / Tier) | Write | Renders as |
|-------------------|-------|------------|
| **Type / body** (single ¶) | `> [!CAUTION]`<br>`> Text.` | full-width admonition box |
| **Type / body** (multi-¶, paste-friendly) | `>>> [!CAUTION]`<br>`First paragraph.`<br><br>`Second paragraph.`<br>`>>>` | full-width admonition box, multiple paragraphs |
| **Type / margin** (Tier 3) | `…claim.[^id]`<br><br>`[^id]: [!CAUTION] The note.` | typed sidenote — icon + tint in the gutter; bold label on mobile |
| **— / sidenote** (Tier 4) | `…claim.[^id]`<br><br>`[^id]: The note.` | plain sidenote |
| inline (Tier 1) | just prose | — |

### Two ways to write a body admonition

- **Single-paragraph:** a `>` blockquote — `> [!TYPE]` on the first line, body on the following `>` lines.
- **Multi-paragraph / pasting:** a GitLab-style `>>> … >>>` fence — open with `>>> [!TYPE]`, write any number of paragraphs with **no** per-line `>`, close with a bare `>>>`. A single blank line inside = a paragraph break; the fence is what bounds the block.

```markdown
>>> [!CAUTION]
First paragraph of a longer note.

Second paragraph — pasted as-is, no prefixing.
>>>
```

Both forms render identically for one paragraph; use the fence whenever you'd otherwise be prefixing many lines with `>`.

## Decision rule (per aside)

1. Essential to the argument? → leave it **inline** (Tier 1).
2. Must *everyone* see it? → **body admonition** (Tier 2): `> [!TYPE]` (short) or `>>> [!TYPE] … >>>` (long) + a Type.
3. Flavored but skippable? → **margin admonition** (Tier 3): `[^id]: [!TYPE] …`.
4. Neutral elaboration / tangent? → **plain sidenote** (Tier 4): `[^id]: …`.
5. Just a source? → **footnote** (Tier 5): `[^id]: …` (same as Tier 4; cite normally).

## Notes & gotchas

- `TYPE` is one of `NOTE` · `TIP` · `CAUTION` · `DANGER` (case-insensitive), always in `[!…]`.
- In a `>` blockquote, keep the `[!TYPE]` line and the body in the **same** blockquote — a bare `>` on a blank line continues it; a blank line with no `>` splits it into two blockquotes.
- A `>>>` fence must be **closed** with a bare `>>>`; an unclosed fence is left as raw text (a visible "you forgot to close it" signal).
- `>>>` inside a fenced code block (e.g. a Python REPL prompt) is **not** treated as a fence.
- Severity is encoded by the dangerous-bend signpost: Caution = one ☡, Danger = two ☡☡.
