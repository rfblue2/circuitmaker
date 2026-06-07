// D latch built from NAND gates, driven by a clock enable and a switch.
// Four NAND gates form a gated SR latch; a NOT gate inverts D to produce S̄.
// Q and Q̄ drive two LEDs directly (no cathode ground needed).
export default {
  name: 'D Latch (NAND gates)',
  schematic: {
    gates: [
      // Inputs
      { id: 'v1',   type: 'INPUT',  x: 40,  y: 80  },
      { id: 'sw1',  type: 'SWITCH', x: 180, y: 80  },  // D
      { id: 'clk',  type: 'CLOCK',  x: 40,  y: 200 },  // Enable

      // NOT D  →  D̄
      { id: 'notD', type: 'NOT',    x: 340, y: 68  },

      // NAND latch front end: S̄ = NAND(D, EN),  R̄ = NAND(D̄, EN)
      { id: 'n1',   type: 'NAND',   x: 460, y: 60  },  // S̄
      { id: 'n2',   type: 'NAND',   x: 460, y: 160 },  // R̄

      // SR NAND latch back end:  Q = NAND(S̄, Q̄),  Q̄ = NAND(R̄, Q)
      { id: 'n3',   type: 'NAND',   x: 600, y: 60  },  // Q
      { id: 'n4',   type: 'NAND',   x: 600, y: 160 },  // Q̄

      // Output LEDs
      { id: 'ledQ',  type: 'OUTPUT', x: 760, y: 60  },
      { id: 'ledQb', type: 'OUTPUT', x: 760, y: 160 },
    ],
    wires: [
      // Voltage → D switch
      { id: 'w1', fromGate: 'v1',  fromPin: 0, toGate: 'sw1',  toPin: 0 },

      // D → NOT and NAND1
      { id: 'w3', fromGate: 'sw1', fromPin: 0, toGate: 'notD', toPin: 0 },
      { id: 'w4', fromGate: 'sw1', fromPin: 0, toGate: 'n1',   toPin: 0 },

      // D̄ → NAND2
      { id: 'w5', fromGate: 'notD', fromPin: 0, toGate: 'n2',  toPin: 0 },

      // Clock → both front-end NANDs
      { id: 'w6', fromGate: 'clk', fromPin: 0, toGate: 'n1',  toPin: 1 },
      { id: 'w7', fromGate: 'clk', fromPin: 0, toGate: 'n2',  toPin: 1 },

      // S̄ → Q latch input
      { id: 'w8', fromGate: 'n1',  fromPin: 0, toGate: 'n3',  toPin: 0 },
      // R̄ → Q̄ latch input
      { id: 'w9', fromGate: 'n2',  fromPin: 0, toGate: 'n4',  toPin: 0 },

      // Cross-coupling: Q → n4 input 1,  Q̄ → n3 input 1
      { id: 'w10', fromGate: 'n3', fromPin: 0, toGate: 'n4',  toPin: 1 },
      { id: 'w11', fromGate: 'n4', fromPin: 0, toGate: 'n3',  toPin: 1 },

      // Outputs to LEDs
      { id: 'w12', fromGate: 'n3', fromPin: 0, toGate: 'ledQ',  toPin: 0 },
      { id: 'w13', fromGate: 'n4', fromPin: 0, toGate: 'ledQb', toPin: 0 },
    ],
    inputValues: {},
  },
};
