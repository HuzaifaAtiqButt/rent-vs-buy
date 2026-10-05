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
    <main>
      <section style={{ background: "var(--band)", color: "#15130c" }} aria-live="polite">
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-5 sm:px-8">
          <h1 className="text-lg font-black tracking-tight">Rent vs Buy</h1>
          <p className="mt-12 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl">
            After {v.horizonYears} years, {buyWins ? "buying" : "renting"} leaves you {money(Math.abs(last.buyNet - last.rentNet))} ahead.
          </p>
          <p className="mt-4 text-xl font-medium">
            {res.breakEvenYear
              ? `Buying catches up with renting in year ${res.breakEvenYear}.`
              : "Buying does not catch up with renting in this time."}
          </p>
          <dl className="mt-10 grid gap-5 border-t-2 border-[#15130c] pt-4 sm:grid-cols-3">
            {[
              ["Monthly mortgage", money(res.monthlyMortgage)],
              ["Monthly cost of owning, year 1", money(res.monthlyOwnCost)],
              ["Monthly rent, year 1", money(v.rent)],
            ].map(([k, val]) => (
              <div key={k}>
                <dt className="text-sm font-medium">{k}</dt>
                <dd className="text-3xl font-black">{val}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <section>
          <h2 className="text-2xl font-black">What you would own, year by year</h2>
          <p className="mb-3 mt-1 text-base" style={{ color: "var(--muted)" }}>After selling costs, if you buy and if you rent.</p>
          <Chart rows={res.rows} />
        </section>

        <section aria-label="Assumptions" className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-3">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h2 className="border-b-4 pb-1 text-xl font-black" style={{ borderColor: g.title === "If you buy" ? "var(--buy)" : g.title === "If you rent" ? "var(--rent)" : "var(--ink)" }}>
                {g.title}
              </h2>
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
                      className="w-24 bg-transparent px-1 py-1 text-right text-base font-bold"
                    />
                    <span className="w-7 text-xs" style={{ color: "var(--muted)" }}>{f.suffix}</span>
                  </span>
                </label>
              ))}
              {g.title === "How long" && (
                <button type="button" onClick={() => setV(DEFAULTS)} className="mt-5 text-sm font-bold underline underline-offset-4">
                  Reset to sample numbers
                </button>
              )}
            </div>
          ))}
        </section>

        <div className="mt-12 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="pb-2 text-left text-2xl font-black">Year by year</caption>
            <thead>
              <tr className="border-b-2 text-left" style={{ borderColor: "var(--ink)" }}>
                <th className="py-2 pr-3">Year</th>
                <th className="py-2 pr-3 text-right">Home value</th>
                <th className="py-2 pr-3 text-right">Loan left</th>
                <th className="py-2 pr-3 text-right">If you buy</th>
                <th className="py-2 text-right">If you rent</th>
              </tr>
            </thead>
            <tbody>
              {res.rows.map((r) => (
                <tr key={r.year} className="border-b" style={{ borderColor: "var(--line)" }}>
                  <td className="py-2 pr-3">{r.year}</td>
                  <td className="py-2 pr-3 text-right">{money(r.homeValue)}</td>
                  <td className="py-2 pr-3 text-right">{money(r.balance)}</td>
                  <td className="py-2 pr-3 text-right font-bold" style={{ color: "var(--buy)" }}>{money(r.buyNet)}</td>
                  <td className="py-2 text-right font-bold" style={{ color: "var(--rent)" }}>{money(r.rentNet)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="mt-12 border-t pt-4 text-sm" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
          A demo with sample numbers. These are estimates, not financial advice, and nothing is saved or sent anywhere.
        </footer>
      </div>
    </main>
  );
}
