import { useEffect } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

interface KpiStatProps {
  label: string;
  value: number;
  format: (value: number) => string;
  detail: string;
  index: number;
  alert?: boolean;
}

function CountUp({ value, format }: Pick<KpiStatProps, 'value' | 'format'>) {
  const reducedMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 75, damping: 22 });
  const displayValue = useTransform(springValue, (current) => format(current));

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  if (reducedMotion) return <span>{format(value)}</span>;
  return <motion.span>{displayValue}</motion.span>;
}

export function KpiStat({ label, value, format, detail, index, alert = false }: KpiStatProps) {
  return (
    <motion.article
      className={`kpi-stat${alert ? ' kpi-alert' : ''}`}
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.045 }}
    >
      <div className="kpi-topline"><span className="kpi-label">{label}</span></div>
      <strong className="kpi-value"><CountUp value={value} format={format} /></strong>
      <span className="kpi-detail">{detail}</span>
    </motion.article>
  );
}