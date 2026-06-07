import { useEffect } from 'react';
import Canvas from './components/Canvas.jsx';
import Toolbar from './components/Toolbar.jsx';
import { useCircuit } from './store/useCircuit.js';

const CLOCK_INTERVAL_MS = 500; // half-period → 1 Hz square wave

export default function App() {
  const circuit = useCircuit();

  // Tick all CLOCK gates at fixed interval
  useEffect(() => {
    const id = setInterval(circuit.tickClocks, CLOCK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [circuit.tickClocks]);

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
        />
      </div>
    </div>
  );
}
