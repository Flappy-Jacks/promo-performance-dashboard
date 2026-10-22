import { formatUsd } from '../lib/format';

interface WaterfallChartProps {
  ggr: number;
  bonusCost: number;
  forfeitedAvoided: number;
  net: number;
}

export function WaterfallChart({ ggr, bonusCost, forfeitedAvoided, net }: WaterfallChartProps) {
  const afterBonus = ggr - bonusCost;
  const points = [
    { label: ['Bonus-funded', 'GGR'], start: 0, end: ggr, value: ggr, fill: 'var(--fc-band)', stroke: 'var(--fc-paper)', opacity: 1 },
    { label: ['Gross bonus', 'cost'], start: ggr, end: afterBonus, value: -bonusCost, fill: 'var(--fc-tertiary)', stroke: 'var(--fc-tertiary)', opacity: 1 },
    { label: ['Forfeited cost', 'avoided'], start: afterBonus, end: net, value: forfeitedAvoided, fill: 'var(--fc-band)', stroke: 'var(--fc-paper)', opacity: 1 },
    { label: ['Net promotion', 'contribution'], start: 0, end: net, value: net, fill: 'var(--fc-paper)', stroke: 'var(--fc-paper)', opacity: 1 },
  ];
  const minimum = Math.min(0, ...points.map((point) => Math.min(point.start, point.end)));
  const maximum = Math.max(0, ...points.map((point) => Math.max(point.start, point.end)));
  const span = Math.max(1, maximum - minimum);
  const plot = { top: 17, height: 134, left: 34, width: 590 };
  const y = (value: number): number => plot.top + (maximum - value) / span * plot.height;
  const ticks = [maximum, maximum * 0.5 + minimum * 0.5, 0, minimum * 0.5, minimum]
    .filter((value, index, values) => values.findIndex((candidate) => Math.abs(candidate - value) < 0.5) === index);
  const barWidth = 48;
  const gap = 88;

  return (
    <svg className="waterfall-svg" viewBox="0 0 660 210" role="img" aria-label={`Waterfall: bonus-funded GGR ${formatUsd(ggr)}, less bonuses credited ${formatUsd(bonusCost)}, plus forfeited cost avoided ${formatUsd(forfeitedAvoided)}, equals net contribution ${formatUsd(net)}`}>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={plot.left} x2={plot.left + plot.width} y1={y(tick)} y2={y(tick)} stroke={tick === 0 ? 'var(--fc-line)' : 'var(--fc-grid)'} />
          <text className="waterfall-axis-label" x="27" y={y(tick) + 3} textAnchor="end" fill="var(--fc-muted)" fontSize="10">{formatUsd(tick, true)}</text>
        </g>
      ))}
      {points.map((point, index) => {
        const x = plot.left + 34 + index * (barWidth + gap);
        const yTop = Math.min(y(point.start), y(point.end));
        const height = Math.max(2, Math.abs(y(point.end) - y(point.start)));
        const labelY = point.value >= 0 ? yTop - 5 : yTop + height + 11;
        const connectorValue = point.end;
        return (
          <g key={point.label.join('-')}>
            {index > 0 && index < points.length - 1 && (
              <line x1={x - gap} x2={x} y1={y(points[index - 1].end)} y2={y(points[index - 1].end)} stroke="var(--fc-muted)" strokeDasharray="3 3" />
            )}
            {index === 1 && <line x1={plot.left + 34 + barWidth} x2={x} y1={y(points[0].end)} y2={y(points[0].end)} stroke="var(--fc-muted)" strokeDasharray="3 3" />}
            {index === 3 && <line x1={plot.left + 34 + 2 * (barWidth + gap) + barWidth} x2={x} y1={y(net)} y2={y(net)} stroke="var(--fc-muted)" strokeDasharray="3 3" />}
            <rect x={x} y={yTop} width={barWidth} height={height} fill={point.fill} stroke={point.stroke} strokeWidth="1" opacity={point.opacity}>
              <title>{`${point.label.join(' ')}: ${formatUsd(point.value)}`}</title>
            </rect>
            <text x={x + barWidth / 2} y={labelY} textAnchor="middle" fill="var(--fc-paper)" fontSize="10">{formatUsd(point.value, true)}</text>
            <text className="waterfall-axis-label" x={x + barWidth / 2} y="174" textAnchor="middle" fill="var(--fc-muted)" fontSize="10">
              <tspan x={x + barWidth / 2} dy="0">{point.label[0]}</tspan>
              <tspan x={x + barWidth / 2} dy="11">{point.label[1]}</tspan>
            </text>
            <title>{`Bridge step ${index + 1}; ends at ${formatUsd(connectorValue)}`}</title>
          </g>
        );
      })}
    </svg>
  );
}