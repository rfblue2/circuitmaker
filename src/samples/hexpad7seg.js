// Hex numpad → BCD decoder → raw 7-segment display.
// The decoder converts 4 BCD bits to 7 segment control lines (a–g).
// Each wire carries one segment signal independently.
export default {
  name: 'Hex Pad → 7-Seg',
  schematic: {
    gates: [
      { id: 'hp',  type: 'HEXPAD',  x: 80,  y: 80 },
      { id: 'dec', type: 'DEC7SEG', x: 280, y: 80 },
      { id: 'seg', type: 'SEG7',    x: 480, y: 78 },
    ],
    wires: [
      // BCD bits: HEXPAD pin0=B3 … pin3=B0
      { id: 'w0', fromGate: 'hp',  fromPin: 0, toGate: 'dec', toPin: 0 },
      { id: 'w1', fromGate: 'hp',  fromPin: 1, toGate: 'dec', toPin: 1 },
      { id: 'w2', fromGate: 'hp',  fromPin: 2, toGate: 'dec', toPin: 2 },
      { id: 'w3', fromGate: 'hp',  fromPin: 3, toGate: 'dec', toPin: 3 },
      // 7 segment lines: decoder pin0=a … pin6=g
      { id: 'wa', fromGate: 'dec', fromPin: 0, toGate: 'seg', toPin: 0 },
      { id: 'wb', fromGate: 'dec', fromPin: 1, toGate: 'seg', toPin: 1 },
      { id: 'wc', fromGate: 'dec', fromPin: 2, toGate: 'seg', toPin: 2 },
      { id: 'wd', fromGate: 'dec', fromPin: 3, toGate: 'seg', toPin: 3 },
      { id: 'we', fromGate: 'dec', fromPin: 4, toGate: 'seg', toPin: 4 },
      { id: 'wf', fromGate: 'dec', fromPin: 5, toGate: 'seg', toPin: 5 },
      { id: 'wg', fromGate: 'dec', fromPin: 6, toGate: 'seg', toPin: 6 },
    ],
    inputValues: { hp: 0 },
  },
};
