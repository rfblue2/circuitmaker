// 4-bit ripple counter using JK flip-flops.
// Each FF is wired as a T flip-flop (J=K=1) so it toggles on every rising clock edge.
// Each stage's clock is the Q output of the previous stage (ripple).
// LEDs show Q3 Q2 Q1 Q0 (MSB left). Count cycles 0–15 at 1 Hz.
export default {
  name: '4-Bit Counter',
  schematic: {
    gates: [
      // Clock and J=K=1 supply
      { id: 'clk',  type: 'CLOCK', x: 40,  y: 220 },
      { id: 'vcc',  type: 'INPUT', x: 40,  y: 100 },

      // JK flip-flops (J=K=1 → T flip-flop, toggles on rising clock edge)
      { id: 'ff0',  type: 'JKFF',  x: 200, y: 140 },
      { id: 'ff1',  type: 'JKFF',  x: 380, y: 140 },
      { id: 'ff2',  type: 'JKFF',  x: 560, y: 140 },
      { id: 'ff3',  type: 'JKFF',  x: 740, y: 140 },

      // Output LEDs (Q3 MSB … Q0 LSB)
      { id: 'l3',   type: 'OUTPUT', x: 900, y: 80  },
      { id: 'l2',   type: 'OUTPUT', x: 900, y: 180 },
      { id: 'l1',   type: 'OUTPUT', x: 900, y: 280 },
      { id: 'l0',   type: 'OUTPUT', x: 900, y: 380 },
    ],
    wires: [
      // VCC → J and K of all four FFs (J=K=1 makes each a toggle FF)
      { id: 'j0',  fromGate: 'vcc', fromPin: 0, toGate: 'ff0', toPin: 0 },
      { id: 'k0',  fromGate: 'vcc', fromPin: 0, toGate: 'ff0', toPin: 1 },
      { id: 'j1',  fromGate: 'vcc', fromPin: 0, toGate: 'ff1', toPin: 0 },
      { id: 'k1',  fromGate: 'vcc', fromPin: 0, toGate: 'ff1', toPin: 1 },
      { id: 'j2',  fromGate: 'vcc', fromPin: 0, toGate: 'ff2', toPin: 0 },
      { id: 'k2',  fromGate: 'vcc', fromPin: 0, toGate: 'ff2', toPin: 1 },
      { id: 'j3',  fromGate: 'vcc', fromPin: 0, toGate: 'ff3', toPin: 0 },
      { id: 'k3',  fromGate: 'vcc', fromPin: 0, toGate: 'ff3', toPin: 1 },

      // Ripple clock chain: external clock → FF0, then each Q feeds next clock
      { id: 'c0',  fromGate: 'clk', fromPin: 0, toGate: 'ff0', toPin: 2 },
      { id: 'c1',  fromGate: 'ff0', fromPin: 0, toGate: 'ff1', toPin: 2 },
      { id: 'c2',  fromGate: 'ff1', fromPin: 0, toGate: 'ff2', toPin: 2 },
      { id: 'c3',  fromGate: 'ff2', fromPin: 0, toGate: 'ff3', toPin: 2 },

      // Q outputs → LEDs
      { id: 'q3',  fromGate: 'ff3', fromPin: 0, toGate: 'l3',  toPin: 0 },
      { id: 'q2',  fromGate: 'ff2', fromPin: 0, toGate: 'l2',  toPin: 0 },
      { id: 'q1',  fromGate: 'ff1', fromPin: 0, toGate: 'l1',  toPin: 0 },
      { id: 'q0',  fromGate: 'ff0', fromPin: 0, toGate: 'l0',  toPin: 0 },
    ],
    inputValues: {},
  },
};
