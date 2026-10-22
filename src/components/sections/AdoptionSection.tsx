import type { DashboardSnapshot } from '../../types/models';
import { formatNumber, formatPercent } from '../../lib/format';
import { DashboardSection } from '../DashboardSection';
import { ChartPanel } from '../ChartPrimitives';
import { Funnel } from '../Funnel';
import { TrendChart } from '../TrendChart';

interface AdoptionSectionProps {
  snapshot: DashboardSnapshot;
}

const statusTone: Record<string, string> = {
  pending: 'status-pending',
  active: 'status-active',
  completed: 'status-completed',
  forfeited: 'status-forfeited',
};

export function AdoptionSection({ snapshot }: AdoptionSectionProps) {
  return (
    <DashboardSection
      id="section-01"
      label="Popularity & adoption"
      takeaway={`${formatPercent(snapshot.activationRate)} of eligible accounts claimed the offer.`}
    >
      <div className="adoption-grid">
        <div className="adoption-overview">
          <Funnel eligible={snapshot.eligibleCount} activated={snapshot.activationCount} rate={snapshot.activationRate} />
          <ChartPanel title="Promotion status" detail={`${formatNumber(snapshot.activationCount)} CLAIMS`} className="status-panel">
            {snapshot.activationCount === 0 ? <div className="empty-chart">No activations in this selection.</div> : (
              <>
                <div className="status-stack" role="img" aria-label={snapshot.statuses.map((item) => `${item.status}: ${item.count}`).join(', ')}>
                  {snapshot.statuses.map((item) => <span key={item.status} className={statusTone[item.status]} style={{ width: `${item.share * 100}%` }} />)}
                </div>
                <ul className="status-list">
                  {snapshot.statuses.map((item) => (
                    <li key={item.status}>
                      <span className={`status-dot ${statusTone[item.status]}`} />
                      <span>{item.status}</span>
                      <strong>{formatNumber(item.count)}</strong>
                      <small>{formatPercent(item.share)}</small>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </ChartPanel>
        </div>
        <TrendChart data={snapshot.activationTrend} />
      </div>
      {/* REMOVED */}
      {/* <p className="so-what"><span>SO WHAT</span> Monitor claim volume after the designated deposit week; the offer requires a manual Promotions-tab activation.</p> */}
    </DashboardSection>
  );
}