# Rent vs Buy

A small web app that compares the long-term cost of renting and buying a home. Change the numbers and see net worth over time, the break-even year, and a year-by-year table.

This is a demo project. It uses sample numbers, has no database, and saves nothing. Results are estimates, not financial advice.

## How it works

- Monthly simulation in `src/lib/calc.ts`: mortgage payment, interest and principal, property tax, insurance, maintenance, rent growth and home value growth.
- The renter invests the down payment and closing costs. Whoever spends less each month invests the difference at the same return.
- Net worth for buying is home value minus selling costs minus the loan left, plus invested savings. Net worth for renting is the invested savings.
- Chart is plain SVG, no chart library.

## Stack

Next.js, React, TypeScript, Tailwind CSS.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.
