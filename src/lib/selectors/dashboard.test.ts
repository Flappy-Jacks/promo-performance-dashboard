import { describe, expect, it } from 'vitest';
import { bets, exchangeRates, games, users, userPromotions } from '../../data/seed';
import { formatDate } from '../format';
import { selectDashboard } from './dashboard';

describe('promotion dashboard selectors', () => {
  const snapshot = selectDashboard({ country: 'All countries', dateRange: 'campaign' }, 'base', 12);

  it('preserves the illustrative cohort anchors and lifecycle totals', () => {
    expect(users).toHaveLength(12480);
    expect(userPromotions).toHaveLength(3370);
    expect(snapshot.eligibleCount).toBe(12480);
    expect(snapshot.activationCount).toBe(3370);
    expect(snapshot.activationRate).toBeCloseTo(3370 / 12480, 5);
    expect(snapshot.statuses.map(({ count }) => count)).toEqual([80, 1860, 1010, 420]);
    expect(snapshot.averageDepositUsd).toBeCloseTo(186, 0);
    expect(snapshot.activationTrend.reduce((total, point) => total + point.daily, 0)).toBe(3370);
    const offerWeek = snapshot.activationTrend.filter((point) => point.date >= '2026-09-01' && point.date <= '2026-09-07');
    const postWeek = snapshot.activationTrend.filter((point) => point.date > '2026-09-07');
    expect(Math.max(...offerWeek.map((point) => point.daily))).toBe(Math.max(...snapshot.activationTrend.map((point) => point.daily)));
    expect(postWeek[0].daily).toBeGreaterThan(postWeek.at(-1)!.daily);
  });

  it('derives report totals in USD and reconciles promotion contribution', () => {
    const expectedDeposits = userPromotions.reduce((total, enrollment) => {
      const user = users[Number(enrollment.userId.slice(-5)) - 1];
      return total + enrollment.depositAmount * exchangeRates[user.currency];
    }, 0);
    expect(snapshot.depositsDrivenUsd).toBeCloseTo(expectedDeposits, 2);
    expect(snapshot.bonusCreditedUsd).toBeCloseTo(snapshot.depositsDrivenUsd * 0.5, 2);
    expect(snapshot.bonusCostUsd).toBeCloseTo(snapshot.bonusCreditedUsd, 2);
    expect(snapshot.netContributionUsd).toBeCloseTo(
      snapshot.bonusGgrUsd - snapshot.bonusCostUsd + snapshot.forfeitedCostAvoidedUsd,
      2,
    );
    expect(Math.abs(snapshot.bonusGgrUsd)).toBeLessThan(snapshot.depositsDrivenUsd);
    expect(snapshot.expectedHouseTakeUsd).toBeGreaterThan(0);
  });

  it('counts only settled, contribution-weighted wagers toward rollover', () => {
    const gameById = new Map(games.map((game) => [game.id, game]));
    for (const enrollment of userPromotions.slice(0, 25)) {
      const qualifyingWager = bets
        .filter((bet) => bet.userId === enrollment.userId && (bet.result === 'win' || bet.result === 'loss'))
        .reduce((total, bet) => total + bet.amount * (gameById.get(bet.gameId)?.rolloverContributionRate ?? 0), 0);
      expect(enrollment.rolloverCompleted).toBeCloseTo(qualifyingWager, 4);
    }
    expect(snapshot.effectiveContributionRate).toBeGreaterThan(0);
    expect(snapshot.effectiveContributionRate).toBeLessThan(1);
  });

  it('keeps a 12-week projection and a bounded neutral-language review queue', () => {
    expect(snapshot.projections).toHaveLength(12);
    expect(snapshot.projections[0].week).toBe('W01');
    expect(snapshot.projections.at(-1)!.revenue).toBeGreaterThan(snapshot.projections[0].revenue);
    const optimistic = selectDashboard({ country: 'All countries', dateRange: 'campaign' }, 'optimistic', 12).projections.at(-1)!;
    const conservative = selectDashboard({ country: 'All countries', dateRange: 'campaign' }, 'conservative', 12).projections.at(-1)!;
    expect(optimistic.activations).toBeGreaterThan(conservative.activations);
    expect(optimistic.net).not.toBe(conservative.net);
    expect(snapshot.flaggedCount).toBeGreaterThanOrEqual(8);
    expect(snapshot.flaggedCount).toBeLessThanOrEqual(15);
    expect(snapshot.reviewQueue.every((account) => account.flags.length > 0 && account.score > 0)).toBe(true);
    expect(snapshot.reviewQueue.every((account) => account.score <= 100)).toBe(true);
    expect(new Set(snapshot.reviewQueue.map((account) => account.score)).size).toBeGreaterThan(1);
    expect(snapshot.reviewQueue.some((account) => account.flags.some((flag) => flag.key === 'shared-pattern'))).toBe(true);
  });

  it('filters the cohort by country without changing the reporting model', () => {
    const uk = selectDashboard({ country: 'United Kingdom', dateRange: 'campaign' }, 'base', 4);
    expect(uk.eligibleCount).toBeLessThan(snapshot.eligibleCount);
    expect(uk.activationCount).toBeLessThan(snapshot.activationCount);
    expect(uk.projections).toHaveLength(4);
    expect(uk.activationTrend.at(-1)?.cumulative).toBe(uk.activationCount);
  });

  it('filters activations, deposits, and rollovers by the selected date range', () => {
    const last30 = selectDashboard({ country: 'All countries', dateRange: '30d' }, 'base', 12);
    expect(last30.activationCount).toBeLessThan(snapshot.activationCount);
    expect(last30.depositsDrivenUsd).toBeLessThan(snapshot.depositsDrivenUsd);
    expect(last30.remainingRolloverUsd).toBeLessThan(snapshot.remainingRolloverUsd);
    expect(last30.activationTrend.at(-1)?.cumulative).toBe(last30.activationCount);
  });

  it('formats telemetry dates in the brand deck format', () => {
    expect(formatDate('2026-10-14T23:59:59.999Z')).toBe('14.10.26');
  });
});