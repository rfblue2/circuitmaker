const SCHEMA_VERSION = 1;

export function exportSchematic(gates, wires, inputValues) {
  const data = {
    version: SCHEMA_VERSION,
    gates,
    wires,
    inputValues: Object.fromEntries(inputValues),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'schematic.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function importSchematic(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve({
          gates: data.gates ?? [],
          // Backfill fromPin:0 for schematics saved before multi-output support
          wires: (data.wires ?? []).map(w => ({ fromPin: 0, ...w })),
          inputValues: new Map(Object.entries(data.inputValues ?? {})),
        });
      } catch {
        reject(new Error('Invalid schematic file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
