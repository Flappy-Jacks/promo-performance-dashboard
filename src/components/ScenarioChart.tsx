import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardSnapshot, Scenario } from '../types/models';
import { formatUsd } from '../lib/format';
import { ChartPanel, ChartTooltip } from './ChartPrimitives';

interface ScenarioChartProps {
  data: DashboardSnapshot['projections'];
  snapshot: DashboardSnapshot;
  scenario: Scenario;
  horizon: 4 | 8 | 12;
  onScenarioChange: (scenario: Scenario) => void;
  onHorizonChange: (horizon: 4 | 8 | 12) => void;
}

const scenarios: Array<{ id: Scenario; label: string }> = [
  { id: 'conservative', label: 'Conservative' },
  { id: 'base', label: 'Base' },
  { id: 'optimistic', label: 'Optimistic' },
];

const horizons: Array<4 | 8 | 12> = [4, 8, 12];

export function ScenarioChart({ data, snapshot, scenario, horizon, onScenarioChange, onHorizonChange }: ScenarioChartProps) {
  return (
    <div className="projection-layout">
      <ChartPanel title="Uptake, revenue & cost" detail={`${horizon}-WEEK OUTLOOK`} className="projection-panel">
        <div className="scenario-controls">
          <div className="scenario-group" role="group" aria-label="Projection scenario">
            {scenarios.map((item) => (
              <button key={item.id} type="button" aria-pressed={scenario === item.id} onClick={() => onScenarioChange(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="horizon-group" role="group" aria-label="Projection horizon">
            <span>HORIZON</span>
            {horizons.map((item) => (
              <button key={item} type="button" aria-pressed={horizon === item} onClick={() => onHorizonChange(item)}>
                {item}W
              </button>
            ))}
          </div>
        </div>
        <div className="chart-legend"><span className="legend-uptake">Activations</span><span className="legend-revenue">Revenue</span><span className="legend-cost">Bonus cost</span><span className="legend-confidence">Net confidence band</span></div>
        {data.length === 0 ? <div className="empty-chart">No projection can be calculated for this selection.</div> : (
          <div className="projection-small-multiples" role="group" aria-label={`${scenario} scenario projection over ${horizon} weeks`}>
            <div className="projection-mini" role="img" aria-label="Projected activations per week">
              <span className="plot-label">ACTIVATIONS</span>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid stroke="var(--fc-grid)" vertical={false} />
                  <XAxis dataKey="week" hide />
                  <YAxis tick={{ fill: 'var(--fc-muted)', fontSize: 9 }} tickLine={false} axisLine={false} width={36} />
                  <Tooltip content={<ChartTooltip formatter={(value) => value.toLocaleString('en-US')} />} />
                  <Bar name="Activations" dataKey="activations" fill="var(--fc-band)" stroke="var(--fc-paper)" strokeWidth={1} maxBarSize={17} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="projection-mini projection-dollar-mini" role="img" aria-label="Cumulative projected revenue and bonus cost with a net contribution confidence band">
              <span className="plot-label">CUMULATIVE USD · REVENUE / COST</span>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid stroke="var(--fc-grid)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: 'var(--fc-muted)', fontSize: 9 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: 'var(--fc-muted)', fontSize: 9 }} tickLine={false} axisLine={false} width={36} tickFormatter={(value: number) => formatUsd(value, true)} />
                  <Tooltip content={<ChartTooltip formatter={(value) => formatUsd(value, true)} />} />
                  <Area name="Net confidence band" dataKey="netLow" stackId="confidence" stroke="none" fill="transparent" isAnimationActive={false} />
                  <Area name="Net confidence band" dataKey="netBand" stackId="confidence" stroke="none" fill="var(--fc-band)" fillOpacity={1} isAnimationActive={false} />
                  <Line name="Revenue" dataKey="revenue" type="monotone" stroke="var(--fc-paper)" strokeWidth={1.5} dot={false} />
                  <Line name="Bonus cost" dataKey="cost" type="monotone" stroke="var(--fc-muted)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  <Line name="Net contribution" dataKey="net" type="monotone" stroke="var(--fc-muted)" strokeWidth={1} strokeDasharray="2 3" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        <p className="chart-caption">Directional planning range; the shaded band brackets cumulative net contribution.</p>
      </ChartPanel>

      <aside id="assumptions-note" className="assumptions-panel" aria-label="Projection assumptions">
        <div className="assumptions-heading"><span>MODEL INPUTS</span><span>/{scenario.toUpperCase()}</span></div>
        <div className="assumption-row"><span>Activation curve</span><strong>−4% weekly tail</strong></div>
        <div className="assumption-row"><span>Completion rate</span><strong>{(snapshot.completionRate * 100).toFixed(1)}%</strong></div>
        <div className="assumption-row"><span>Average deposit</span><strong>{formatUsd(snapshot.averageDepositUsd)}</strong></div>
        <div className="assumption-row"><span>Weighted house edge</span><strong>{((1 - snapshot.weightedRtp) * 100).toFixed(1)}%</strong></div>
        <div className="assumptions-foot">BONUS BASIS&nbsp; / &nbsp;50% × DEPOSIT × 20×</div>
      </aside>
    </div>
  );
}