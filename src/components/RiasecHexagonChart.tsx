import type { RiasecScores } from '../types/profile';

interface RiasecHexagonChartProps {
  scores: RiasecScores;
  size?: number;
  accentColor?: string;
}

const AXES: Array<{ key: keyof RiasecScores; code: string; label: string }> = [
  { key: 'realistic', code: 'R', label: 'Realistic' },
  { key: 'investigative', code: 'I', label: 'Investigative' },
  { key: 'artistic', code: 'A', label: 'Artistic' },
  { key: 'social', code: 'S', label: 'Social' },
  { key: 'enterprising', code: 'E', label: 'Enterprising' },
  { key: 'conventional', code: 'C', label: 'Conventional' },
];

export function RiasecHexagonChart({
  scores,
  size = 220,
  accentColor = '#186049',
}: RiasecHexagonChartProps) {
  const center = size / 2;
  const radius = size * 0.34;
  const rings = [0.25, 0.5, 0.75, 1];

  const getPoint = (index: number, valueRatio: number) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2;
    return {
      x: center + Math.cos(angle) * radius * valueRatio,
      y: center + Math.sin(angle) * radius * valueRatio,
    };
  };

  const dataPoints = AXES.map((axis, idx) => {
    const raw = Math.max(0, Math.min(100, scores[axis.key] || 0));
    return getPoint(idx, raw / 100);
  });

  const polygonPoints = dataPoints.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="RIASEC Holland Hexagon Chart"
      className="mx-auto block select-none"
    >
      {rings.map((ring) => {
        const ringPts = AXES.map((_, idx) => {
          const p = getPoint(idx, ring);
          return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        }).join(' ');
        return (
          <polygon
            key={ring}
            points={ringPts}
            fill="none"
            stroke="#D8D3B8"
            strokeWidth="1"
            strokeDasharray={ring === 1 ? undefined : '2 2'}
          />
        );
      })}

      {AXES.map((axis, idx) => {
        const edge = getPoint(idx, 1);
        const labelPt = getPoint(idx, 1.24);
        return (
          <g key={axis.key}>
            <line
              x1={center}
              y1={center}
              x2={edge.x}
              y2={edge.y}
              stroke="#E2DDC3"
              strokeWidth="1"
            />
            <text
              x={labelPt.x}
              y={labelPt.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#142B22"
              fontSize="11"
              fontWeight="600"
              fontFamily="IBM Plex Mono, monospace"
            >
              {axis.code}
            </text>
          </g>
        );
      })}

      <polygon
        points={polygonPoints}
        fill="#4A943E"
        fillOpacity="0.20"
        stroke={accentColor}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {dataPoints.map((pt, idx) => (
        <circle
          key={AXES[idx].key}
          cx={pt.x}
          cy={pt.y}
          r="3.4"
          fill="#ECE8AF"
          stroke={accentColor}
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}
