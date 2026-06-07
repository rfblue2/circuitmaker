import { SHAPES, BUBBLE_R } from './gateShapes.js';

const PIN_R = 5;

// BCD → segment map [a,b,c,d,e,f,g]
const SEG_MAP = [
  [1,1,1,1,1,1,0],[0,1,1,0,0,0,0],[1,1,0,1,1,0,1],[1,1,1,1,0,0,1],
  [0,1,1,0,0,1,1],[1,0,1,1,0,1,1],[1,0,1,1,1,1,1],[1,1,1,0,0,0,0],
  [1,1,1,1,1,1,1],[1,1,1,1,0,1,1],[1,1,1,0,1,1,1],[0,0,1,1,1,1,1],
  [1,0,0,1,1,1,0],[0,1,1,1,1,0,1],[1,0,0,1,1,1,1],[1,0,0,0,1,1,1],
];
const SEG_LINES = {
  a:[16,10,50,10], b:[54,12,54,38], c:[54,42,54,68],
  d:[16,72,50,72], e:[10,42,10,68], f:[10,12,10,38], g:[16,40,50,40],
};
const SEG_KEYS = ['a','b','c','d','e','f','g'];

const HEX_LABELS = '0123456789ABCDEF';

export function getPinPositions(gate) {
  const shape = SHAPES[gate.type];
  return { inputs: shape.inputPins, outputs: shape.outputPins };
}

// ─── Helpers for rectangular multi-pin boxes ─────────────────────────────────

function BoxGate({ W, H, fill, stroke, sw, title, inputLabels = [], outputLabels = [] }) {
  const shape = SHAPES[title] ?? { inputPins: [], outputPins: [] };
  return <>
    <rect x={0} y={0} width={W} height={H} rx={5} fill={fill} stroke={stroke} strokeWidth={sw}/>
    <text x={W/2} y={8} textAnchor="middle" dominantBaseline="hanging"
      fill={stroke} fontSize={9} fontFamily="monospace" fontWeight="600">{title}</text>
    {/* input labels near left pins */}
    {shape.inputPins.map((pin, i) => inputLabels[i] && (
      <text key={i} x={6} y={pin.y} dominantBaseline="central"
        fill="#94a3b8" fontSize={8} fontFamily="monospace">{inputLabels[i]}</text>
    ))}
    {/* output labels near right pins */}
    {shape.outputPins.map((pin, i) => outputLabels[i] && (
      <text key={i} x={W-6} y={pin.y} textAnchor="end" dominantBaseline="central"
        fill="#94a3b8" fontSize={8} fontFamily="monospace">{outputLabels[i]}</text>
    ))}
    {/* output leads (body edge → pin) */}
    {shape.outputPins.map((pin, i) => (
      <line key={i} x1={W} y1={pin.y} x2={pin.x} y2={pin.y} stroke={stroke} strokeWidth={sw}/>
    ))}
  </>;
}

// Clock input triangle symbol (drawn inside body near pin position)
function ClkTriangle({ cx, cy, stroke }) {
  const [x, y] = [cx, cy];
  return <polygon points={`${x-4},${y-5} ${x-4},${y+5} ${x+4},${y}`} fill={stroke}/>;
}

// ─── GateBody ────────────────────────────────────────────────────────────────
// Pure visual body — no pin circles, no events. Used by toolbar thumbnails.
export function GateBody({ type, active, selected, signalValues = [] }) {
  const on     = active === true;
  const stroke = selected ? '#f59e0b' : (on ? '#4ade80' : '#64748b');
  const fill   = on ? '#14532d' : '#1e293b';
  const sw     = selected ? 2 : 1.5;

  if (type === 'INPUT') {
    const c = on ? '#4ade80' : '#64748b';
    return <>
      <circle cx={28} cy={25} r={22} fill={fill} stroke={stroke} strokeWidth={sw}/>
      <text x={28} y={20} textAnchor="middle" dominantBaseline="central" fill={c} fontSize={15} fontWeight="bold" fontFamily="monospace">+</text>
      <text x={28} y={35} textAnchor="middle" dominantBaseline="central" fill={c} fontSize={13} fontFamily="monospace">−</text>
      <line x1={50} y1={25} x2={56} y2={25} stroke={stroke} strokeWidth={sw}/>
    </>;
  }

  if (type === 'SWITCH') {
    return <>
      <line x1={0} y1={25} x2={14} y2={25} stroke={stroke} strokeWidth={sw}/>
      <circle cx={16} cy={25} r={3} fill="#0f172a" stroke={stroke} strokeWidth={sw}/>
      <circle cx={44} cy={25} r={3} fill="#0f172a" stroke={stroke} strokeWidth={sw}/>
      <line x1={47} y1={25} x2={60} y2={25} stroke={stroke} strokeWidth={sw}/>
      {on
        ? <line x1={16} y1={25} x2={44} y2={25} stroke={stroke} strokeWidth={sw}/>
        : <line x1={16} y1={25} x2={41} y2={13} stroke={stroke} strokeWidth={sw}/>
      }
    </>;
  }

  if (type === 'BUTTON') {
    const btnFill = on ? '#14532d' : '#0f172a';
    return <>
      <line x1={0} y1={25} x2={8} y2={25} stroke={stroke} strokeWidth={sw}/>
      <rect x={8} y={14} width={44} height={22} rx={4} fill={btnFill} stroke={stroke} strokeWidth={sw}/>
      <text x={30} y={25} textAnchor="middle" dominantBaseline="central" fill={stroke} fontSize={10} fontFamily="monospace" fontWeight="600">BTN</text>
      <line x1={52} y1={25} x2={60} y2={25} stroke={stroke} strokeWidth={sw}/>
    </>;
  }

  if (type === 'CLOCK') {
    const c = on ? '#4ade80' : '#64748b';
    return <>
      <rect x={4} y={8} width={54} height={34} rx={5} fill={fill} stroke={stroke} strokeWidth={sw}/>
      <path d="M 10,32 L 10,18 L 22,18 L 22,32 L 34,32 L 34,18 L 46,18 L 46,32 L 52,32" fill="none" stroke={c} strokeWidth={1.5}/>
      <line x1={58} y1={25} x2={62} y2={25} stroke={stroke} strokeWidth={sw}/>
    </>;
  }

  if (type === 'OUTPUT') {
    const ts = on ? '#4ade80' : '#64748b';
    const tf = on ? '#14532d' : '#1e293b';
    const ac = on ? '#4ade80' : '#334155';
    return <>
      <line x1={0} y1={15} x2={8}  y2={15} stroke={stroke} strokeWidth={sw}/>
      <line x1={0} y1={35} x2={8}  y2={35} stroke={stroke} strokeWidth={sw}/>
      <path d="M 8,10 L 8,40 L 44,25 Z" fill={tf} stroke={ts} strokeWidth={sw}/>
      <line x1={44} y1={8} x2={44} y2={42} stroke={ts} strokeWidth={2.5}/>
      <line x1={50} y1={20} x2={60} y2={10} stroke={ac} strokeWidth={1.5}/>
      <polyline points="57,10 60,10 60,13" fill="none" stroke={ac} strokeWidth={1.5}/>
      <line x1={52} y1={27} x2={62} y2={17} stroke={ac} strokeWidth={1.5}/>
      <polyline points="59,17 62,17 62,20" fill="none" stroke={ac} strokeWidth={1.5}/>
    </>;
  }

  if (type === 'GROUND') {
    return <>
      <line x1={25} y1={0}  x2={25} y2={12} stroke="#64748b" strokeWidth={1.5}/>
      <line x1={5}  y1={12} x2={45} y2={12} stroke="#64748b" strokeWidth={2}/>
      <line x1={11} y1={20} x2={39} y2={20} stroke="#64748b" strokeWidth={2}/>
      <line x1={17} y1={28} x2={33} y2={28} stroke="#64748b" strokeWidth={2}/>
    </>;
  }

  if (type === 'MUX') {
    return <>
      <polygon points="0,5 0,55 55,48 55,12" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <text x={27} y={30} textAnchor="middle" dominantBaseline="central" fill={stroke} fontSize={11} fontFamily="monospace" fontWeight="600">MUX</text>
      <line x1={55} y1={30} x2={60} y2={30} stroke={stroke} strokeWidth={sw}/>
    </>;
  }

  if (type === 'SEVENSEG') {
    const digit = typeof active === 'number' ? active : 0;
    const segs  = SEG_MAP[digit & 0xf] ?? SEG_MAP[0];
    return <>
      <rect x={8} y={5} width={52} height={80} rx={3} fill="#0a0000" stroke="#334155" strokeWidth={1}/>
      {SHAPES.SEVENSEG.inputPins.map((pin,i) => (
        <line key={i} x1={0} y1={pin.y} x2={8} y2={pin.y} stroke="#475569" strokeWidth={1.5}/>
      ))}
      {SEG_KEYS.map((seg,i) => {
        const [x1,y1,x2,y2] = SEG_LINES[seg];
        return <line key={seg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={segs[i] ? '#ff4444' : '#2d1111'} strokeWidth={4} strokeLinecap="round"/>;
      })}
    </>;
  }

  if (type === 'HALFADDER') {
    return <BoxGate W={55} H={50} fill={fill} stroke={stroke} sw={sw} title="HALFADDER"
      inputLabels={['A','B']} outputLabels={['S','C']}/>;
  }

  if (type === 'FULLADDER') {
    return <BoxGate W={55} H={60} fill={fill} stroke={stroke} sw={sw} title="FULLADDER"
      inputLabels={['A','B','Ci']} outputLabels={['S','Co']}/>;
  }

  if (type === 'DEC24') {
    return <>
      <polygon points="0,15 0,65 55,75 55,5" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <text x={27} y={40} textAnchor="middle" dominantBaseline="central" fill={stroke} fontSize={9} fontFamily="monospace" fontWeight="600">DEC</text>
      <text x={27} y={52} textAnchor="middle" dominantBaseline="central" fill={stroke} fontSize={8} fontFamily="monospace">2:4</text>
      {SHAPES.DEC24.outputPins.map((pin,i) => (
        <line key={i} x1={55} y1={pin.y} x2={pin.x} y2={pin.y} stroke={stroke} strokeWidth={sw}/>
      ))}
    </>;
  }

  // ── Flip-flops ──────────────────────────────────────────
  if (type === 'DFF') {
    const shape = SHAPES.DFF;
    return <>
      <rect x={0} y={0} width={55} height={60} rx={5} fill={fill} stroke={stroke} strokeWidth={sw}/>
      <text x={27} y={8} textAnchor="middle" dominantBaseline="hanging" fill={stroke} fontSize={9} fontFamily="monospace" fontWeight="600">D FF</text>
      <text x={6}  y={20} dominantBaseline="central" fill="#94a3b8" fontSize={9} fontFamily="monospace">D</text>
      <ClkTriangle cx={9} cy={44} stroke={stroke}/>
      <text x={49} y={20} textAnchor="end" dominantBaseline="central" fill="#94a3b8" fontSize={9} fontFamily="monospace">Q</text>
      <text x={49} y={44} textAnchor="end" dominantBaseline="central" fill="#94a3b8" fontSize={8} fontFamily="monospace">Q̄</text>
      {shape.outputPins.map((pin,i) => <line key={i} x1={55} y1={pin.y} x2={pin.x} y2={pin.y} stroke={stroke} strokeWidth={sw}/>)}
    </>;
  }

  if (type === 'SRFF') {
    const shape = SHAPES.SRFF;
    return <>
      <rect x={0} y={0} width={55} height={70} rx={5} fill={fill} stroke={stroke} strokeWidth={sw}/>
      <text x={27} y={8} textAnchor="middle" dominantBaseline="hanging" fill={stroke} fontSize={9} fontFamily="monospace" fontWeight="600">SR FF</text>
      <text x={6}  y={15} dominantBaseline="central" fill="#94a3b8" fontSize={9} fontFamily="monospace">S</text>
      <text x={6}  y={35} dominantBaseline="central" fill="#94a3b8" fontSize={9} fontFamily="monospace">R</text>
      <ClkTriangle cx={9} cy={58} stroke={stroke}/>
      <text x={49} y={22} textAnchor="end" dominantBaseline="central" fill="#94a3b8" fontSize={9} fontFamily="monospace">Q</text>
      <text x={49} y={50} textAnchor="end" dominantBaseline="central" fill="#94a3b8" fontSize={8} fontFamily="monospace">Q̄</text>
      {shape.outputPins.map((pin,i) => <line key={i} x1={55} y1={pin.y} x2={pin.x} y2={pin.y} stroke={stroke} strokeWidth={sw}/>)}
    </>;
  }

  if (type === 'JKFF') {
    const shape = SHAPES.JKFF;
    return <>
      <rect x={0} y={0} width={55} height={70} rx={5} fill={fill} stroke={stroke} strokeWidth={sw}/>
      <text x={27} y={8} textAnchor="middle" dominantBaseline="hanging" fill={stroke} fontSize={9} fontFamily="monospace" fontWeight="600">JK FF</text>
      <text x={6}  y={15} dominantBaseline="central" fill="#94a3b8" fontSize={9} fontFamily="monospace">J</text>
      <text x={6}  y={35} dominantBaseline="central" fill="#94a3b8" fontSize={9} fontFamily="monospace">K</text>
      <ClkTriangle cx={9} cy={58} stroke={stroke}/>
      <text x={49} y={22} textAnchor="end" dominantBaseline="central" fill="#94a3b8" fontSize={9} fontFamily="monospace">Q</text>
      <text x={49} y={50} textAnchor="end" dominantBaseline="central" fill="#94a3b8" fontSize={8} fontFamily="monospace">Q̄</text>
      {shape.outputPins.map((pin,i) => <line key={i} x1={55} y1={pin.y} x2={pin.x} y2={pin.y} stroke={stroke} strokeWidth={sw}/>)}
    </>;
  }

  if (type === 'HEXPAD') {
    const vals = signalValues; // [b3,b2,b1,b0]
    const selectedDigit = vals.length
      ? (vals[0]?8:0)+(vals[1]?4:0)+(vals[2]?2:0)+(vals[3]?1:0)
      : 0;
    const cells = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const digit = row * 4 + col;
        const isSelected = digit === selectedDigit;
        const cx = 5 + col * 20;
        const cy = 5 + row * 20;
        cells.push(
          <g key={digit}>
            <rect x={cx} y={cy} width={18} height={18} rx={2}
              fill={isSelected ? '#1d4ed8' : '#0f172a'} stroke={isSelected ? '#60a5fa' : '#334155'} strokeWidth={1}/>
            <text x={cx+9} y={cy+9} textAnchor="middle" dominantBaseline="central"
              fill={isSelected ? '#fff' : '#64748b'} fontSize={9} fontFamily="monospace" fontWeight={isSelected ? '700' : '400'}>
              {HEX_LABELS[digit]}
            </text>
          </g>
        );
      }
    }
    return <>
      <rect x={0} y={0} width={90} height={90} rx={5} fill="#1e293b" stroke={stroke} strokeWidth={sw}/>
      {cells}
      {/* Output leads */}
      {SHAPES.HEXPAD.outputPins.map((pin,i) => (
        <line key={i} x1={90} y1={pin.y} x2={pin.x} y2={pin.y} stroke={stroke} strokeWidth={sw}/>
      ))}
      {/* Output labels */}
      {['B3','B2','B1','B0'].map((lbl,i) => (
        <text key={i} x={84} y={SHAPES.HEXPAD.outputPins[i].y} textAnchor="end"
          dominantBaseline="central" fill="#475569" fontSize={7} fontFamily="monospace">{lbl}</text>
      ))}
    </>;
  }

  // ── Standard logic gate (bodyPath-based) ─────────────────
  const shape = SHAPES[type];
  if (!shape?.bodyPath) return null;
  return <>
    {shape.leadX && shape.inputPins.map((pin,i) => (
      <line key={i} x1={0} y1={pin.y} x2={shape.leadX} y2={pin.y} stroke={stroke} strokeWidth={sw}/>
    ))}
    <path d={shape.bodyPath} fill={fill} stroke={stroke} strokeWidth={sw}/>
    {shape.extraPath && <path d={shape.extraPath} fill="none" stroke={stroke} strokeWidth={sw}/>}
    {shape.bubble && <circle cx={shape.bubble.cx} cy={shape.bubble.cy} r={BUBBLE_R} fill={fill} stroke={stroke} strokeWidth={sw}/>}
  </>;
}

// ─── GateSymbol ──────────────────────────────────────────────────────────────
export default function GateSymbol({ gate, signalValues = [], onOutputClick, onInputClick, onGateMouseDown, selected }) {
  const shape    = SHAPES[gate.type];
  const outVal0  = signalValues[0];
  // For SEVENSEG the "active" value is the digit number; for others it's boolean
  const active   = gate.type === 'SEVENSEG' ? outVal0 : (outVal0 === true);

  return (
    <g
      transform={`translate(${gate.x},${gate.y})`}
      onMouseDown={(e) => { e.stopPropagation(); onGateMouseDown?.(e, gate.id); }}
      style={{ cursor: 'grab', userSelect: 'none' }}
    >
      <GateBody type={gate.type} active={active} selected={selected} signalValues={signalValues}/>

      {shape.inputPins.map((pin, i) => (
        <circle key={i} cx={pin.x} cy={pin.y} r={PIN_R}
          fill="#0f172a" stroke="#475569" strokeWidth={1.5}
          style={{ cursor: 'crosshair' }}
          onMouseDown={(e) => { e.stopPropagation(); onInputClick?.(gate.id, i); }}
        />
      ))}

      {shape.outputPins.map((pin, i) => (
        <circle key={i} cx={pin.x} cy={pin.y} r={PIN_R}
          fill={signalValues[i] === true ? '#4ade80' : '#0f172a'}
          stroke="#475569" strokeWidth={1.5}
          style={{ cursor: 'crosshair' }}
          onMouseDown={(e) => { e.stopPropagation(); onOutputClick?.(gate.id, i); }}
        />
      ))}
    </g>
  );
}
