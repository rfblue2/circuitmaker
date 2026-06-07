import { GATE_TYPES } from './gates.js';
import { SEG_MAP } from './segMap.js';

const MATRIX_3X5_FONT = [
  ['111', '101', '101', '101', '111'], // 0
  ['010', '110', '010', '010', '111'], // 1
  ['111', '001', '111', '100', '111'], // 2
  ['111', '001', '111', '001', '111'], // 3
  ['101', '101', '111', '001', '001'], // 4
  ['111', '100', '111', '001', '111'], // 5
  ['111', '100', '111', '101', '111'], // 6
  ['111', '001', '010', '010', '010'], // 7
  ['111', '101', '111', '101', '111'], // 8
  ['111', '101', '111', '001', '111'], // 9
  ['111', '101', '111', '101', '101'], // A
  ['110', '101', '110', '101', '110'], // B
  ['111', '100', '100', '100', '111'], // C
  ['110', '101', '101', '101', '110'], // D
  ['111', '100', '111', '100', '111'], // E
  ['111', '100', '111', '100', '100'], // F
];

// Returns { signalValues: Map<gateId, boolean[]>, nextComponentState: Map }
// componentState stores per-FF state: { q: boolean, prevClk: boolean }
// prevSignalValues: last frame's outputs, used as fallback for combinational feedback cycles
//   so that SR latches built from NAND/NOR gates hold state correctly.
export function simulate(gates, wires, inputValues, componentState = new Map(), prevSignalValues = new Map()) {
  const signalValues = new Map();       // Map<gateId, boolean[]>
  const nextComponentState = new Map(componentState);

  // `${toGate}:${toPin}` → { fromGate, fromPin }
  const incoming = new Map();
  for (const wire of wires) {
    incoming.set(`${wire.toGate}:${wire.toPin}`, {
      fromGate: wire.fromGate,
      fromPin: wire.fromPin ?? 0,
    });
  }

  const gateMap = new Map(gates.map(g => [g.id, g]));

  function getInput(gateId, pin, visiting) {
    const src = incoming.get(`${gateId}:${pin}`);
    if (!src) return false;
    const outs = evalGate(src.fromGate, visiting);
    return outs[src.fromPin] ?? false;
  }

  function getInputs(gateId, n, visiting) {
    return Array.from({ length: n }, (_, i) => getInput(gateId, i, visiting));
  }

  function evalGate(id, visiting = new Set()) {
    if (signalValues.has(id)) return signalValues.get(id);
    if (visiting.has(id)) return prevSignalValues.get(id) ?? [false]; // cycle → use previous frame (holds latch state)
    visiting.add(id);

    const gate = gateMap.get(id);
    if (!gate) return [false];

    let out; // boolean[]

    switch (gate.type) {
      case 'INPUT':  out = [true];  break;
      case 'GROUND': out = [false]; break;

      case 'CLOCK':
        out = [inputValues.get(id) ?? false];
        break;

      case 'SWITCH': {
        const closed  = inputValues.get(id) ?? false;
        out = [closed ? getInput(id, 0, visiting) : false];
        break;
      }

      case 'BUTTON': {
        const pressed = inputValues.get(id) ?? false;
        out = [pressed ? getInput(id, 0, visiting) : false];
        break;
      }

      case 'HALFADDER': {
        const [a, b] = getInputs(id, 2, visiting);
        out = [a !== b, a && b]; // [Sum, Carry]
        break;
      }

      case 'FULLADDER': {
        const [a, b, cin] = getInputs(id, 3, visiting);
        out = [(a !== b) !== cin, (a && b) || (b && cin) || (a && cin)]; // [Sum, Cout]
        break;
      }

      case 'DEC24': {
        const [a0, a1] = getInputs(id, 2, visiting);
        const sel = (a1 ? 2 : 0) + (a0 ? 1 : 0);
        out = [0, 1, 2, 3].map(i => i === sel);
        break;
      }

      case 'DEC7SEG': {
        const [b3,b2,b1,b0] = getInputs(id, 4, visiting);
        const digit = (b3?8:0)+(b2?4:0)+(b1?2:0)+(b0?1:0);
        out = SEG_MAP[digit & 0xf].map(Boolean);  // [a,b,c,d,e,f,g]
        break;
      }

      case 'MATRIX3X5': {
        const [b3,b2,b1,b0,c0,c1,c2] = getInputs(id, 7, visiting);
        const digit = (b3?8:0)+(b2?4:0)+(b1?2:0)+(b0?1:0);
        const col = c0 ? 0 : c1 ? 1 : c2 ? 2 : -1;
        const glyph = MATRIX_3X5_FONT[digit & 0xf];
        out = glyph.map(row => col >= 0 && row[col] === '1'); // [R0-R4]
        break;
      }

      case 'SEG7': {
        out = getInputs(id, 7, visiting);  // [a,b,c,d,e,f,g] pass-through for rendering
        break;
      }

      case 'LEDMATRIX': {
        const inputs = getInputs(id, 8, visiting); // [C0,C1,C2, R0-R4]
        const cols = inputs.slice(0, 3);
        const rows = inputs.slice(3);
        out = Array.from({length: 15}, (_, i) => rows[Math.floor(i / 3)] && cols[i % 3]);
        break;
      }

      case 'HEXPAD': {
        const digit = typeof inputValues.get(id) === 'number' ? inputValues.get(id) : 0;
        out = [!!(digit & 8), !!(digit & 4), !!(digit & 2), !!(digit & 1)];
        break;
      }

      case 'DFF': {
        const ff = componentState.get(id) ?? { q: false, prevClk: false };
        const [d, clk] = getInputs(id, 2, visiting);
        const q = (clk && !ff.prevClk) ? d : ff.q; // rising-edge capture
        nextComponentState.set(id, { q, prevClk: clk });
        out = [q, !q];
        break;
      }

      case 'SRFF': {
        const ff = componentState.get(id) ?? { q: false, prevClk: false };
        const [s, r, clk] = getInputs(id, 3, visiting);
        let q = ff.q;
        if (clk && !ff.prevClk) {
          if (s && !r) q = true;
          else if (!s && r) q = false;
          // S=R=1: keep (invalid — leave unchanged)
        }
        nextComponentState.set(id, { q, prevClk: clk });
        out = [q, !q];
        break;
      }

      case 'JKFF': {
        const ff = componentState.get(id) ?? { q: false, prevClk: false };
        const [j, k, clk] = getInputs(id, 3, visiting);
        let q = ff.q;
        if (clk && !ff.prevClk) {
          if (j && k) q = !q;
          else if (j) q = true;
          else if (k) q = false;
        }
        nextComponentState.set(id, { q, prevClk: clk });
        out = [q, !q];
        break;
      }

      default: {
        const def = GATE_TYPES[gate.type];
        if (!def?.fn) { out = []; break; }
        out = [def.fn(getInputs(id, def.inputs, visiting))];
        break;
      }
    }

    signalValues.set(id, out);
    return out;
  }

  for (const gate of gates) evalGate(gate.id);

  return { signalValues, nextComponentState };
}
