export const BUBBLE_R = 5;

// outputPins is always an array (multi-output support).
// inputPins / outputPins give pin center positions in local gate space.
// leadX: draw horizontal lead lines from x=0 to leadX for OR-family gates.
// bubble: {cx,cy} NOT circle at the output.
// extraPath: extra stroke path (XOR double-curve).
// Custom-rendered types have no bodyPath; GateBody handles them by type name.

export const SHAPES = {
  // ── Standard logic ────────────────────────────────────
  AND: {
    W: 55, H: 50,
    bodyPath: 'M 0,0 L 30,0 A 25,25 0 0 1 30,50 L 0,50 Z',
    inputPins: [{x:0,y:15},{x:0,y:35}],
    outputPins: [{x:60,y:25}],
  },
  NAND: {
    W: 55, H: 50,
    bodyPath: 'M 0,0 L 30,0 A 25,25 0 0 1 30,50 L 0,50 Z',
    inputPins: [{x:0,y:15},{x:0,y:35}],
    outputPins: [{x:67,y:25}],
    bubble: {cx:61,cy:25},
  },
  OR: {
    W: 65, H: 50,
    bodyPath: 'M 10,0 Q 2,25 10,50 Q 35,50 65,25 Q 35,0 10,0 Z',
    inputPins: [{x:0,y:15},{x:0,y:35}],
    outputPins: [{x:65,y:25}],
    leadX: 10,
  },
  NOR: {
    W: 65, H: 50,
    bodyPath: 'M 10,0 Q 2,25 10,50 Q 35,50 60,25 Q 35,0 10,0 Z',
    inputPins: [{x:0,y:15},{x:0,y:35}],
    outputPins: [{x:72,y:25}],
    leadX: 10,
    bubble: {cx:66,cy:25},
  },
  XOR: {
    W: 68, H: 50,
    bodyPath: 'M 16,0 Q 8,25 16,50 Q 41,50 68,25 Q 41,0 16,0 Z',
    extraPath: 'M 10,0 Q 2,25 10,50',
    inputPins: [{x:0,y:15},{x:0,y:35}],
    outputPins: [{x:68,y:25}],
    leadX: 16,
  },
  XNOR: {
    W: 68, H: 50,
    bodyPath: 'M 16,0 Q 8,25 16,50 Q 41,50 63,25 Q 41,0 16,0 Z',
    extraPath: 'M 10,0 Q 2,25 10,50',
    inputPins: [{x:0,y:15},{x:0,y:35}],
    outputPins: [{x:74,y:25}],
    leadX: 16,
    bubble: {cx:69,cy:25},
  },
  NOT: {
    W: 50, H: 50,
    bodyPath: 'M 0,0 L 0,50 L 50,25 Z',
    inputPins: [{x:0,y:25}],
    outputPins: [{x:61,y:25}],
    bubble: {cx:55,cy:25},
  },

  // ── Special / custom-rendered (no bodyPath) ───────────
  INPUT:   { W:56,  H:50,  inputPins:[],              outputPins:[{x:56,y:25}] },
  SWITCH:  { W:60,  H:50,  inputPins:[{x:0,y:25}],   outputPins:[{x:60,y:25}] },
  BUTTON:  { W:60,  H:50,  inputPins:[{x:0,y:25}],   outputPins:[{x:60,y:25}] },
  CLOCK:   { W:62,  H:50,  inputPins:[],              outputPins:[{x:62,y:25}] },
  OUTPUT:  { W:65,  H:50,  inputPins:[{x:0,y:15},{x:0,y:35}], outputPins:[] },
  GROUND:  { W:50,  H:36,  inputPins:[],              outputPins:[{x:25,y:0}] },
  MUX:     { W:55,  H:60,  inputPins:[{x:0,y:15},{x:0,y:30},{x:0,y:45}], outputPins:[{x:60,y:30}] },
  SEVENSEG:{ W:65,  H:90,  inputPins:[{x:0,y:16},{x:0,y:32},{x:0,y:48},{x:0,y:64}], outputPins:[] },

  // ── Multi-output combinational ────────────────────────
  HALFADDER:{ W:55, H:50,
    inputPins:[{x:0,y:15},{x:0,y:35}],
    outputPins:[{x:60,y:15},{x:60,y:35}],  // [Sum, Carry]
  },
  FULLADDER:{ W:55, H:60,
    inputPins:[{x:0,y:15},{x:0,y:30},{x:0,y:45}],
    outputPins:[{x:60,y:20},{x:60,y:40}],  // [Sum, Cout]
  },
  DEC24:   { W:55,  H:80,
    inputPins:[{x:0,y:25},{x:0,y:55}],     // A0(LSB), A1(MSB)
    outputPins:[{x:60,y:10},{x:60,y:27},{x:60,y:53},{x:60,y:70}], // Y0–Y3
  },

  // ── Flip-flops ────────────────────────────────────────
  DFF:  { W:55, H:60,
    inputPins:[{x:0,y:20},{x:0,y:44}],     // D, Clk
    outputPins:[{x:60,y:20},{x:60,y:44}],  // Q, Q̄
  },
  SRFF: { W:55, H:70,
    inputPins:[{x:0,y:15},{x:0,y:35},{x:0,y:58}],  // S, R, Clk
    outputPins:[{x:60,y:22},{x:60,y:50}],           // Q, Q̄
  },
  JKFF: { W:55, H:70,
    inputPins:[{x:0,y:15},{x:0,y:35},{x:0,y:58}],  // J, K, Clk
    outputPins:[{x:60,y:22},{x:60,y:50}],           // Q, Q̄
  },

  // ── Hex numpad ────────────────────────────────────────
  HEXPAD: { W:90, H:90,
    inputPins:[],
    outputPins:[{x:90,y:18},{x:90,y:36},{x:90,y:54},{x:90,y:72}], // B3,B2,B1,B0
  },
};
