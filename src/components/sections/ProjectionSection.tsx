import type { DashboardSnapshot, Scenario } from '../../types/models';
import { formatPercent, formatUsd } from '../../lib/format';
import { DashboardSection } from '../DashboardSection';
import { ScenarioChart } from '../ScenarioChart';

interface ProjectionSectionProps {
  snapshot: DashboardSnapshot;
  scenario: Scenario;
  horizon: 4 | 8 | 12;
  onScenarioChange: (scenario: Scenario) => void;
  onHorizonChange: (horizon: 4 | 8 | 12) => void;
}

export function ProjectionSection(props: ProjectionSectionProps) {
  const { snapshot, horizon } = props;
  const projectedNet = snapshot.projections.at(-1)?.net ?? 0;
  return (
    <DashboardSection
      id="section-03"
      label="Projections"
      takeaway={`${formatUsd(projectedNet, true)} net contribution by week ${horizon}.`}
    >
      <ScenarioChart {...props} data={snapshot.projections} />
      {/* REMOVED */}
      {/* <p className="so-what"><span>SO WHAT</span> Planning scenarios scale observed uptake and completion; the confidence band is illustrative, not a guarantee. Weighted house edge is {formatPercent(1 - snapshot.weightedRtp, 1)}.</p> */}
    </DashboardSection>
  );
}