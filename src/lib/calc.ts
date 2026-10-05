export type Inputs = {
  price: number;
  downPct: number;
  rate: number;
  termYears: number;
  taxPct: number;
  insuranceYear: number;
  maintPct: number;
  appreciation: number;
  closingPct: number;
  sellPct: number;
  rent: number;
  rentGrowth: number;
  investReturn: number;
  horizonYears: number;
};

export type YearRow = {
  year: number;
  homeValue: number;
  balance: number;
  buyNet: number;
  rentNet: number;
};

export type Result = {
  rows: YearRow[];
  monthlyMortgage: number;
  monthlyOwnCost: number;
  breakEvenYear: number | null;
};

export const DEFAULTS: Inputs = {
  price: 350000,
  downPct: 20,
  rate: 6.5,
  termYears: 30,
  taxPct: 1.1,
  insuranceYear: 1400,
  maintPct: 1,
  appreciation: 3,
  closingPct: 3,
  sellPct: 6,
  rent: 1900,
  rentGrowth: 3,
  investReturn: 5,
  horizonYears: 15,
};

const monthlyRate = (annualPct: number) => Math.pow(1 + annualPct / 100, 1 / 12) - 1;

export function simulate(i: Inputs): Result {
  const loan = i.price * (1 - i.downPct / 100);
  const r = i.rate / 100 / 12;
  const n = i.termYears * 12;
  const pmt = r === 0 ? loan / n : (loan * r) / (1 - Math.pow(1 + r, -n));

  const growBuyer = monthlyRate(i.investReturn);
  const growHome = monthlyRate(i.appreciation);
  let balance = loan;
  let renter = i.price * (i.downPct / 100) + i.price * (i.closingPct / 100);
  let buyer = 0;
  let homeValue = i.price;
  const rows: YearRow[] = [];
  let monthlyOwnCost = 0;

  for (let m = 1; m <= i.horizonYears * 12; m++) {
    const yearIdx = Math.floor((m - 1) / 12);
    homeValue *= 1 + growHome;
    const paying = m <= n;
    const interest = paying ? balance * r : 0;
    const principal = paying ? pmt - interest : 0;
    balance = Math.max(0, balance - principal);

    const ownCost =
      (paying ? pmt : 0) +
      (homeValue * (i.taxPct + i.maintPct)) / 100 / 12 +
      i.insuranceYear / 12;
    if (m === 1) monthlyOwnCost = ownCost;
    const rent = i.rent * Math.pow(1 + i.rentGrowth / 100, yearIdx);

    renter *= 1 + growBuyer;
    buyer *= 1 + growBuyer;
    const diff = ownCost - rent;
    if (diff > 0) renter += diff;
    else buyer += -diff;

    if (m % 12 === 0) {
      rows.push({
        year: m / 12,
        homeValue,
        balance,
        buyNet: homeValue * (1 - i.sellPct / 100) - balance + buyer,
        rentNet: renter,
      });
    }
  }

  const be = rows.find((row) => row.buyNet >= row.rentNet);
  return {
    rows,
    monthlyMortgage: pmt,
    monthlyOwnCost,
    breakEvenYear: be ? be.year : null,
  };
}

export const money = (v: number) =>
  v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
