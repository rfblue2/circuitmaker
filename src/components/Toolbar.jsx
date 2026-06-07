import { useRef, useState } from 'react';
import { GATE_TYPES } from '../logic/gates.js';
import { SHAPES } from './gateShapes.js';
import { GateBody } from './GateSymbol.jsx';
import { exportSchematic, importSchematic } from '../io/schematic.js';
import { SAMPLES } from '../samples/index.js';

const GROUPS = [
  { label: 'I/O',          types: ['INPUT','GROUND','SWITCH','BUTTON','CLOCK','OUTPUT','SEVENSEG','SEG7','HEXPAD','LEDMATRIX'] },
  { label: 'Logic Gates',  types: ['NOT','AND','OR','NAND','NOR','XOR','XNOR'] },
  { label: 'Combinational',types: ['MUX','HALFADDER','FULLADDER','DEC24','DEC7SEG','MATRIX3X5'] },
  { label: 'Flip-Flops',   types: ['DFF','SRFF','JKFF'] },
];

function GateThumbnail({ type }) {
  const shape = SHAPES[type];
  const vbW = shape.W;
  const vbH = shape.H;
  const aspect = vbH / vbW;
  const dispW = 74;
  const dispH = Math.max(30, Math.min(70, Math.round(dispW * aspect)));
  return (
    <svg viewBox={`-6 -4 ${vbW + 14} ${vbH + 8}`}
      width={dispW} height={dispH} style={{ display: 'block', pointerEvents: 'none' }}>
      <GateBody type={type} active={false} selected={false} />
    </svg>
  );
}

function GateItem({ type, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, type)}
      title={type}
      style={{
        background: '#0f172a', border: '1px solid #334155', borderRadius: 6,
        padding: '4px 6px', cursor: 'grab', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 1,
      }}
    >
      <GateThumbnail type={type} />
      <span style={{ color: '#64748b', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
        {GATE_TYPES[type].label}
      </span>
    </div>
  );
}

export default function Toolbar({ gates, wires, inputValues, actions }) {
  const fileRef = useRef(null);
  const [samplesOpen, setSamplesOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState({});

  const handleDragStart = (e, gateType) => {
    e.dataTransfer.setData('gateType', gateType);
  };

  const handleExport = () => exportSchematic(gates, wires, inputValues);

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await importSchematic(file);
      actions.load(data);
    } catch (err) {
      alert(err.message);
    }
    e.target.value = '';
  };

  const loadSample = (sample) => {
    actions.load(sample.schematic);
    setSamplesOpen(false);
  };

  const q = query.trim().toLowerCase();

  const filteredGroups = GROUPS.map(g => ({
    ...g,
    types: g.types.filter(t =>
      !q ||
      t.toLowerCase().includes(q) ||
      GATE_TYPES[t].label.toLowerCase().includes(q)
    ),
  })).filter(g => g.types.length > 0);

  const toggleGroup = (label) =>
    setCollapsed(c => ({ ...c, [label]: !c[label] }));

  return (
    <div style={{
      width: 180, background: '#1e293b', borderRight: '1px solid #334155',
      display: 'flex', flexDirection: 'column', gap: 4, padding: 8, userSelect: 'none',
      overflowY: 'auto',
    }}>
      {/* Search */}
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search…"
        style={{
          background: '#0f172a', border: '1px solid #334155', borderRadius: 5,
          color: '#cbd5e1', fontSize: 11, padding: '4px 6px', outline: 'none',
          width: '100%', boxSizing: 'border-box',
        }}
      />

      {/* Component groups */}
      {filteredGroups.map(group => (
        <div key={group.label}>
          <button
            onClick={() => toggleGroup(group.label)}
            style={{
              ...groupHdrStyle,
              opacity: collapsed[group.label] ? 0.6 : 1,
            }}
          >
            <span>{group.label}</span>
            <span style={{ fontSize: 8 }}>{collapsed[group.label] ? '▶' : '▼'}</span>
          </button>
          {!collapsed[group.label] && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, marginTop: 2 }}>
              {group.types.map(type => (
                <GateItem key={type} type={type} onDragStart={handleDragStart} />
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={{ flex: 1 }} />

      {/* Samples menu */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => setSamplesOpen(v => !v)} style={{ ...btnStyle, width: '100%' }}>
          Samples {samplesOpen ? '▲' : '▼'}
        </button>
        {samplesOpen && (
          <div style={{
            position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 4,
            background: '#1e293b', border: '1px solid #334155', borderRadius: 6,
            overflow: 'hidden', zIndex: 10,
          }}>
            {SAMPLES.map(sample => (
              <button
                key={sample.name}
                onClick={() => loadSample(sample)}
                style={{
                  ...btnStyle, display: 'block', width: '100%', borderRadius: 0,
                  borderWidth: '0 0 1px 0', textAlign: 'left', padding: '6px 8px',
                  fontSize: 10,
                }}
              >
                {sample.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleExport} style={btnStyle}>Export</button>
      <button onClick={() => fileRef.current.click()} style={btnStyle}>Import</button>
      <button onClick={actions.clear} style={{ ...btnStyle, color: '#f87171' }}>Clear</button>
      <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
    </div>
  );
}

const groupHdrStyle = {
  background: 'none', border: 'none', color: '#475569', fontSize: 9, fontWeight: 700,
  letterSpacing: '0.08em', cursor: 'pointer', width: '100%', textAlign: 'left',
  padding: '4px 2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  textTransform: 'uppercase',
};

const btnStyle = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 6,
  padding: '5px 8px', color: '#94a3b8', fontSize: 11, cursor: 'pointer',
};
