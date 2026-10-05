"use client";

import { useMemo, useState } from "react";
import { Chart } from "@/components/Chart";
import { DEFAULTS, money, simulate, type Inputs } from "@/lib/calc";

type Field = { key: keyof Inputs; label: string; step?: number; suffix?: string };

const GROUPS: { title: string; fields: Field[] }[] = [
  {
    title: "If you buy",
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
    title: "If you rent",
    fields: [
      { key: "rent", label: "Monthly rent", step: 50, suffix: "$" },
      { key: "rentGrowth", label: "Rent increase per year", step: 0.5, suffix: "%" },
      { key: "investReturn", label: "Return on invested savings", step: 0.5, suffix: "%" },
    ],
  },
  { title: "How long", fields: [{ key: "horizonYears", label: "How long you will stay", step: 1, suffix: "yrs" }] },
];

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
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <header className="flex items-center gap-3 border-b-2 pb-4" style={{ borderColor: "var(--ink)" }}>
        <svg width="30" height="30" viewBox="0 0 36 36" aria-hidden="true">
          <rect width="36" height="36" fill="var(--ink)" />
          <path d="M8 19 18 10l10 9" fill="none" stroke="#6b9bf2" strokeWidth="3" strokeLinejoin="round" />
          <path d="M12 18v9h12v-9" fill="none" stroke="#fff" strokeWidth="3" />
        </svg>
        <h1 className="text-xl font-extrabold tracking-tight">Rent vs Buy</h1>
      </header>

      <section className="py-10" aria-live="polite">
        <p className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          After {v.horizonYears} years, {buyWins ? "buying" : "renting"} leaves you {money(Math.abs(last.buyNet - last.rentNet))} ahead.
        </p>
        <p className="mt-3 text-lg" style={muted}>
          {res.breakEvenYear
            ? `Buying catches up with renting in year ${res.breakEvenYear}.`
            : "Buying does not catch up with renting in this time."}
        </p>
        <dl className="mt-8 grid gap-6 border-t pt-5 sm:grid-cols-3" style={{ borderColor: "var(--line)" }}>
          {[
            ["Monthly mortgage", money(res.monthlyMortgage)],
            ["Monthly cost of owning, year 1", money(res.monthlyOwnCost)],
            ["Monthly rent, year 1", money(v.rent)],
          ].map(([k, val]) => (
            <div key={k}>
              <dt className="text-sm" style={muted}>{k}</dt>
              <dd className="mt-1 text-2xl font-bold">{val}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-10 lg:grid-cols-[340px_1fr]">
        <section aria-label="Assumptions">
          {GROUPS.map((g) => (
            <div key={g.title} className="mb-7">
              <h2 className="border-b-2 pb-1 text-lg font-bold" style={{ borderColor: "var(--ink)" }}>{g.title}</h2>
              {g.fields.map((f) => (
                <label key={f.key} className="flex items-center justify-between gap-3 border-b py-2 text-sm" style={{ borderColor: "var(--line)" }}>
                  <span>{f.label}</span>
                  <span className="flex items-center gap-1">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={f.step}
                      value={v[f.key]}
                      onChange={(e) => set(f.key, e.target.value)}
                      className="w-28 bg-transparent px-1 py-1 text-right text-base font-semibold"
                    />
                    <span className="w-7 text-xs" style={muted}>{f.suffix}</span>
                  </span>
                </label>
              ))}
            </div>
          ))}
          <button type="button" onClick={() => setV(DEFAULTS)} className="text-sm font-medium underline underline-offset-4">
            Reset to sample numbers
          </button>
        </section>

        <section className="space-y-8">
          <div>
            <h2 className="text-lg font-bold">Net worth over time</h2>
            <p className="mb-2 text-sm" style={muted}>What you would own after selling costs, in each case.</p>
            <Chart rows={res.rows} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="pb-2 text-left text-lg font-bold">Year by year</caption>
              <thead>
                <tr className="border-b-2 text-left" style={{ borderColor: "var(--ink)" }}>
                  <th className="py-2 pr-3">Year</th>
                  <th className="py-2 pr-3 text-right">Home value</th>
                  <th className="py-2 pr-3 text-right">Loan left</th>
                  <th className="py-2 pr-3 text-right">Buy net</th>
                  <th className="py-2 text-right">Rent net</th>
                </tr>
              </thead>
              <tbody>
                {res.rows.map((r) => (
                  <tr key={r.year} className="border-b" style={{ borderColor: "var(--line)" }}>
                    <td className="py-2 pr-3">{r.year}</td>
                    <td className="py-2 pr-3 text-right">{money(r.homeValue)}</td>
                    <td className="py-2 pr-3 text-right">{money(r.balance)}</td>
                    <td className="py-2 pr-3 text-right font-semibold" style={{ color: "var(--brand)" }}>{money(r.buyNet)}</td>
                    <td className="py-2 text-right font-semibold" style={{ color: "#c2570c" }}>{money(r.rentNet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <footer className="mt-12 border-t pt-4 text-sm" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
        Demo project with sample numbers. These are estimates, not financial advice. Nothing is saved or sent anywhere.
      </footer>
    </main>
  );
}
