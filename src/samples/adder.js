// 1-bit full adder built from basic gates.
// Sum  = A XOR B XOR Cin
// Cout = (A AND B) OR (Cin AND (A XOR B))
export default {
  name: '1-Bit Full Adder',
  schematic: {
    gates: [
      // Inputs
      { id: 'vA',   type: 'INPUT',  x: 40,  y: 80  },
      { id: 'swA',  type: 'SWITCH', x: 160, y: 80  },
      { id: 'vB',   type: 'INPUT',  x: 40,  y: 200 },
      { id: 'swB',  type: 'SWITCH', x: 160, y: 200 },
      { id: 'vCin', type: 'INPUT',  x: 40,  y: 320 },
      { id: 'swCin',type: 'SWITCH', x: 160, y: 320 },

      // Stage 1: A XOR B,  A AND B
      { id: 'xor1', type: 'XOR',    x: 320, y: 80  },
      { id: 'and1', type: 'AND',    x: 320, y: 220 },

      // Stage 2: (A XOR B) XOR Cin = Sum,   (A XOR B) AND Cin
      { id: 'xor2', type: 'XOR',    x: 520, y: 180 },
      { id: 'and2', type: 'AND',    x: 520, y: 300 },

      // Carry: (A AND B) OR ((A XOR B) AND Cin)
      { id: 'or1',  type: 'OR',     x: 700, y: 260 },

      // Outputs
      { id: 'ledS', type: 'OUTPUT', x: 700, y: 180 },
      { id: 'ledC', type: 'OUTPUT', x: 880, y: 260 },
    ],
    wires: [
      // Voltage → switches
      { id: 'wvA',  fromGate: 'vA',   fromPin: 0, toGate: 'swA',  toPin: 0 },
      { id: 'wvB',  fromGate: 'vB',   fromPin: 0, toGate: 'swB',  toPin: 0 },
      { id: 'wvC',  fromGate: 'vCin', fromPin: 0, toGate: 'swCin',toPin: 0 },

      // A and B into XOR1 and AND1
      { id: 'wA0',  fromGate: 'swA',  fromPin: 0, toGate: 'xor1', toPin: 0 },
      { id: 'wA1',  fromGate: 'swA',  fromPin: 0, toGate: 'and1', toPin: 0 },
      { id: 'wB0',  fromGate: 'swB',  fromPin: 0, toGate: 'xor1', toPin: 1 },
      { id: 'wB1',  fromGate: 'swB',  fromPin: 0, toGate: 'and1', toPin: 1 },

      // XOR1 result (A⊕B) into XOR2 and AND2
      { id: 'wX0',  fromGate: 'xor1', fromPin: 0, toGate: 'xor2', toPin: 0 },
      { id: 'wX1',  fromGate: 'xor1', fromPin: 0, toGate: 'and2', toPin: 0 },

      // Cin into XOR2 and AND2
      { id: 'wCin0',fromGate: 'swCin',fromPin: 0, toGate: 'xor2', toPin: 1 },
      { id: 'wCin1',fromGate: 'swCin',fromPin: 0, toGate: 'and2', toPin: 1 },

      // Carry generation
      { id: 'wG0',  fromGate: 'and1', fromPin: 0, toGate: 'or1',  toPin: 0 },
      { id: 'wG1',  fromGate: 'and2', fromPin: 0, toGate: 'or1',  toPin: 1 },

      // Outputs
      { id: 'wSum', fromGate: 'xor2', fromPin: 0, toGate: 'ledS', toPin: 0 },
      { id: 'wCout',fromGate: 'or1',  fromPin: 0, toGate: 'ledC', toPin: 0 },
    ],
    inputValues: {},
  },
};
