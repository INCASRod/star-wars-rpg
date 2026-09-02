# RichText shortcode reference

Authoritative reference for the shortcode markup accepted by `parseSymbols`
(`src/lib/parseSymbols.ts`) and rendered by `RichText`/`MarkupText`
(`src/components/ui/RichText.tsx`, `src/components/ui/MarkupText.tsx`). Used
in item descriptions/effects, talent descriptions, force power/sig ability
node text, weapon/armor quality text, specialization/career/species
descriptions, adversary text, and loot descriptions — anywhere `RichText` or
`MarkupText` wraps stored text.

## Full-word keys

These are the canonical keys. Write them as `[key]`, or `[key:N]` to repeat:

| Key | Renders |
|---|---|
| `success` | Success symbol |
| `failure` | Failure symbol |
| `advantage` | Advantage symbol |
| `threat` | Threat symbol |
| `triumph` | Triumph symbol |
| `despair` | Despair symbol |
| `light` | Light-side Force pip |
| `dark` | Dark-side Force pip |
| `fp` | Neutral Force pip (◑, spendable as light or dark) |
| `boost` | Boost die |
| `ability` | Ability die |
| `proficiency` | Proficiency die |
| `setback` | Setback die |
| `difficulty` | Difficulty die |
| `challenge` | Challenge die |
| `force` | Force die |

Matching is case-insensitive for these keys: `[Boost]`, `[BOOST]`, and
`[boost]` all work.

## OggDude bracket aliases (primary way to write individual dice)

This is the short-form dialect most existing ref/OggDude content actually
uses. These are the ONLY short codes recognized — anything not in this table
is not a valid alias:

| Alias | Maps to | Alias | Maps to |
|---|---|---|---|
| `bo`, `bst` | boost | `su` | success |
| `se`, `set`, `bl` | setback | `fa` | failure |
| `di`, `dif` | difficulty | `ad` | advantage |
| `ch`, `chl` | challenge | `th` | threat |
| `fo` | force | `tr` | triumph |
| `pr`, `pro` | proficiency | `de` | despair |
| `ab`, `abl` | ability | `fp` | neutral Force pip |
| | | `li` | light-side pip |
| | | `da`, `dp` | dark-side pip |

Aliases are case-insensitive: `[BO]`, `[Bo]`, `[bo]` are equivalent.

## Count syntax: `[key:N]`

Any key or alias above accepts a trailing `:N` to repeat it N times, e.g.
`[difficulty:3]` renders three difficulty dice, `[boost:2]` renders two boost
dice. N must be a positive integer (`:0` or non-numeric text is not valid and
will not match). Grammar: `[key(:digits)?]`, e.g. matched by
`/\[([a-z][a-z0-9]*)(?::(\d+))?\]/gi`.

A run of 2+ dice/symbol glyphs produced by one expansion (a `[key:N]` with
N>1, or a `:tier+N:` upgrade — see below) is rendered as one unbreakable
inline unit (`.richtext-dice-group` in `globals.css`) so it cannot wrap
across a line break.

## Formatting tags

Case-SENSITIVE — uppercase opens, lowercase closes:

| Tag | Effect |
|---|---|
| `[B]` ... `[b]` | Bold. **Lowercase `[b]` is bold-CLOSE, not the boost die.** |
| `[I]` ... `[i]` | Italic |
| `[H3]` ... `[h3]` | Heading (larger, bold) |
| `[H4]` ... `[h4]` | Heading (bold) |
| `[P]` | Paragraph break |
| `[BR]` | Line break |

## Colon-style difficulty tiers

A separate pre-pass (run before bracket parsing) recognizes `:tier:` and
expands it to the tier's base difficulty dice. This syntax is colon-delimited
(`:hard:`), NOT bracket-delimited (`[hard]` is not valid).

| Tier | Base difficulty dice |
|---|---|
| `:simple:` | 0 (no dice) |
| `:easy:` | 1 |
| `:average:` | 2 |
| `:hard:` | 3 |
| `:daunting:` | 4 |
| `:formidable:` | 5 |

Also recognized in the same colon pre-pass, unrelated to tiers:
`:lightside:` → light pip, `:darkside:` → dark pip, `:forcepip:` → neutral pip.

### Tier upgrade syntax: `:tier+N:`

Append `+N` (N a positive integer) to upgrade a tier's difficulty pool N
times before rendering it, per FFG RAW: each upgrade converts the lowest
remaining difficulty die to a challenge die; once no difficulty dice remain,
an upgrade instead **adds** a difficulty die (which becomes eligible for
conversion by a later upgrade in the same chain). This only ever produces
difficulty/challenge dice — there is no positive-side (ability→proficiency)
equivalent; that is out of scope for this syntax.

Worked example — `:hard+N:` (base 3 difficulty):

| Syntax | Difficulty | Challenge |
|---|---|---|
| `:hard:` | 3 | 0 |
| `:hard+1:` | 2 | 1 |
| `:hard+2:` | 1 | 2 |
| `:hard+3:` | 0 | 3 |
| `:hard+4:` | 1 | 3 |
| `:hard+5:` | 0 | 4 |
| `:hard+6:` | 1 | 4 |

Notice the pattern repeats: once the pool is empty (`:hard+3:`), the next
upgrade (`+4`) adds a difficulty die back rather than a fourth challenge die,
then `+5` converts it again. This alternation continues indefinitely.

`:easy+N:` (base 1 difficulty): `:easy+1:` → 0 difficulty / 1 challenge;
`:easy+2:` → 1 difficulty / 1 challenge.

`:simple+N:` (base 0 difficulty) is an open question — see
`docs/architecture.md` for the flagged decision. As implemented,
`:simple+1:` produces **1 difficulty, 0 challenge** (the "no dice left, add
one" branch fires immediately since the base pool is already empty) — this
has NOT been confirmed against a human's intended default and may need
revisiting.

The `+N` form only matches when the tier name is exactly one of the six
words above (`/:(simple|easy|average|hard|daunting|formidable)\+(\d+):/gi`)
— a stray colon-delimited word elsewhere in prose cannot trigger it, since
the alternation has no wildcard branch.

## Unknown-token error chip

Writing an unrecognised key WITH an explicit `:N` count — e.g. `[d:3]`,
`[foo:2]` — renders as a visible red-outlined error chip showing the exact
text you typed, both in the editor Preview and in play. This only fires on
the `:N` form: an unrecognised key with no count (`[d]`, `[Engaged]`) still
renders as plain literal text, because real ref/OggDude content legitimately
uses bare `[Word]` brackets for non-shortcode prose (range bands like
`[Engaged]`/`[Short]`/`[Medium]`/`[Planetary]`, the credit-symbol `[R]`) —
those never carry a `:N` suffix, so only the count form is safe to flag as
a typo.

## Common mistakes

- **`[d]` is NOT valid** — and will NOT chip (no count suffix). Write
  `[difficulty]`/`[di]` for one difficulty die, `[difficulty:3]`/`:hard:` for
  three. **`[d:3]` IS flagged** with an error chip, since the `:N` form is
  unambiguous authoring intent.
- **`[hard]` is NOT valid.** Difficulty tiers are colon-delimited (`:hard:`),
  not bracket-delimited. `[hard]` renders as literal text.
- **`:d:` is NOT valid.** Colon codes use the same full tier/alias words as
  everything else (`:hard:`, `:lightside:`), not single letters.
- Formatting tags are case-sensitive: writing `[b]` where you meant "boost
  die" silently closes bold instead (and boost isn't `b` anyway — it's
  `[boost]` or `[bo]`).
