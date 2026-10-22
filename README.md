# Flycatcher Promotion Performance

A single-page, client-only dashboard prototype built with React, strict TypeScript, Vite, Tailwind CSS, Recharts, and Framer Motion.

## Run

```sh

npm install
npm start
```

### `npm start`

The dev server prints its local URL. Run `npm test` for selector and interaction tests, and `npm run build` for the strict type-check and production bundle.

## Structure

- `src/components` contains shared controls, charts, the account drawer, and five ordered dashboard sections.

## Data and assumptions

- All records are illustrative; there is no backend or production player data.

- The seed contains 12,480 accounts aged at least 365 days and 3,370 promotion activations. Status totals are 80 pending, 1,860 active, 1,010 completed, and 420 forfeited.

 - The reporting currency is USD. Fixed illustrative conversion rates are USD 1.00, GBP 1.28, EUR 1.08, CAD 0.74, and AUD 0.66; these are not live FX rates.
- The 50% bonus applies to the first qualifying deposit. Rollover is 20× bonus, equivalent to 10× deposit. Only settled wagers count; qualifying wager equals stake multiplied by the game's contribution rate.

- Remaining expected house take uses remaining qualifying wagering divided by the observed effective contribution rate, multiplied by one minus weighted RTP.
- Net contribution is bonus-funded GGR less all credited bonuses plus forfeited bonus cost avoided. ROI is net contribution divided by credited bonuses less forfeitures.

- Forecasts use observed activation average, 4% weekly decay, current completion rate, average deposit, and weighted house edge. Uptake multipliers are conservative 0.78×, base 1.00×, optimistic 1.22×; completion multipliers are 0.78×, 1.00×, 1.16×. The confidence band is a planning interval, not a statistical guarantee.
- Review scores combine RTP variance, bonus/cash win-rate gap, unusually fast completion, low-volatility full-contribution wagering, withdrawal after completion, and shared patterns. They prioritize human review and are not determinations of wrongdoing.

- Scandium and RM Mono font files were not supplied. Startup logs this once and uses the specified fallbacks: Inter Tight/Manrope for display and JetBrains Mono/IBM Plex Mono for telemetry. Burgundy and warm stone are assumed brand accents.
