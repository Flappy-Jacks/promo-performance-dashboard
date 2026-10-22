import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardSnapshot } from '../types/models';
import { formatNumber } from '../lib/format';
import { ChartPanel, ChartTooltip, EmptyChartState } from './ChartPrimitives';

interface TrendChartProps {
  data: DashboardSnapshot['activationTrend'];
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <ChartPanel title="Activation over time" detail="DAILY / CUMULATIVE" className="trend-panel">
      <div className="chart-legend"><span className="legend-daily">Daily claims</span><span className="legend-cumulative">Cumulative claims</span><span className="legend-week">Offer week</span></div>
      {data.length === 0 || data.every((point) => point.daily === 0) ? <EmptyChartState /> : (
        <div className="trend-panels" role="group" aria-label="Daily and cumulative activations use separate scales on a shared date axis">
          <div className="trend-plot daily-plot" role="img" aria-label={`Daily activations peak at ${formatNumber(Math.max(...data.filter((point) => point.date >= '2026-09-01' && point.date <= '2026-09-07').map((point) => point.daily)))} during the offer week, then decay through 14 October`}>
            <span className="plot-label">DAILY ACTIVATIONS</span>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="var(--fc-grid)" vertical={false} />
                <XAxis dataKey="label" hide />
                <YAxis tick={{ fill: 'var(--fc-muted)', fontSize: 9 }} tickLine={false} axisLine={false} width={34} />
                <ReferenceArea x1="Sep 1" x2="Sep 7" fill="var(--fc-muted)" fillOpacity={0.035} stroke="var(--fc-muted)" strokeOpacity={0.22} />
                <Tooltip content={<ChartTooltip formatter={formatNumber} />} />
                <Bar name="Daily activations" dataKey="daily" fill="var(--fc-band)" stroke="var(--fc-paper)" strokeWidth={1} maxBarSize={13} isAnimationActive />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="trend-plot cumulative-plot" role="img" aria-label={`${formatNumber(data.at(-1)?.cumulative ?? 0)} cumulative activations by 14 October`}>
            <span className="plot-label">CUMULATIVE ACTIVATIONS</span>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="var(--fc-grid)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--fc-muted)', fontSize: 9 }} tickLine={false} axisLine={false} minTickGap={28} />
                <YAxis tick={{ fill: 'var(--fc-muted)', fontSize: 9 }} tickLine={false} axisLine={false} width={34} />
                <ReferenceArea x1="Sep 1" x2="Sep 7" fill="var(--fc-muted)" fillOpacity={0.035} stroke="var(--fc-muted)" strokeOpacity={0.22} />
                <Tooltip content={<ChartTooltip formatter={formatNumber} />} />
                <Line name="Cumulative activations" dataKey="cumulative" type="monotone" stroke="var(--fc-stone)" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: 'var(--fc-stone)' }} isAnimationActive />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <p className="chart-caption">Activation curve extends beyond offer close to expose the delayed-claim tail.</p>
    </ChartPanel>
  );
}