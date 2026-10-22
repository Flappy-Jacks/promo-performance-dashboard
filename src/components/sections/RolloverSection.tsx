import type { DashboardSnapshot } from '../../types/models';
import { formatPercent, formatUsd } from '../../lib/format';
import { DashboardSection } from '../DashboardSection';
import { ChartPanel } from '../ChartPrimitives';
import { Histogram } from '../Histogram';
import { RolloverMix } from '../RolloverMix';

interface RolloverSectionProps {
  snapshot: DashboardSnapshot;
}

export function RolloverSection({ snapshot }: RolloverSectionProps) {
  return (
    <DashboardSection
      id="section-04"
      label="Rollover fulfilment behaviour"
      takeaway={`${formatPercent(snapshot.effectiveContributionRate)} of raw stakes count toward qualifying wagering.`}
    >
      <RolloverMix data={snapshot.categoryMix} volatility={snapshot.volatilityMix} contributionRate={snapshot.effectiveContributionRate} />
      <div className="rollover-bottom-grid">
        <Histogram data={snapshot.completionHistogram} averageCompletionHours={snapshot.averageCompletionHours} />
        <ChartPanel title="Top games by qualifying wager" detail="EFFECTIVE CONTRIBUTION · USD" className="top-games-panel">
          <div className="top-games-columns" aria-hidden="true"><span>#</span><span>GAME / CATEGORY</span><span>VOLATILITY</span><span>RATE</span><span>QUALIFYING WAGER</span></div>
          <div className="top-games-list">
            {snapshot.topGames.map((item, index) => (
              <div className="top-game-row" key={item.game.id}>
                <span className="game-rank">{String(index + 1).padStart(2, '0')}</span>
                <div className="game-name"><strong>{item.game.name}</strong><small>{item.game.provider} · {item.game.category.replace('_', ' ')}</small></div>
                <span className="game-volatility">{item.game.volatility}</span>
                <span className="game-rate">{formatPercent(item.game.rolloverContributionRate)}</span>
                <strong className="game-amount">{formatUsd(item.effectiveUsd, true)}</strong>
              </div>
            ))}
            {snapshot.topGames.length === 0 && <div className="empty-chart">No game wagering in this selection.</div>}
          </div>
        </ChartPanel>
      </div>
      {/* removed */}
      {/* <p className="so-what"><span>SO WHAT</span> Measure progress on rate-adjusted wagers, not total stake. Current qualifying wagering: {formatUsd(snapshot.remainingRolloverUsd, true)} remains.</p> */}
    </DashboardSection>
  );
}