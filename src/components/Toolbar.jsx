import { useRef, useState } from 'react';
import { GATE_TYPES, PLACEABLE_GATES } from '../logic/gates.js';
import { SHAPES } from './gateShapes.js';
import { GateBody } from './GateSymbol.jsx';
import { exportSchematic, importSchematic } from '../io/schematic.js';
import { SAMPLES } from '../samples/index.js';

function GateThumbnail({ type }) {
  const shape = SHAPES[type];
  const vbW = shape.W + (shape.outputPin ? Math.max(0, shape.outputPin.x - shape.W + 8) : 0);
  const vbH = shape.H;
  const aspect = vbH / vbW;
  const dispW = 74;
  const dispH = Math.max(36, Math.min(70, Math.round(dispW * aspect)));
  return (
    <svg viewBox={`-6 -4 ${vbW + 14} ${vbH + 8}`}
      width={dispW} height={dispH} style={{ display: 'block', pointerEvents: 'none' }}>
      <GateBody type={type} active={false} selected={false} />
    </svg>
  );
}

export default function Toolbar({ gates, wires, inputValues, actions }) {
  const fileRef = useRef(null);
  const [samplesOpen, setSamplesOpen] = useState(false);

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

  return (
    <div style={{
      width: 100, background: '#1e293b', borderRight: '1px solid #334155',
      display: 'flex', flexDirection: 'column', gap: 4, padding: 10, userSelect: 'none',
      overflowY: 'auto',
    }}>
      <div style={{ color: '#64748b', fontSize: 10, fontWeight: 600, marginBottom: 2, letterSpacing: '0.05em' }}>
        COMPONENTS
      </div>
      {PLACEABLE_GATES.map(type => (
        <div
          key={type}
          draggable
          onDragStart={(e) => handleDragStart(e, type)}
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
            overflow: 'hidden',
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

const btnStyle = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 6,
  padding: '5px 8px', color: '#94a3b8', fontSize: 11, cursor: 'pointer',
};
