import { formatNumber, formatPercent } from '../lib/format';
import { ChartPanel } from './ChartPrimitives';

interface FunnelProps {
  eligible: number;
  activated: number;
  rate: number;
}

export function Funnel({ eligible, activated, rate }: FunnelProps) {
  return (
    <ChartPanel title="Eligible → activated" detail="ACCOUNT FUNNEL" className="funnel-panel">
      {eligible === 0 ? <div className="empty-chart">No eligible accounts in this country.</div> : (
        <div className="funnel-visual" role="group" aria-label={`${formatNumber(eligible)} eligible accounts led to ${formatNumber(activated)} activations`}>
          <div className="adoption-kpis">
            <div className="adoption-kpi">
              <span>Eligible accounts</span>
              <strong>{formatNumber(eligible)}</strong>
            </div>
            <div className="adoption-kpi">
              <span>Activated</span>
              <strong>{formatNumber(activated)}</strong>
              <small>{formatPercent(rate)} activation rate</small>
            </div>
          </div>
          <div className="funnel-foot">MANUAL CLAIM&nbsp; / &nbsp;PROMOTIONS</div>
        </div>
      )}
    </ChartPanel>
  );
}