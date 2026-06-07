// 2-bit ripple-carry adder.
// A1:A0 + B1:B0 → Sum1:Sum0 + Carry
// Toggle any switch to change an input bit.
export default {
  name: '2-bit Adder',
  schematic: {
    gates: [
      // Bit 0 inputs
      { id: 'vA0', type: 'INPUT',     x: 40,  y: 60  },
      { id: 'sA0', type: 'SWITCH',    x: 180, y: 60  },
      { id: 'vB0', type: 'INPUT',     x: 40,  y: 160 },
      { id: 'sB0', type: 'SWITCH',    x: 180, y: 160 },
      // Half adder for bit 0
      { id: 'ha',  type: 'HALFADDER', x: 360, y: 80  },
      // Bit 1 inputs
      { id: 'vA1', type: 'INPUT',     x: 40,  y: 300 },
      { id: 'sA1', type: 'SWITCH',    x: 180, y: 300 },
      { id: 'vB1', type: 'INPUT',     x: 40,  y: 400 },
      { id: 'sB1', type: 'SWITCH',    x: 180, y: 400 },
      // Full adder for bit 1 (carry in from half adder)
      { id: 'fa',  type: 'FULLADDER', x: 360, y: 320 },
      // Output LEDs: Sum0, Sum1, Carry
      { id: 'led0', type: 'OUTPUT', x: 580, y: 60  },
      { id: 'gnd0', type: 'GROUND', x: 500, y: 160 },
      { id: 'led1', type: 'OUTPUT', x: 580, y: 300 },
      { id: 'gnd1', type: 'GROUND', x: 500, y: 400 },
      { id: 'ledC', type: 'OUTPUT', x: 580, y: 400 },
      { id: 'gndC', type: 'GROUND', x: 500, y: 500 },
    ],
    wires: [
      // Voltages → switches
      { id: 'w1', fromGate: 'vA0', fromPin: 0, toGate: 'sA0', toPin: 0 },
      { id: 'w2', fromGate: 'vB0', fromPin: 0, toGate: 'sB0', toPin: 0 },
      { id: 'w3', fromGate: 'vA1', fromPin: 0, toGate: 'sA1', toPin: 0 },
      { id: 'w4', fromGate: 'vB1', fromPin: 0, toGate: 'sB1', toPin: 0 },
      // Switches → half adder
      { id: 'w5', fromGate: 'sA0', fromPin: 0, toGate: 'ha', toPin: 0 },
      { id: 'w6', fromGate: 'sB0', fromPin: 0, toGate: 'ha', toPin: 1 },
      // Switches → full adder
      { id: 'w7', fromGate: 'sA1', fromPin: 0, toGate: 'fa', toPin: 0 },
      { id: 'w8', fromGate: 'sB1', fromPin: 0, toGate: 'fa', toPin: 1 },
      // Half adder carry → full adder carry-in
      { id: 'w9', fromGate: 'ha', fromPin: 1, toGate: 'fa', toPin: 2 },
      // Outputs
      { id: 'w10', fromGate: 'ha',   fromPin: 0, toGate: 'led0', toPin: 0 },
      { id: 'w11', fromGate: 'gnd0', fromPin: 0, toGate: 'led0', toPin: 1 },
      { id: 'w12', fromGate: 'fa',   fromPin: 0, toGate: 'led1', toPin: 0 },
      { id: 'w13', fromGate: 'gnd1', fromPin: 0, toGate: 'led1', toPin: 1 },
      { id: 'w14', fromGate: 'fa',   fromPin: 1, toGate: 'ledC', toPin: 0 },
      { id: 'w15', fromGate: 'gndC', fromPin: 0, toGate: 'ledC', toPin: 1 },
    ],
    inputValues: {},
  },
};
