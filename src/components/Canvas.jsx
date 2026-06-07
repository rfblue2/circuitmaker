import { useRef, useState, useCallback, useEffect } from 'react';
import GateSymbol, { getPinPositions } from './GateSymbol.jsx';
import WireLine from './WireLine.jsx';
import { GRID } from '../store/useCircuit.js';

const MIN_SCALE = 0.2;
const MAX_SCALE = 5;

export default function Canvas({ gates, wires, signalValues, pendingWire, actions }) {
  const svgRef = useRef(null);

  const [vp, setVp]                         = useState({ x: 0, y: 0, scale: 1 });
  const [dragging, setDragging]             = useState(null);
  const [panning, setPanning]               = useState(null);
  const [mouseWorld, setMouseWorld]         = useState({ x: 0, y: 0 });
  const [selected, setSelected]             = useState(null);
  const [pressedButton, setPressedButton]   = useState(null);
  const [hoveredWire, setHoveredWire]       = useState(null); // wire id

  // Release button on mouseup anywhere
  useEffect(() => {
    if (!pressedButton) return;
    const release = () => {
      actions.setInput(pressedButton, false);
      setPressedButton(null);
    };
    window.addEventListener('mouseup', release);
    return () => window.removeEventListener('mouseup', release);
  }, [pressedButton, actions]);

  const toWorld = useCallback((sx, sy) => ({
    x: (sx - vp.x) / vp.scale,
    y: (sy - vp.y) / vp.scale,
  }), [vp]);

  const screenPos = useCallback((e) => {
    const r = svgRef.current.getBoundingClientRect();
    return { sx: e.clientX - r.left, sy: e.clientY - r.top };
  }, []);

  // Wheel zoom
  useEffect(() => {
    const el = svgRef.current;
    const onWheel = (e) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const sx = e.clientX - r.left, sy = e.clientY - r.top;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      setVp(v => {
        const ns = Math.max(MIN_SCALE, Math.min(MAX_SCALE, v.scale * factor));
        return { scale: ns, x: sx - (sx - v.x) * (ns / v.scale), y: sy - (sy - v.y) * (ns / v.scale) };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handleMouseMove = (e) => {
    const { sx, sy } = screenPos(e);
    if (panning) {
      setVp(v => ({ ...v, x: sx - panning.startX, y: sy - panning.startY }));
      return;
    }
    const w = toWorld(sx, sy);
    setMouseWorld(w);
    if (dragging) actions.moveGate(dragging.gateId, w.x - dragging.offX, w.y - dragging.offY);
  };

  const handleMouseUp = () => { setPanning(null); setDragging(null); };

  const handleSvgMouseDown = (e) => {
    const tag = e.target.tagName;
    if (tag === 'svg' || tag === 'rect') {
      setSelected(null);
      if (pendingWire) { actions.cancelWire(); return; }
      const { sx, sy } = screenPos(e);
      setPanning({ startX: sx - vp.x, startY: sy - vp.y });
    }
  };

  const handleGateMouseDown = (e, gateId) => {
    const gate = gates.find(g => g.id === gateId);
    if (gate?.type === 'BUTTON') {
      e.stopPropagation();
      actions.setInput(gateId, true);
      setPressedButton(gateId);
      return;
    }
    if (pendingWire) return;
    const { sx, sy } = screenPos(e);
    const w = toWorld(sx, sy);
    setDragging({ gateId, offX: w.x - gate.x, offY: w.y - gate.y });
    setSelected(gateId);
  };

  const handleGateClick = (e, gate) => {
    if (pendingWire) return;
    if (gate.type === 'SWITCH') {
      actions.toggleInput(gate.id);
    } else if (gate.type === 'HEXPAD') {
      const { sx, sy } = screenPos(e);
      const w = toWorld(sx, sy);
      const relX = w.x - gate.x;
      const relY = w.y - gate.y;
      const col = Math.floor((relX - 5) / 20);
      const row = Math.floor((relY - 5) / 20);
      if (col >= 0 && col < 4 && row >= 0 && row < 4) {
        actions.setInput(gate.id, row * 4 + col);
      }
    }
  };

  const handleOutputClick = (gateId, fromPin) => {
    if (pendingWire) { actions.cancelWire(); return; }
    actions.beginWire(gateId, fromPin);
  };

  const handleInputClick = (gateId, pinIndex) => {
    if (!pendingWire) return;
    if (pendingWire.fromGate === gateId) { actions.cancelWire(); return; }
    actions.finishWire(gateId, pinIndex);
  };

  const handleKeyDown = (e) => {
    const meta = e.metaKey || e.ctrlKey;
    if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
      e.preventDefault();
      actions.deleteGate(selected);
      setSelected(null);
    } else if (meta && e.key === 'c' && selected) {
      e.preventDefault(); actions.copyGate(selected);
    } else if (meta && e.key === 'v') {
      e.preventDefault(); actions.pasteGate();
    } else if (meta && e.key === 'z') {
      e.preventDefault(); actions.undo();
    } else if (e.key === 'Escape') {
      actions.cancelWire(); setSelected(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const gateType = e.dataTransfer.getData('gateType');
    if (!gateType) return;
    const { sx, sy } = screenPos(e);
    const w = toWorld(sx, sy);
    actions.addGate(gateType, w.x - 30, w.y - 25);
  };

  const gateOutput = (gateId, fromPin = 0) => {
    const gate = gates.find(g => g.id === gateId);
    if (!gate) return null;
    const { outputs } = getPinPositions(gate);
    const pin = outputs[fromPin];
    if (!pin) return null;
    return { x: gate.x + pin.x, y: gate.y + pin.y };
  };

  const gateInput = (gateId, toPin) => {
    const gate = gates.find(g => g.id === gateId);
    if (!gate) return null;
    const { inputs } = getPinPositions(gate);
    return { x: gate.x + inputs[toPin].x, y: gate.y + inputs[toPin].y };
  };

  // Derive which pins to highlight from the hovered wire
  const hoveredWireObj = hoveredWire ? wires.find(w => w.id === hoveredWire) : null;
  const highlightedPins = hoveredWireObj
    ? {
        output: { gateId: hoveredWireObj.fromGate, pin: hoveredWireObj.fromPin ?? 0 },
        input:  { gateId: hoveredWireObj.toGate,   pin: hoveredWireObj.toPin },
      }
    : null;

  // Grid dots
  const gridPx   = GRID * vp.scale;
  const gridOffX = ((vp.x % gridPx) + gridPx) % gridPx;
  const gridOffY = ((vp.y % gridPx) + gridPx) % gridPx;

  return (
    <svg
      ref={svgRef}
      width="100%" height="100%"
      style={{ background: '#0f172a', outline: 'none', cursor: panning ? 'grabbing' : 'default' }}
      tabIndex={0}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseDown={handleSvgMouseDown}
      onKeyDown={handleKeyDown}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <defs>
        <pattern id="grid" x={gridOffX} y={gridOffY} width={gridPx} height={gridPx} patternUnits="userSpaceOnUse">
          <circle cx={0} cy={0} r={0.8} fill="#1e3a5f"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)"/>

      <g transform={`translate(${vp.x},${vp.y}) scale(${vp.scale})`}>

        {/* Wires */}
        {wires.map(wire => {
          const fromPin = wire.fromPin ?? 0;
          const from = gateOutput(wire.fromGate, fromPin);
          const to   = gateInput(wire.toGate, wire.toPin);
          if (!from || !to) return null;
          const active  = signalValues.get(wire.fromGate)?.[fromPin] === true;
          const hovered = wire.id === hoveredWire;
          return (
            <WireLine key={wire.id}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              active={active} hovered={hovered}
              onClick={() => actions.deleteWire(wire.id)}
              onMouseEnter={() => setHoveredWire(wire.id)}
              onMouseLeave={() => setHoveredWire(null)}
            />
          );
        })}

        {/* Pending wire preview */}
        {pendingWire && (() => {
          const from = gateOutput(pendingWire.fromGate, pendingWire.fromPin ?? 0);
          if (!from) return null;
          return <WireLine x1={from.x} y1={from.y} x2={mouseWorld.x} y2={mouseWorld.y} active={false}/>;
        })()}

        {/* Gates */}
        {gates.map(gate => {
          // Check if any pin on this gate is highlighted by the hovered wire
          const outHighlight = highlightedPins?.output.gateId === gate.id
            ? highlightedPins.output.pin : null;
          const inHighlight  = highlightedPins?.input.gateId  === gate.id
            ? highlightedPins.input.pin  : null;
          return (
            <g key={gate.id} onClick={(e) => handleGateClick(e, gate)}>
              <GateSymbol
                gate={gate}
                signalValues={signalValues.get(gate.id) ?? []}
                onOutputClick={handleOutputClick}
                onInputClick={handleInputClick}
                onGateMouseDown={handleGateMouseDown}
                selected={selected === gate.id}
                highlightOutputPin={outHighlight}
                highlightInputPin={inHighlight}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
