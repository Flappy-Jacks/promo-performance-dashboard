import type { DashboardSnapshot } from '../../types/models';
import { formatNumber, formatPercent, formatUsd } from '../../lib/format';
import { DashboardSection } from '../DashboardSection';
import { ChartPanel } from '../ChartPrimitives';
import { WaterfallChart } from '../WaterfallChart';

interface FinanceSectionProps {
  snapshot: DashboardSnapshot;
}

export function FinanceSection({ snapshot }: FinanceSectionProps) {
  return (
    <DashboardSection
      id="section-02"
      label="Financial exposure & return"
      takeaway={`${formatUsd(snapshot.depositsDrivenUsd, true)} in deposits`}
      takeawayDetail="Net contribution reflects credited bonus and forfeitures."
    >
      <div className="financial-summary">
        <div><span>DEPOSITS DRIVEN</span><strong>{formatUsd(snapshot.depositsDrivenUsd, true)}</strong><small>{formatNumber(snapshot.activationCount)} qualifying first deposits</small></div>
        <div><span>BONUS CREDITED</span><strong>{formatUsd(snapshot.bonusCreditedUsd, true)}</strong><small>50% of qualifying deposit</small></div>
        <div><span>BONUS LIABILITY</span><strong>{formatUsd(snapshot.bonusLiabilityUsd, true)}</strong><small>Outstanding at current rollover</small></div>
        <div><span>REMAINING QUALIFYING WAGER</span><strong>{formatUsd(snapshot.remainingRolloverUsd, true)}</strong><small>Rate-adjusted play still required</small></div>
      </div>
      <div className="finance-grid">
        <ChartPanel title="Promotion contribution" detail="USD · GROSS CREDIT BASIS" className="waterfall-panel">
          <div className="waterfall-canvas"><WaterfallChart ggr={snapshot.bonusGgrUsd} bonusCost={snapshot.bonusCostUsd} forfeitedAvoided={snapshot.forfeitedCostAvoidedUsd} net={snapshot.netContributionUsd} /></div>
          <div className="financial-footnotes"><span>ROI <strong>{formatPercent(snapshot.roiPercent / 100, 1)}</strong></span><span>EXPECTED HOUSE TAKE ON REMAINING PLAY <strong>{formatUsd(snapshot.expectedHouseTakeUsd, true)}</strong></span></div>
        </ChartPanel>
        <ChartPanel title="Completed vs forfeited" detail="BONUS IMPACT" className="outcome-panel">
          <div className="outcome-block">
            <div className="outcome-count"><span>COMPLETED</span><strong>{formatNumber(snapshot.completedCount)}</strong><small>Recognized bonus cost</small></div>
            <div className="outcome-value">{formatUsd(snapshot.completedBonusCostUsd, true)}</div>
            <div className="outcome-track"><i style={{ width: `${snapshot.bonusCostUsd ? snapshot.completedBonusCostUsd / snapshot.bonusCostUsd * 100 : 0}%` }} /></div>
          </div>
          <div className="outcome-block forfeited-outcome">
            <div className="outcome-count"><span>FORFEITED</span><strong>{formatNumber(snapshot.forfeitedCount)}</strong><small>Bonus cost avoided</small></div>
            <div className="outcome-value">{formatUsd(snapshot.forfeitedCostAvoidedUsd, true)}</div>
            <div className="outcome-track"><i style={{ width: `${snapshot.bonusCostUsd ? snapshot.forfeitedCostAvoidedUsd / snapshot.bonusCostUsd * 100 : 0}%` }} /></div>
          </div>
          <div className="net-readout"><span>NET PROMOTION CONTRIBUTION</span><strong>{formatUsd(snapshot.netContributionUsd, true)}</strong></div>
        </ChartPanel>
      </div>
      {/* REMOVED */}
      {/* <p className="ggr-definition">BONUS-FUNDED GGR&nbsp; / &nbsp;Settled bonus-wager stakes less payouts. {formatUsd(snapshot.bonusGgrUsd, true)} equals {formatPercent(snapshot.bonusGgrUsd / Math.max(snapshot.depositsDrivenUsd, 1), 1)} of {formatUsd(snapshot.depositsDrivenUsd, true)} promotion deposits.</p> */}
      {/* <p className="so-what"><span>SO WHAT</span> Remaining wagering estimates expected house take as qualifying wager ÷ contribution rate × (1 − weighted RTP). Forfeitures reduce cost, not revenue.</p> */}
    </DashboardSection>
  );
}