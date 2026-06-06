type Props = {
  pct: number; // 0-100
};

const SIZE = 44;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ringColor(pct: number): string {
  if (pct >= 80) return "#1AA64E";
  if (pct >= 60) return "#7BAE2E";
  return "#E1832A";
}

export default function MatchingRing({ pct }: Props) {
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);
  const color = ringColor(clamped);

  return (
    <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)" }} aria-hidden>
      {/* 배경 트랙 */}
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="#E6ECDF"
        strokeWidth={STROKE}
      />
      {/* 진행 링 */}
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
      {/* 가운데 텍스트 — rotate로 역회전해 바로 세움 */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          transform: "rotate(90deg)",
          transformOrigin: "50% 50%",
          fill: color,
          fontFamily: "Pretendard, sans-serif",
          fontWeight: 800,
          fontSize: "11px",
        }}
      >
        {clamped}
        <tspan style={{ fontSize: "8px", fontWeight: 600 }}>%</tspan>
      </text>
    </svg>
  );
}
