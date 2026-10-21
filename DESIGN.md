# DESIGN.md — JS-Snake board surface

Design record for the **Stat Rail + Play Column** build (direction contract in
`.impeccable/briefs/board.md`, locked decision sketch in
`.impeccable/mocks/decision/board-4-stat-rail.html`).

## The world (incumbent, preserved)

Dark slate instrument-panel palette carried by CSS custom properties on `:root`
(`styles.css`). Nothing about the palette was invented by this build — it was
read out of the pre-existing theme and re-composed:

| Token | Value | Role |
| --- | --- | --- |
| `--shell-bg` | `#0b1120` | page background |
| `--card-bg` | `#020617` | rail cards, overlays |
| `--hairline` | `#1e293b` | 1px borders everywhere |
| `--snake-head-color` | `#38bdf8` | sky-blue head |
| `--snake-body-color` / `--green` | `#22c55e` | body, running states, CTA |
| `--red` | `#ef4444` | food, game-over |
| `--label-color` | `#94a3b8` | 11px uppercase letter-spaced labels |
| `--hint-color` | `#7d8ba1` | wrap-around hint, sub-hints (≥4.5:1 on shell) |
| `--amber` | `#fbbf24` | paused chip |

Radii are 14–16px on cards, 12px on controls. Numerals are 34px tabular.
**Motion rule: `--step: steps(2, end)` at `--step-duration: 90ms` — no easing
curves anywhere.** Every state change (chip, overlay, score flip, best
highlight) steps like a mechanical hinge, matching the material language of the
concept roll.

## First viewport (desktop ≥ 720px)

Two-zone composition, no centered card:

- **Left stat rail (240px)** — `h1` brand (`JS` sky-blue + `-Snake` green,
  uppercase), then four hairline cards: **Score**, **Best** (gains a green
  border + green numeral when a round sets a new best), **Length**, and a
  **Controls** legend with `kbd` chips (arrows steer, Space pause, R restart).
- **Right play column** — toolbar (Play ⭤ Pause/Resume, Restart, status chip
  pushed right), then the board canvas filling the column, then the wrap-around
  hint line.

The status chip is the single always-visible truth-teller: `Idle` (hairline) →
`Running` (green) → `Paused` (amber) → `Game Over` (red). It steps between
states; it never fades.

## States and overlays

| State | Evidence | Trigger |
| --- | --- | --- |
| Idle | start overlay "Ready to slither?" + CTA | page load, restart |
| Running | chip green, chip flicker each tick | Play, first arrow/WASD/swipe |
| Paused | amber chip, dimmed board, "Press Space to resume" | Space / Pause button |
| Dying | body segments gray out head→tail | self collision |
| Game over | red chip, overlay "Score X · Best Y · Press R" | death sequence end |
| New best | Best card glows green border, numeral turns green | round ends with record |

The game never runs before the first input — `Game` boots into a real idle
state, and `update()` keeps the clock primed but refuses to step until
`start()` (first direction, Play, or pause-toggle on idle).

## Responsive (≤ 720px)

Rail becomes a horizontal stat strip (Score / Best / Length side by side,
controls legend hidden). Toolbar and board full-width. Touch: swipes anywhere
on the canvas steer (`TouchController`, 24px threshold), `touch-action: none`
keeps the gesture ours.

## Provenance of shipped rasters

Browser screenshots captured during the finish verify (desktop idle → running →
paused; 390px mobile paused) were taken against `http://localhost:3456` serving
this exact tree; the mechanical detector
(`impeccable detect --json index.html`) was run after them and came back clean
(low-contrast hint text raised to `#7d8ba1`, both green box-shadow glows
replaced with border-only emphasis).

## Verdict against the direction contract

- **Thesis** — met. Rail/column composition ships as locked; the board is the
  energy owner and the rail stays calm and tabular.
- **Signature move** — met. `steps(2)` 90ms is the only motion in the file.
- **World** — met. Palette is the incumbent custom-property set; one token
  (`--hint-color`) was lightened for AA contrast.
- **Required additions** — all four ship: idle-first start screen, `localStorage`
  best (`js-snake-best`), swipe touch controls, mobile strip layout.
- **States** — all six real and reachable (verified in browser).
- Zero build preserved; Renderer still consumes snapshots; logic gains are
  confined to state/idle/best bookskeeping in `game.js` + `main.js`.
