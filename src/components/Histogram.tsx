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
import { formatDuration, formatNumber } from '../lib/format';
import { ChartPanel, ChartTooltip, EmptyChartState } from './ChartPrimitives';

interface HistogramProps {
  data: DashboardSnapshot['completionHistogram'];
  averageCompletionHours: number;
}

export function Histogram({ data, averageCompletionHours }: HistogramProps) {
  const hasAccounts = data.some((item) => item.count > 0);
  return (
    <ChartPanel title="Rollover completion" detail="QUALIFYING / REQUIRED" className="histogram-panel">
      {!hasAccounts ? <EmptyChartState /> : (
        <div className="chart-canvas histogram-canvas" role="img" aria-label={`Completion distribution from ${formatNumber(data[0]?.count ?? 0)} accounts across six rollover-progress bands`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="var(--fc-grid)" vertical={false} />
              <XAxis dataKey="range" tick={{ fill: 'var(--fc-muted)', fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--fc-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip formatter={formatNumber} />} />
              <Bar name="Accounts" dataKey="count" fill="transparent" stroke="var(--fc-muted)" strokeWidth={1} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="histogram-foot"><span>AVERAGE TIME TO COMPLETE</span><strong>{formatDuration(averageCompletionHours)}</strong></div>
    </ChartPanel>
  );
}