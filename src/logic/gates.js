export const GATE_TYPES = {
  INPUT:    { label: 'Voltage',   inputs: 0, fn: null },
  SWITCH:   { label: 'Switch',    inputs: 1, fn: null },
  BUTTON:   { label: 'Button',    inputs: 1, fn: null },  // passes input while held
  CLOCK:    { label: 'Clock',     inputs: 0, fn: null },
  OUTPUT:   { label: 'LED',       inputs: 1, fn: ([a]) => !!a },
  GROUND:   { label: 'Ground',    inputs: 0, fn: null },
  NOT:      { label: 'NOT',       inputs: 1, fn: ([a]) => !a },
  AND:      { label: 'AND',       inputs: 2, fn: ([a,b]) => a && b },
  OR:       { label: 'OR',        inputs: 2, fn: ([a,b]) => a || b },
  NAND:     { label: 'NAND',      inputs: 2, fn: ([a,b]) => !(a && b) },
  NOR:      { label: 'NOR',       inputs: 2, fn: ([a,b]) => !(a || b) },
  XOR:      { label: 'XOR',       inputs: 2, fn: ([a,b]) => a !== b },
  XNOR:     { label: 'XNOR',     inputs: 2, fn: ([a,b]) => a === b },
  MUX:      { label: 'MUX',       inputs: 3, fn: ([a,b,s]) => s ? b : a },
  SEVENSEG: { label: '7-Seg',     inputs: 4, fn: ([b3,b2,b1,b0]) => (b3?8:0)+(b2?4:0)+(b1?2:0)+(b0?1:0) },
  // Multi-output
  HALFADDER:{ label: 'Half Add',  inputs: 2, fn: null },  // → [Sum, Carry]
  FULLADDER:{ label: 'Full Add',  inputs: 3, fn: null },  // → [Sum, Cout]
  DEC24:    { label: 'Dec 2:4',   inputs: 2, fn: null },  // → [Y0,Y1,Y2,Y3]
  // Flip-flops (stateful, edge-triggered)
  DFF:      { label: 'D FF',      inputs: 2, fn: null },  // D,Clk → [Q,Q̄]
  SRFF:     { label: 'SR FF',     inputs: 3, fn: null },  // S,R,Clk → [Q,Q̄]
  JKFF:     { label: 'JK FF',     inputs: 3, fn: null },  // J,K,Clk → [Q,Q̄]
  // Input panel
  HEXPAD:   { label: 'Hex Pad',   inputs: 0, fn: null },  // click digit → [B3,B2,B1,B0]
};

export const PLACEABLE_GATES = [
  'INPUT','SWITCH','BUTTON','CLOCK','OUTPUT','GROUND',
  'NOT','AND','OR','NAND','NOR','XOR','XNOR',
  'MUX','HALFADDER','FULLADDER','DEC24',
  'DFF','SRFF','JKFF',
  'SEVENSEG','HEXPAD',
];
