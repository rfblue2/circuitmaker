import { useReducer, useCallback, useEffect } from 'react';
import { simulate } from '../logic/simulate.js';

export const GRID = 20;
const snap = v => Math.round(v / GRID) * GRID;

let nextId = 1;
const uid = () => `g${nextId++}`;
const wid = () => `w${nextId++}`;

const initialState = {
  gates: [],
  wires: [],
  inputValues: new Map(),      // SWITCH/BUTTON/CLOCK toggle + HEXPAD digit
  componentState: new Map(),   // FF state: Map<gateId, {q,prevClk}>
  pendingWire: null,
  clipboard: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_GATE': {
      const gate = { id: uid(), type: action.gateType, x: snap(action.x), y: snap(action.y) };
      return { ...state, gates: [...state.gates, gate] };
    }
    case 'MOVE_GATE':
      return {
        ...state,
        gates: state.gates.map(g =>
          g.id === action.id ? { ...g, x: snap(action.x), y: snap(action.y) } : g
        ),
      };
    case 'DELETE_GATE':
      return {
        ...state,
        gates: state.gates.filter(g => g.id !== action.id),
        wires: state.wires.filter(w => w.fromGate !== action.id && w.toGate !== action.id),
        inputValues: new Map([...state.inputValues].filter(([k]) => k !== action.id)),
        componentState: new Map([...state.componentState].filter(([k]) => k !== action.id)),
      };
    case 'BEGIN_WIRE':
      return { ...state, pendingWire: { fromGate: action.fromGate, fromPin: action.fromPin ?? 0 } };
    case 'CANCEL_WIRE':
      return { ...state, pendingWire: null };
    case 'FINISH_WIRE': {
      if (!state.pendingWire) return state;
      const { fromGate, fromPin } = state.pendingWire;
      const filtered = state.wires.filter(
        w => !(w.toGate === action.toGate && w.toPin === action.toPin)
      );
      const wire = { id: wid(), fromGate, fromPin: fromPin ?? 0, toGate: action.toGate, toPin: action.toPin };
      return { ...state, wires: [...filtered, wire], pendingWire: null };
    }
    case 'DELETE_WIRE':
      return { ...state, wires: state.wires.filter(w => w.id !== action.id) };
    case 'TOGGLE_INPUT': {
      const next = new Map(state.inputValues);
      next.set(action.id, !next.get(action.id));
      return { ...state, inputValues: next };
    }
    case 'SET_INPUT': {
      const next = new Map(state.inputValues);
      next.set(action.id, action.value);
      return { ...state, inputValues: next };
    }
    case 'TICK_CLOCKS': {
      const clockIds = state.gates.filter(g => g.type === 'CLOCK').map(g => g.id);
      if (!clockIds.length) return state;
      const next = new Map(state.inputValues);
      for (const id of clockIds) next.set(id, !next.get(id));
      return { ...state, inputValues: next };
    }
    case 'UPDATE_COMPONENT_STATE':
      return { ...state, componentState: action.nextState };
    case 'COPY_GATE': {
      const gate = state.gates.find(g => g.id === action.id);
      if (!gate) return state;
      return { ...state, clipboard: { gateType: gate.type, x: gate.x, y: gate.y } };
    }
    case 'PASTE_GATE': {
      if (!state.clipboard) return state;
      const { gateType, x, y } = state.clipboard;
      const gate = { id: uid(), type: gateType, x: snap(x + GRID * 2), y: snap(y + GRID * 2) };
      return { ...state, gates: [...state.gates, gate], clipboard: { gateType, x: gate.x, y: gate.y } };
    }
    case 'LOAD': {
      nextId = 1;
      const iv = action.data.inputValues;
      return {
        ...initialState,
        gates: action.data.gates ?? [],
        wires: action.data.wires ?? [],
        inputValues: iv instanceof Map ? iv : new Map(Object.entries(iv ?? {})),
      };
    }
    case 'CLEAR':
      return { ...initialState };
    default:
      return state;
  }
}

function componentStatesEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const [id, sa] of a) {
    const sb = b.get(id);
    if (!sb || sa.q !== sb.q || sa.prevClk !== sb.prevClk) return false;
  }
  return true;
}

export function useCircuit() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { signalValues, nextComponentState } = simulate(
    state.gates, state.wires, state.inputValues, state.componentState
  );

  // Sync FF state after each render if it changed
  useEffect(() => {
    if (!componentStatesEqual(nextComponentState, state.componentState)) {
      dispatch({ type: 'UPDATE_COMPONENT_STATE', nextState: nextComponentState });
    }
  });

  const actions = {
    addGate:    useCallback((t, x, y) => dispatch({ type: 'ADD_GATE', gateType: t, x, y }), []),
    moveGate:   useCallback((id, x, y) => dispatch({ type: 'MOVE_GATE', id, x, y }), []),
    deleteGate: useCallback((id) => dispatch({ type: 'DELETE_GATE', id }), []),
    beginWire:  useCallback((fg, fp) => dispatch({ type: 'BEGIN_WIRE', fromGate: fg, fromPin: fp ?? 0 }), []),
    cancelWire: useCallback(() => dispatch({ type: 'CANCEL_WIRE' }), []),
    finishWire: useCallback((tg, tp) => dispatch({ type: 'FINISH_WIRE', toGate: tg, toPin: tp }), []),
    deleteWire: useCallback((id) => dispatch({ type: 'DELETE_WIRE', id }), []),
    toggleInput:useCallback((id) => dispatch({ type: 'TOGGLE_INPUT', id }), []),
    setInput:   useCallback((id, v) => dispatch({ type: 'SET_INPUT', id, value: v }), []),
    tickClocks: useCallback(() => dispatch({ type: 'TICK_CLOCKS' }), []),
    copyGate:   useCallback((id) => dispatch({ type: 'COPY_GATE', id }), []),
    pasteGate:  useCallback(() => dispatch({ type: 'PASTE_GATE' }), []),
    load:       useCallback((data) => dispatch({ type: 'LOAD', data }), []),
    clear:      useCallback(() => dispatch({ type: 'CLEAR' }), []),
  };

  return { ...state, signalValues, ...actions };
}
