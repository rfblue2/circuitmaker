export default function WireLine({ x1, y1, x2, y2, active, hovered, onClick, onMouseEnter, onMouseLeave }) {
  const color = hovered ? '#f59e0b' : (active ? '#4ade80' : '#475569');
  const width = hovered ? 3 : 2;
  const mx = (x1 + x2) / 2;
  const d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;

  return (
    <>
      <path d={d} fill="none" stroke="transparent" strokeWidth={12}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ cursor: 'pointer' }}
      />
      <path d={d} fill="none" stroke={color} strokeWidth={width} pointerEvents="none" />
    </>
  );
}
