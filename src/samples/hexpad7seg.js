// Hex numpad wired directly to a 7-segment display.
// Click any hex digit on the pad to see it on the display.
export default {
  name: 'Hex Pad → 7-Seg',
  schematic: {
    gates: [
      { id: 'hp', type: 'HEXPAD',   x: 80,  y: 100 },
      { id: 'ss', type: 'SEVENSEG', x: 280, y: 100 },
    ],
    wires: [
      { id: 'w1', fromGate: 'hp', fromPin: 0, toGate: 'ss', toPin: 0 },
      { id: 'w2', fromGate: 'hp', fromPin: 1, toGate: 'ss', toPin: 1 },
      { id: 'w3', fromGate: 'hp', fromPin: 2, toGate: 'ss', toPin: 2 },
      { id: 'w4', fromGate: 'hp', fromPin: 3, toGate: 'ss', toPin: 3 },
    ],
    inputValues: { hp: 0 },
  },
};
