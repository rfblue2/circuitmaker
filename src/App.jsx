import { useEffect, useRef, useState, useCallback } from 'react';
import Canvas from './components/Canvas.jsx';
import Toolbar from './components/Toolbar.jsx';
import { useCircuit } from './store/useCircuit.js';

export default function App() {
  const circuit = useCircuit();
  const [clockFreqs, setClockFreqs] = useState({}); // gateId → Hz

  const gatesRef = useRef(circuit.gates);
  const freqsRef = useRef(clockFreqs);
  const circuitRef = useRef(circuit);
  const lastToggleRef = useRef({});
  gatesRef.current = circuit.gates;   // eslint-disable-line react-hooks/refs
  freqsRef.current = clockFreqs;      // eslint-disable-line react-hooks/refs
  circuitRef.current = circuit;       // eslint-disable-line react-hooks/refs

  // Variable-rate clock ticking at 20ms resolution
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const clocks = gatesRef.current.filter(g => g.type === 'CLOCK');
      const toToggle = [];
      for (const gate of clocks) {
        const hz = freqsRef.current[gate.id] ?? 1;
        const halfPeriodMs = 500 / hz;
        const last = lastToggleRef.current[gate.id] ?? 0;
        if (now - last >= halfPeriodMs) {
          toToggle.push(gate.id);
          lastToggleRef.current[gate.id] = now;
        }
      }
      if (toToggle.length) circuitRef.current.tickSpecificClocks(toToggle);
    }, 20);
    return () => clearInterval(id);
  }, []); // runs once; reads current state via refs

  const setClockFreq = useCallback((gateId, hz) => {
    setClockFreqs(prev => ({ ...prev, [gateId]: hz }));
    lastToggleRef.current[gateId] = 0; // reset phase so new rate takes effect immediately
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a' }}>
      <Toolbar
        gates={circuit.gates}
        wires={circuit.wires}
        inputValues={circuit.inputValues}
        actions={circuit}
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Canvas
          gates={circuit.gates}
          wires={circuit.wires}
          signalValues={circuit.signalValues}
          pendingWire={circuit.pendingWire}
          actions={circuit}
          clockFreqs={clockFreqs}
          onSetClockFreq={setClockFreq}
        />
      </div>
    </div>
  );
}
