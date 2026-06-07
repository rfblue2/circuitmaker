// D flip-flop driven by a clock, with a switch controlling D.
// Q and Q̄ drive two LEDs with grounds on the cathodes.
export default {
  name: 'D Flip-Flop',
  schematic: {
    gates: [
      { id: 'v1',    type: 'INPUT',  x: 40,  y: 100 },
      { id: 'sw1',   type: 'SWITCH', x: 180, y: 100 },
      { id: 'clk1',  type: 'CLOCK',  x: 40,  y: 220 },
      { id: 'dff1',  type: 'DFF',    x: 380, y: 120 },
      { id: 'ledQ',  type: 'OUTPUT', x: 540, y: 100 },
      { id: 'gndQ',  type: 'GROUND', x: 460, y: 200 },
      { id: 'ledQb', type: 'OUTPUT', x: 540, y: 220 },
      { id: 'gndQb', type: 'GROUND', x: 460, y: 320 },
    ],
    wires: [
      { id: 'w1', fromGate: 'v1',    fromPin: 0, toGate: 'sw1',   toPin: 0 },
      { id: 'w2', fromGate: 'sw1',   fromPin: 0, toGate: 'dff1',  toPin: 0 },
      { id: 'w3', fromGate: 'clk1',  fromPin: 0, toGate: 'dff1',  toPin: 1 },
      { id: 'w4', fromGate: 'dff1',  fromPin: 0, toGate: 'ledQ',  toPin: 0 },
      { id: 'w5', fromGate: 'gndQ',  fromPin: 0, toGate: 'ledQ',  toPin: 1 },
      { id: 'w6', fromGate: 'dff1',  fromPin: 1, toGate: 'ledQb', toPin: 0 },
      { id: 'w7', fromGate: 'gndQb', fromPin: 0, toGate: 'ledQb', toPin: 1 },
    ],
    inputValues: {},
  },
};
