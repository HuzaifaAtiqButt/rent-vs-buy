"use client";

import { useMemo, useState } from "react";
import { Chart } from "@/components/Chart";
import { DEFAULTS, money, simulate, type Inputs } from "@/lib/calc";

type Field = { key: keyof Inputs; label: string; step?: number; suffix?: string };

const GROUPS: { title: string; fields: Field[] }[] = [
  {
    title: "Buying",
    fields: [
      { key: "price", label: "Home price", step: 5000, suffix: "$" },
      { key: "downPct", label: "Down payment", step: 1, suffix: "%" },
      { key: "rate", label: "Mortgage rate", step: 0.1, suffix: "%" },
      { key: "termYears", label: "Loan term", step: 5, suffix: "yrs" },
      { key: "taxPct", label: "Property tax per year", step: 0.1, suffix: "%" },
      { key: "insuranceYear", label: "Insurance per year", step: 100, suffix: "$" },
      { key: "maintPct", label: "Maintenance per year", step: 0.1, suffix: "%" },
      { key: "appreciation", label: "Home value growth per year", step: 0.5, suffix: "%" },
      { key: "closingPct", label: "Closing costs", step: 0.5, suffix: "%" },
      { key: "sellPct", label: "Selling costs", step: 0.5, suffix: "%" },
    ],
  },
  {
    title: "Renting",
    fields: [
      { key: "rent", label: "Monthly rent", step: 50, suffix: "$" },
      { key: "rentGrowth", label: "Rent increase per year", step: 0.5, suffix: "%" },
      { key: "investReturn", label: "Return on invested savings", step: 0.5, suffix: "%" },
    ],
  },
  { title: "Time", fields: [{ key: "horizonYears", label: "How long you will stay", step: 1, suffix: "yrs" }] },
];

const card = { background: "var(--card)", borderColor: "var(--line)" };
const muted = { color: "var(--muted)" };

export default function Home() {
  const [v, setV] = useState<Inputs>(DEFAULTS);
  const res = useMemo(() => simulate(v), [v]);
  const last = res.rows[res.rows.length - 1];
  const buyWins = last.buyNet >= last.rentNet;

  const set = (key: keyof Inputs, raw: string) => {
    const n = Number(raw);
    if (Number.isFinite(n)) {
      const min = key === "horizonYears" || key === "termYears" ? 1 : 0;
      const max = key === "horizonYears" ? 40 : key === "termYears" ? 50 : Infinity;
      setV((p) => ({ ...p, [key]: Math.min(max, Math.max(min, n)) }));
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex items-center gap-3">
        <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
          <rect width="36" height="36" rx="9" fill="var(--brand)" />
          <path d="M8 18 18 9l10 9v9H8z" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M14 27v-6h8v6" fill="none" stroke="#fff" strokeWidth="2.4" />
        </svg>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rent vs Buy</h1>
          <p className="text-sm" style={muted}>See which option leaves you with more money over time.</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="space-y-5">
          {GROUPS.map((g) => (
            <div key={g.title} className="rounded-xl border p-4" style={card}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={muted}>{g.title}</h2>
              <div className="space-y-3">
                {g.fields.map((f) => (
                  <label key={f.key} className="flex items-center justify-between gap-3 text-sm">
                    <span>{f.label}</span>
                    <span className="flex items-center gap-1">
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={f.step}
                        value={v[f.key]}
                        onChange={(e) => set(f.key, e.target.value)}
                        className="w-28 rounded-md border bg-transparent px-2 py-1 text-right"
                        style={{ borderColor: "var(--line)" }}
                      />
                      <span className="w-7 text-xs" style={muted}>{f.suffix}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setV(DEFAULTS)} className="text-sm underline" style={muted}>
            Reset to sample numbers
          </button>
        </section>

        <section className="space-y-6">
          <div className="rounded-xl border p-5" style={card}>
            <p className="text-sm" style={muted}>After {v.horizonYears} years</p>
            <p className="mt-1 text-2xl font-semibold">
              {buyWins ? "Buying" : "Renting"} comes out ahead by {money(Math.abs(last.buyNet - last.rentNet))}
            </p>
            <p className="mt-2 text-sm" style={muted}>
              {res.breakEvenYear
                ? `Buying overtakes renting in year ${res.breakEvenYear}.`
                : "Buying does not overtake renting within this time."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Monthly mortgage", money(res.monthlyMortgage)],
              ["Monthly cost of owning (year 1)", money(res.monthlyOwnCost)],
              ["Monthly rent (year 1)", money(v.rent)],
            ].map(([k, val]) => (
              <div key={k} className="rounded-xl border p-4" style={card}>
                <p className="text-xs" style={muted}>{k}</p>
                <p className="mt-1 text-xl font-semibold">{val}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border p-5" style={card}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">Net worth over time</h2>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1"><i className="inline-block h-2 w-4 rounded" style={{ background: "#0f766e" }} />Buy</span>
                <span className="flex items-center gap-1"><i className="inline-block h-2 w-4 rounded" style={{ background: "#b45309" }} />Rent</span>
              </div>
            </div>
            <Chart rows={res.rows} />
          </div>

          <div className="overflow-x-auto rounded-xl border" style={card}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={muted}>
                  <th className="p-3">Year</th>
                  <th className="p-3">Home value</th>
                  <th className="p-3">Loan left</th>
                  <th className="p-3">Buy net</th>
                  <th className="p-3">Rent net</th>
                </tr>
              </thead>
              <tbody>
                {res.rows.map((r) => (
                  <tr key={r.year} className="border-t" style={{ borderColor: "var(--line)" }}>
                    <td className="p-3">{r.year}</td>
                    <td className="p-3">{money(r.homeValue)}</td>
                    <td className="p-3">{money(r.balance)}</td>
                    <td className="p-3">{money(r.buyNet)}</td>
                    <td className="p-3">{money(r.rentNet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <footer className="mt-10 border-t pt-4 text-xs" style={{ borderColor: "var(--line)", ...muted }}>
        Demo project with sample numbers. Estimates only, not financial advice. Nothing is saved or sent anywhere.
      </footer>
    </main>
  );
}
