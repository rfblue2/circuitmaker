// Hex calculator: A + B using two hex pads and a 4-bit ripple-carry adder.
// Click any digit on either pad to change the operand; the two 7-seg displays
// show the hex result (upper digit: carry 0 or 1, lower digit: sum nibble 0–F).
// Maximum: F + F = 1E (15 + 15 = 30).
export default {
  name: 'Hex Calculator (A + B)',
  schematic: {
    gates: [
      // Operand inputs (top = A, bottom = B)
      { id: 'hpA', type: 'HEXPAD',    x: 80,   y: 80  },
      { id: 'hpB', type: 'HEXPAD',    x: 80,   y: 320 },

      // 4-bit ripple-carry adder: 1 half-adder (bit 0) + 3 full-adders (bits 1–3)
      { id: 'ha',  type: 'HALFADDER', x: 340,  y: 200 },
      { id: 'fa1', type: 'FULLADDER', x: 500,  y: 200 },
      { id: 'fa2', type: 'FULLADDER', x: 660,  y: 200 },
      { id: 'fa3', type: 'FULLADDER', x: 820,  y: 200 },

      // Result: two 7-seg displays side by side (upper digit = carry, lower = nibble)
      { id: 'ssh', type: 'SEVENSEG',  x: 1020, y: 80  },
      { id: 'ssl', type: 'SEVENSEG',  x: 1020, y: 260 },

      // Grounds to hold B3=B2=B1=0 on the high-digit display (only B0=carry matters)
      { id: 'g0',  type: 'GROUND',    x: 900,  y: 60  },
      { id: 'g1',  type: 'GROUND',    x: 900,  y: 100 },
      { id: 'g2',  type: 'GROUND',    x: 900,  y: 140 },
    ],
    wires: [
      // A bits: hpA pin0=B3=A3, pin1=B2=A2, pin2=B1=A1, pin3=B0=A0
      { id: 'wA0', fromGate: 'hpA', fromPin: 3, toGate: 'ha',  toPin: 0 },
      { id: 'wA1', fromGate: 'hpA', fromPin: 2, toGate: 'fa1', toPin: 0 },
      { id: 'wA2', fromGate: 'hpA', fromPin: 1, toGate: 'fa2', toPin: 0 },
      { id: 'wA3', fromGate: 'hpA', fromPin: 0, toGate: 'fa3', toPin: 0 },

      // B bits: same pin mapping for hpB
      { id: 'wB0', fromGate: 'hpB', fromPin: 3, toGate: 'ha',  toPin: 1 },
      { id: 'wB1', fromGate: 'hpB', fromPin: 2, toGate: 'fa1', toPin: 1 },
      { id: 'wB2', fromGate: 'hpB', fromPin: 1, toGate: 'fa2', toPin: 1 },
      { id: 'wB3', fromGate: 'hpB', fromPin: 0, toGate: 'fa3', toPin: 1 },

      // Carry chain: ha.Carry → fa1.Cin → fa2.Cin → fa3.Cin
      { id: 'wC0', fromGate: 'ha',  fromPin: 1, toGate: 'fa1', toPin: 2 },
      { id: 'wC1', fromGate: 'fa1', fromPin: 1, toGate: 'fa2', toPin: 2 },
      { id: 'wC2', fromGate: 'fa2', fromPin: 1, toGate: 'fa3', toPin: 2 },

      // Sum bits → low display (ssl pin0=B3=S3 MSB … pin3=B0=S0 LSB)
      { id: 'wS0', fromGate: 'ha',  fromPin: 0, toGate: 'ssl', toPin: 3 },
      { id: 'wS1', fromGate: 'fa1', fromPin: 0, toGate: 'ssl', toPin: 2 },
      { id: 'wS2', fromGate: 'fa2', fromPin: 0, toGate: 'ssl', toPin: 1 },
      { id: 'wS3', fromGate: 'fa3', fromPin: 0, toGate: 'ssl', toPin: 0 },

      // Carry-out → high display B0 pin; B3/B2/B1 tied to ground (shows 0 or 1)
      { id: 'wCout', fromGate: 'fa3', fromPin: 1, toGate: 'ssh', toPin: 3 },
      { id: 'wG0',   fromGate: 'g0',  fromPin: 0, toGate: 'ssh', toPin: 0 },
      { id: 'wG1',   fromGate: 'g1',  fromPin: 0, toGate: 'ssh', toPin: 1 },
      { id: 'wG2',   fromGate: 'g2',  fromPin: 0, toGate: 'ssh', toPin: 2 },
    ],
    inputValues: { hpA: 0, hpB: 0 },
  },
};
