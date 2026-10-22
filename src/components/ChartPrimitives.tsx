interface ChartPanelProps {
  title: string;
  detail?: string;
  className?: string;
  children: React.ReactNode;
}

export function ChartPanel({ title, detail, className = '', children }: ChartPanelProps) {
  return (
    <article className={`chart-panel ${className}`}>
      <header className="chart-panel-header">
        <h3>{title}</h3>
        {detail && <span>{detail}</span>}
      </header>
      {children}
    </article>
  );
}

export function EmptyChartState({ label = 'No records in this selection' }: { label?: string }) {
  return <div className="empty-chart" role="status">{label}</div>;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string;
  formatter?: (value: number) => string;
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span>{label}</span>
      {payload.map((item) => (
        <p key={item.name}>
          <i style={{ backgroundColor: item.color }} />
          {item.name}: <strong>{formatter && typeof item.value === 'number' ? formatter(item.value) : item.value}</strong>
        </p>
      ))}
    </div>
  );
}