// LED matrix column-scan demo.
//
// A binary counter (two JK flip-flops) counts 00→01→10→11→00…
// driven by a clock.  The two-bit count feeds a 2→4 decoder (DEC24)
// whose Y0/Y1/Y2 outputs enable columns C0/C1/C2 of the matrix one
// at a time.  Y3 ("11") is unused — the display blanks briefly each
// fourth tick.  A hex keypad selects the digit.  MATRIX3X5 combines
// the selected digit with the active scan column and drives the five
// row inputs for that digit's 3×5 glyph.
//
// Right-click the CLOCK to slow down or speed up the scan rate.
// At 1 Hz you can see each column illuminate in sequence.
// At 8+ Hz the columns blur together via persistence of vision.

export default {
  name: 'Hex Pad → LED Matrix',
  schematic: {
    gates: [
      // Power for JKFF J and K inputs (always HIGH → toggle mode)
      { id: 'vcc_jk',  type: 'INPUT',     x: 40,  y: 160 },
      // Clock drives both JK flip-flops
      { id: 'clk',     type: 'CLOCK',     x: 40,  y: 260 },
      // JKFF0: bit 0, toggles every clock edge (J=K=1)
      { id: 'jkff0',   type: 'JKFF',      x: 160, y: 160 },
      // JKFF1: bit 1, toggles when Q0=1 (J=K=Q0)
      { id: 'jkff1',   type: 'JKFF',      x: 160, y: 260 },
      // 2→4 decoder: maps 2-bit count to one-hot column select
      { id: 'dec',     type: 'DEC24',     x: 300, y: 200 },
      // Hex keypad selects the digit to render
      { id: 'hp',      type: 'HEXPAD',    x: 300, y: 20  },
      // Font decoder: B3-B0 + active column -> row pattern R0-R4
      { id: 'font',    type: 'MATRIX3X5', x: 440, y: 40  },
      // LED matrix
      { id: 'mx',      type: 'LEDMATRIX', x: 620, y: 120 },
    ],
    wires: [
      // VCC → JKFF0 J and K (toggle mode)
      { id: 'jk0j', fromGate: 'vcc_jk', fromPin: 0, toGate: 'jkff0', toPin: 0 },
      { id: 'jk0k', fromGate: 'vcc_jk', fromPin: 0, toGate: 'jkff0', toPin: 1 },
      // Clock → JKFF0 and JKFF1 Clk inputs
      { id: 'ck0',  fromGate: 'clk',    fromPin: 0, toGate: 'jkff0', toPin: 2 },
      { id: 'ck1',  fromGate: 'clk',    fromPin: 0, toGate: 'jkff1', toPin: 2 },
      // JKFF0.Q → JKFF1 J, K (JKFF1 toggles when Q0 is HIGH)
      { id: 'q0j1', fromGate: 'jkff0',  fromPin: 0, toGate: 'jkff1', toPin: 0 },
      { id: 'q0k1', fromGate: 'jkff0',  fromPin: 0, toGate: 'jkff1', toPin: 1 },
      // JKFF0.Q → DEC24 A0 (LSB)
      { id: 'q0a0', fromGate: 'jkff0',  fromPin: 0, toGate: 'dec',   toPin: 0 },
      // JKFF1.Q → DEC24 A1 (MSB)
      { id: 'q1a1', fromGate: 'jkff1',  fromPin: 0, toGate: 'dec',   toPin: 1 },
      // DEC24 Y0/Y1/Y2 → LEDMATRIX column pins C0/C1/C2 (pins 0-2)
      { id: 'dc0',  fromGate: 'dec',    fromPin: 0, toGate: 'mx',    toPin: 0 },
      { id: 'dc1',  fromGate: 'dec',    fromPin: 1, toGate: 'mx',    toPin: 1 },
      { id: 'dc2',  fromGate: 'dec',    fromPin: 2, toGate: 'mx',    toPin: 2 },
      // HEXPAD B3-B0 → MATRIX3X5 digit inputs
      { id: 'hb3',  fromGate: 'hp',     fromPin: 0, toGate: 'font',  toPin: 0 },
      { id: 'hb2',  fromGate: 'hp',     fromPin: 1, toGate: 'font',  toPin: 1 },
      { id: 'hb1',  fromGate: 'hp',     fromPin: 2, toGate: 'font',  toPin: 2 },
      { id: 'hb0',  fromGate: 'hp',     fromPin: 3, toGate: 'font',  toPin: 3 },
      // DEC24 Y0/Y1/Y2 → MATRIX3X5 active-column inputs
      { id: 'fc0',  fromGate: 'dec',    fromPin: 0, toGate: 'font',  toPin: 4 },
      { id: 'fc1',  fromGate: 'dec',    fromPin: 1, toGate: 'font',  toPin: 5 },
      { id: 'fc2',  fromGate: 'dec',    fromPin: 2, toGate: 'font',  toPin: 6 },
      // MATRIX3X5 rows R0-R4 → LEDMATRIX row pins R0-R4 (pins 3-7)
      { id: 'fr0',  fromGate: 'font',   fromPin: 0, toGate: 'mx',    toPin: 3 },
      { id: 'fr1',  fromGate: 'font',   fromPin: 1, toGate: 'mx',    toPin: 4 },
      { id: 'fr2',  fromGate: 'font',   fromPin: 2, toGate: 'mx',    toPin: 5 },
      { id: 'fr3',  fromGate: 'font',   fromPin: 3, toGate: 'mx',    toPin: 6 },
      { id: 'fr4',  fromGate: 'font',   fromPin: 4, toGate: 'mx',    toPin: 7 },
    ],
    inputValues: { hp: 0 },
  },
};
