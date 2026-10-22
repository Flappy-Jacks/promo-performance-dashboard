import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardSnapshot } from '../types/models';
import { formatPercent, formatUsd } from '../lib/format';
import { ChartPanel, ChartTooltip, EmptyChartState } from './ChartPrimitives';

interface RolloverMixProps {
  data: DashboardSnapshot['categoryMix'];
  volatility: DashboardSnapshot['volatilityMix'];
  contributionRate: number;
}

const categoryLabel: Record<string, string> = {
  slots: 'Slots',
  live_casino: 'Live casino',
  sportsbook: 'Sportsbook',
  table: 'Table',
};

export function RolloverMix({ data, volatility, contributionRate }: RolloverMixProps) {
  const hasWager = data.some((item) => item.rawUsd > 0);
  return (
    <div className="rollover-layout">
      <ChartPanel title="Wagering by category" detail="RAW VS EFFECTIVE USD" className="rollover-mix-panel">
        <div className="chart-legend"><span className="legend-raw">Raw stakes</span><span className="legend-effective">Qualifying wagers</span></div>
        {!hasWager ? <EmptyChartState /> : (
          <div className="chart-canvas mix-canvas" role="img" aria-label="Raw wagering compared with qualifying wagering by category; contribution rates are shown below each category">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--fc-grid)" vertical={false} />
                <XAxis dataKey="category" tickFormatter={(value: string) => categoryLabel[value]} tick={{ fill: 'var(--fc-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--fc-muted)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(value: number) => formatUsd(value, true)} />
                <Tooltip content={<ChartTooltip formatter={(value) => formatUsd(value, true)} />} />
                <Bar name="Raw stakes" dataKey="rawUsd" fill="transparent" stroke="var(--fc-muted)" strokeWidth={1} maxBarSize={22} />
                <Bar name="Qualifying wagers" dataKey="effectiveUsd" fill="var(--fc-paper)" maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="contribution-rates">
          {data.map((item) => (
            <div key={item.category}>
              <span>{categoryLabel[item.category]}</span>
              <strong>{formatPercent(item.rate)}</strong>
            </div>
          ))}
        </div>
        <div className="effective-readout">
          <span>QUALIFYING / RAW</span>
          <strong>{formatPercent(contributionRate)}</strong>
          <small>Effective wagering credits contribution rate × stake.</small>
        </div>
      </ChartPanel>

      <ChartPanel title="Wager volatility" detail="SHARE OF RAW STAKE" className="volatility-panel">
        <div className="volatility-stack" role="img" aria-label={volatility.map((item) => `${item.volatility} volatility ${formatPercent(item.share)}`).join(', ')}>
          {volatility.map((item) => <span key={item.volatility} className={`volatility-${item.volatility}`} style={{ width: `${item.share * 100}%` }} />)}
        </div>
        <div className="volatility-list">
          {volatility.map((item) => (
            <div key={item.volatility}>
              <span><i className={`volatility-key volatility-${item.volatility}`} />{item.volatility} volatility</span>
              <strong>{formatPercent(item.share)}</strong>
              <small>{formatUsd(item.amountUsd, true)}</small>
            </div>
          ))}
        </div>
        <p className="chart-caption">Effective amounts exclude void wagers and games that do not contribute.</p>
      </ChartPanel>
    </div>
  );
}