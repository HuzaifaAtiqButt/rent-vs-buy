import type { YearRow } from "@/lib/calc";

export function Chart({ rows }: { rows: YearRow[] }) {
  const W = 640;
  const H = 280;
  const pad = { l: 56, r: 48, t: 12, b: 28 };
  const max = Math.max(1, ...rows.flatMap((r) => [r.buyNet, r.rentNet]));
  const min = Math.min(0, ...rows.flatMap((r) => [r.buyNet, r.rentNet]));
  const x = (y: number) => pad.l + ((y - 1) / Math.max(1, rows.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
  const line = (pick: (r: YearRow) => number) =>
    rows.map((r) => `${x(r.year).toFixed(1)},${y(pick(r)).toFixed(1)}`).join(" ");
  const ticks = [0, 0.5, 1].map((t) => min + t * (max - min));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Net worth over time: buying compared with renting">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="currentColor" opacity={0.12} />
          <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize={11} fill="currentColor" opacity={0.6}>
            {Math.round(t / 1000)}k
          </text>
        </g>
      ))}
      {rows.map((r) =>
        r.year % 5 === 0 || r.year === 1 ? (
          <text key={r.year} x={x(r.year)} y={H - 8} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.6}>
            Yr {r.year}
          </text>
        ) : null,
      )}
      <polyline points={line((r) => r.buyNet)} fill="none" stroke="#1b4fb8" strokeWidth={3} />
      <polyline points={line((r) => r.rentNet)} fill="none" stroke="#c2570c" strokeWidth={3} />
      {rows.length > 0 && (
        <>
          <text x={x(rows[rows.length - 1].year) + 6} y={y(rows[rows.length - 1].buyNet) + 4} fontSize={12} fontWeight={700} fill="#1b4fb8">Buy</text>
          <text x={x(rows[rows.length - 1].year) + 6} y={y(rows[rows.length - 1].rentNet) + 4} fontSize={12} fontWeight={700} fill="#c2570c">Rent</text>
        </>
      )}
    </svg>
  );
}
