import { useState } from 'react';
import type { DashboardSnapshot, ReviewAccount } from '../../types/models';
import { DashboardSection } from '../DashboardSection';
import { AccountDrawer } from '../AccountDrawer';
import { FibonacciMotif } from '../FibonacciMotif';
import { ReviewTable } from '../ReviewTable';

interface ReviewSectionProps {
  snapshot: DashboardSnapshot;
}

export function ReviewSection({ snapshot }: ReviewSectionProps) {
  const [selectedAccount, setSelectedAccount] = useState<ReviewAccount | null>(null);
  return (
    <>
      <DashboardSection
        id="section-05"
        label="Irregular winning patterns"
        takeaway={`${snapshot.flaggedCount} accounts are flagged for review`}
      >
        <div className="review-queue-heading"><FibonacciMotif className="review-motif" /><span>REVIEW QUEUE</span><span>{snapshot.flaggedCount} FLAGGED&nbsp; / &nbsp;HUMAN REVIEW</span></div>
        <ReviewTable accounts={snapshot.reviewQueue} onSelect={setSelectedAccount} />
        {/* REMOVED */}
        {/* <p className="so-what"><span>SO WHAT</span> Prioritize closer review using multiple independent signals; no single signal establishes misconduct.</p> */}
      </DashboardSection>
      <AccountDrawer account={selectedAccount} onClose={() => setSelectedAccount(null)} />
    </>
  );
}