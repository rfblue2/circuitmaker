import { GATE_TYPES } from './gates.js';

// Returns { signalValues: Map<gateId, boolean[]>, nextComponentState: Map }
// componentState stores per-FF state: { q: boolean, prevClk: boolean }
export function simulate(gates, wires, inputValues, componentState = new Map()) {
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
    if (visiting.has(id)) return [false]; // cycle → LOW
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
