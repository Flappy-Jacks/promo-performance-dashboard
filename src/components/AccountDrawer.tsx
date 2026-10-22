import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import { AS_OF_DATE } from '../data/seed';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ReviewAccount } from '../types/models';
import { formatDuration, formatPercent, formatUsd } from '../lib/format';
import { ChartTooltip } from './ChartPrimitives';

interface AccountDrawerProps {
  account: ReviewAccount | null;
  onClose: () => void;
}

export function AccountDrawer({ account, onClose }: AccountDrawerProps) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!account) return undefined;
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeButton.current?.click();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = dialog.current?.querySelectorAll<HTMLElement>('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      returnFocus.current?.focus();
    };
  }, [account?.user.id]);

  return (
    <AnimatePresence>
      {account && (
        <>
          <motion.button
            className="drawer-backdrop"
            type="button"
            aria-label="Close account detail"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="account-drawer"
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            initial={reducedMotion ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: reducedMotion ? 0 : 0.24, ease: 'easeOut' }}
          >
            <header className="drawer-topline">
              <div><span>[ ACCOUNT REVIEW ] <br></br>{account.user.country.toUpperCase()}</span><h2 id="drawer-title">fc•••{account.user.id.slice(-4)}</h2></div>
              <button ref={closeButton} type="button" className="icon-button" onClick={onClose} aria-label="Close account detail"><X size={17} /></button>
            </header>
            <div className="drawer-kpis">
              <div><span>ACCOUNT AGE</span><strong>{((Date.parse(AS_OF_DATE) - Date.parse(account.user.createdAt)) / 31557600000).toFixed(1)}y</strong></div>
              <div><span>DEPOSIT</span><strong>{formatUsd(account.depositUsd)}</strong></div>
              <div><span>ROLLOVER</span><strong>{account.rolloverPercent.toFixed(0)}%</strong></div>
            </div>
            <section className="drawer-section">
              <div className="drawer-section-heading"><h3>Bet timeline</h3><span>NET RESULT · USD</span></div>
              <div className="drawer-chart" role="img" aria-label="Cumulative net result across this account's bets">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={account.betTimeline} margin={{ top: 12, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid stroke="var(--fc-grid)" vertical={false} />
                    <XAxis dataKey="time" tick={false} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: 'var(--fc-muted)', fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(value: number) => formatUsd(value, true)} />
                    <Tooltip content={<ChartTooltip formatter={(value) => formatUsd(value)} />} />
                    <Line name="Cumulative net" dataKey="value" type="monotone" stroke="var(--fc-paper)" strokeWidth={1.5} dot={{ r: 2, fill: 'var(--fc-paper)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="timeline-key"><span><ArrowDownLeft size={12} /> Stake</span><span><ArrowUpRight size={12} /> Payout</span></div>
            </section>
            <section className="drawer-section">
              <div className="drawer-section-heading"><h3>Review signals</h3><span>COMPOSITE&nbsp; / &nbsp;{account.score}</span></div>
              <ul className="reason-list">
                {account.flags.map((flag) => <li key={flag.key}><AlertTriangle size={14} aria-hidden="true" /><div><strong>{flag.label}</strong><p>{flag.description}</p></div></li>)}
              </ul>
            </section>
            <section className="drawer-section drawer-financials">
              <div><span>BONUS CREDITED</span><strong>{formatUsd(account.bonusUsd)}</strong></div>
              <div><span>OBSERVED / EXPECTED RTP</span><strong>{formatPercent(account.observedRtp)} / {formatPercent(account.expectedRtp)}</strong></div>
              <div><span>TIME TO COMPLETE</span><strong>{account.rolloverPercent >= 100 ? formatDuration(account.completionHours) : '—'}</strong></div>
            </section>
            <p className="drawer-disclaimer">Signals are indicators for closer review, not a determination of wrongdoing.</p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}