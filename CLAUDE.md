# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A browser-only digital logic circuit builder. Users drag components onto a zoomable/pannable SVG canvas, connect them with wires, and watch signals propagate in real time. Schematics save/load as JSON. No backend — deploys statically to GitHub Pages.

## Commands

```bash
npm run dev      # dev server at http://localhost:5173/circuitmaker/
npm run build    # production build to dist/
npm run preview  # preview production build locally
npm run lint     # ESLint
```

## Architecture

**Data flow:** `useCircuit` (reducer) → `simulate()` → component props → SVG render

### State (`src/store/useCircuit.js`)
Single `useReducer` holding `{ gates, wires, inputValues, componentState, pendingWire, clipboard }`.

- `inputValues: Map<gateId, boolean|number>` — SWITCH/BUTTON/CLOCK toggle state; HEXPAD selected digit (0–15)
- `componentState: Map<gateId, {q,prevClk}>` — flip-flop state (Q output + previous clock level for edge detection)
- `signalValues: Map<gateId, boolean[]>` — derived each render by `simulate()`, never stored in state
- A `useEffect` (no deps) detects when `nextComponentState` from simulate differs from stored `componentState` and dispatches `UPDATE_COMPONENT_STATE`, enabling rising-edge FF triggering
- `pendingWire: { fromGate, fromPin }` — set while user is mid-draw
- `GRID = 20` — all gate positions snap to this grid (applied in ADD_GATE and MOVE_GATE)

### Logic (`src/logic/`)
- `gates.js` — gate type registry: label, input count, boolean fn (or null for gates handled directly in simulate)
- `simulate.js` — topological recursive evaluation, signature `simulate(gates, wires, inputValues, componentState)`. Returns `{ signalValues: Map<gateId, boolean[]>, nextComponentState }`.
  - Single-output gates return `[boolean]`; multi-output return `[boolean, boolean, ...]`
  - `SEVENSEG` returns `[number]` where the number is 0–15 (handled specially in GateBody)
  - Flip-flops detect rising clock edges by comparing current clk to `componentState.get(id).prevClk`

### Rendering (`src/components/`)
- `Canvas.jsx` — SVG surface with zoom/pan viewport. Owns viewport state `{ x, y, scale }`, drag, wire-draw, and keyboard shortcuts. All world-space content lives inside a `<g transform="translate(x,y) scale(s)">`. Drop handler and HEXPAD digit-click are here.
- `GateSymbol.jsx` — renders one gate at its position. Receives `signalValues: boolean[]` (the gate's output array). Exports `getPinPositions(gate)` → `{ inputs, outputs }` (arrays) and `GateBody` (pin-free, interaction-free render for toolbar thumbnails).
- `gateShapes.js` — shape data: SVG body paths, pin positions (`outputPins` is always an array). Custom-rendered types have no `bodyPath`; `GateBody` handles them by type name.
- `WireLine.jsx` — cubic bezier between two absolute positions.
- `Toolbar.jsx` — draggable gate palette with live SVG thumbnails. Aspect-ratio-aware sizing handles tall/wide components.

### I/O (`src/io/schematic.js`)
`exportSchematic` downloads JSON. `importSchematic` reads a File and returns `{ gates, wires, inputValues }` ready to pass to the `LOAD` action.

## Gate model

### Wire model
`{ id, fromGate, fromPin, toGate, toPin }` — `fromPin` defaults to 0 for single-output gates. Input pins accept one wire each (replacing if occupied); output pins are fan-out.

### Special gate types (0-input, no fn)
| Type | Behavior |
|---|---|
| INPUT | constant HIGH (Voltage symbol) |
| SWITCH | click toggles HIGH/LOW |
| BUTTON | HIGH while mouse held, LOW on release |
| CLOCK | auto-oscillates at 1 Hz (App.jsx `setInterval` calls `tickClocks`) |
| GROUND | constant LOW |

### Display components (no output pin)
| Type | Inputs | Visual |
|---|---|---|
| OUTPUT | 2 (anode, cathode) | LED — lights when anode=1 AND cathode=0 |
| SEVENSEG | 4 (B3–B0, BCD) | 7-segment display with built-in BCD decoder |

## Canvas interaction
- **Drag from toolbar** → place gate at drop position (snapped to grid)
- **Click gate output pin** → begin wire; click input pin on another gate to finish
- **Click wire** → delete wire
- **Click SWITCH** → toggle HIGH/LOW
- **Hold BUTTON** → HIGH while held
- **Drag gate** → move (snaps to grid)
- **Select gate + Delete/Backspace** → delete gate and connected wires
- **Ctrl/Cmd+C** → copy selected gate; **Ctrl/Cmd+V** → paste with +2-grid offset
- **Scroll wheel** → zoom (centered on cursor)
- **Drag empty canvas** → pan
- **Escape** → cancel pending wire / deselect

## Adding a new gate type
1. Add entry to `GATE_TYPES` in `src/logic/gates.js` with `inputs` count and `fn`.
2. Add to `PLACEABLE_GATES` in the same file.
3. Add shape entry to `SHAPES` in `src/components/gateShapes.js`.
4. If custom rendering: add a named branch in `GateBody` in `GateSymbol.jsx`.
5. If the gate reads from `inputValues` (like SWITCH/BUTTON): add its type to `INPUT_DRIVEN` in `simulate.js`.

## GitHub Pages deploy
`vite.config.js` sets `base: '/circuitmaker/'`. Build with `npm run build` and deploy `dist/` to the `gh-pages` branch.
