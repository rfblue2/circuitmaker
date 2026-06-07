// SVG polyline for a wire between two pin positions.

export default function WireLine({ x1, y1, x2, y2, active, onClick }) {
  const color = active ? '#4ade80' : '#475569';
  const mx = (x1 + x2) / 2;
  const d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;

  return (
    <>
      {/* wider invisible hit area */}
      <path d={d} fill="none" stroke="transparent" strokeWidth={12} onClick={onClick} style={{ cursor: 'pointer' }} />
      <path d={d} fill="none" stroke={color} strokeWidth={2} pointerEvents="none" />
    </>
  );
}
