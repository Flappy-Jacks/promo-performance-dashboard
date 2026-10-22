import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SectionHeader } from './SectionHeader';

interface DashboardSectionProps {
  id: string;
  label: string;
  takeaway: string;
  takeawayDetail?: string;
  children: ReactNode;
}

export function DashboardSection({ id, label, takeaway, takeawayDetail, children }: DashboardSectionProps) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.section
      className="dashboard-section"
      id={id}
      aria-labelledby={`${id}-title`}
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: reducedMotion ? 0 : 0.38, ease: 'easeOut' }}
    >
      <SectionHeader label={label} takeaway={takeaway} takeawayDetail={takeawayDetail} id={`${id}-title`} />
      {children}
    </motion.section>
  );
}