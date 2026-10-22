import {
  AS_OF_DATE,
  bets,
  exchangeRates,
  games,
  promotion,
  transactions,
  users,
  userPromotions,
} from '../../data/seed';
import type {
  Bet,
  DashboardFilters,
  DashboardSnapshot,
  GameCategory,
  ProjectionPoint,
  PromotionStatus,
  ReviewAccount,
  ReviewFlag,
  Scenario,
  User,
  UserPromotion,
  Volatility,
} from '../../types/models';

const userById = new Map(users.map((user) => [user.id, user]));
const gameById = new Map(games.map((game) => [game.id, game]));
const statusOrder: PromotionStatus[] = ['pending', 'active', 'completed', 'forfeited'];
const categoryOrder: GameCategory[] = ['slots', 'live_casino', 'sportsbook', 'table'];
const volatilityOrder: Volatility[] = ['low', 'medium', 'high'];
const currency = (amount: number, code: User['currency']): number => amount * exchangeRates[code];
const asOf = new Date(AS_OF_DATE);

function rangeStart(range: DashboardFilters['dateRange']): Date {
  if (range === '30d') return new Date(asOf.getTime() - 30 * 86400000);
  if (range === '90d') return new Date(asOf.getTime() - 90 * 86400000);
  return new Date('2026-08-25T00:00:00.000Z');
}

function betsByUser(records: Bet[]): Map<string, Bet[]> {
  const grouped = new Map<string, Bet[]>();
  for (const bet of records) grouped.set(bet.userId, [...(grouped.get(bet.userId) ?? []), bet]);
  return grouped;
}

function assessedReviewQueue(
  enrollments: UserPromotion[],
  accountBets: Map<string, Bet[]>,
  accountTransactions: Map<string, typeof transactions>,
): ReviewAccount[] {
  const signatureCount = new Map<string, number>();
  const signatures = new Map<string, string>();

  for (const enrollment of enrollments) {
    const user = userById.get(enrollment.userId);
    const userBets = (accountBets.get(enrollment.userId) ?? []).slice().sort((a, b) => a.placedAt.localeCompare(b.placedAt));
    if (!user || userBets.length < 3) continue;
    const signature = `${user.country}:${enrollment.activatedAt.slice(0, 10)}:${userBets.slice(0, 3).map((bet) => bet.gameId).join('|')}`;
    signatures.set(user.id, signature);
    signatureCount.set(signature, (signatureCount.get(signature) ?? 0) + 1);
  }

  const candidates: ReviewAccount[] = [];
  const maxReviewScore = 146;
  for (const enrollment of enrollments) {
    const user = userById.get(enrollment.userId);
    const userBets = accountBets.get(enrollment.userId) ?? [];
    if (!user || userBets.length === 0) continue;
    const settled = userBets.filter((bet) => bet.result === 'win' || bet.result === 'loss');
    const bonusBets = settled.filter((bet) => bet.isBonusWager);
    const cashBets = settled.filter((bet) => !bet.isBonusWager);
    const rawStake = settled.reduce((total, bet) => total + bet.amount, 0);
    const payout = settled.reduce((total, bet) => total + bet.payout, 0);
    const expectedReturn = settled.reduce((total, bet) => {
      const game = gameById.get(bet.gameId);
      return total + bet.amount * (game?.rtp ?? 0);
    }, 0);
    const expectedRtp = rawStake > 0 ? expectedReturn / rawStake : 0;
    const observedRtp = rawStake > 0 ? payout / rawStake : 0;
    const winRate = settled.length ? settled.filter((bet) => bet.result === 'win').length / settled.length : 0;
    const bonusWinRate = bonusBets.length ? bonusBets.filter((bet) => bet.result === 'win').length / bonusBets.length : 0;
    const cashWinRate = cashBets.length ? cashBets.filter((bet) => bet.result === 'win').length / cashBets.length : 0;
    const completionHours = enrollment.completedAt
      ? (new Date(enrollment.completedAt).getTime() - new Date(enrollment.activatedAt).getTime()) / 3600000
      : Number.POSITIVE_INFINITY;
    const lowVolatilityHighContribution = settled.reduce((total, bet) => {
      const game = gameById.get(bet.gameId);
      return total + (game?.volatility === 'low' && game.rolloverContributionRate >= 0.8 ? bet.amount : 0);
    }, 0);
    const lowVolatilityShare = rawStake > 0 ? lowVolatilityHighContribution / rawStake : 0;
    const withdrewAfterCompletion = Boolean(enrollment.completedAt)
      && (accountTransactions.get(user.id) ?? []).some((transaction) =>
        transaction.type === 'withdrawal'
        && transaction.status === 'completed'
        && new Date(transaction.createdAt).getTime() > new Date(enrollment.completedAt!).getTime());
    const signature = signatures.get(user.id);
    const sharedPattern = Boolean(signature && (signatureCount.get(signature) ?? 0) > 1);
    const rolloverPercent = enrollment.rolloverRequirement > 0
      ? enrollment.rolloverCompleted / enrollment.rolloverRequirement * 100
      : 0;
    const flags: ReviewFlag[] = [];
    let score = 0;

    if (observedRtp > expectedRtp * 1.3 && observedRtp > 1.05) {
      flags.push({ key: 'rtp', label: 'RTP variance', description: `Observed return ${(observedRtp * 100).toFixed(0)}% is above the weighted game expectation of ${(expectedRtp * 100).toFixed(0)}%.` });
      score += 30;
    }
    if (bonusBets.length >= 2 && cashBets.length >= 2 && Math.abs(bonusWinRate - cashWinRate) >= 0.3) {
      flags.push({ key: 'win-gap', label: 'Win-rate gap', description: `Bonus-wager and cash-wager win rates differ by ${Math.round(Math.abs(bonusWinRate - cashWinRate) * 100)} percentage points.` });
      score += 26;
    }
    if (enrollment.status === 'completed' && completionHours <= 2) {
      flags.push({ key: 'fast', label: 'Fast clear', description: `Rollover was completed in ${completionHours.toFixed(1)} hours.` });
      score += 25;
    }
    if (lowVolatilityShare >= 0.8 && rolloverPercent >= 80) {
      flags.push({ key: 'game-mix', label: 'Game mix', description: `${Math.round(lowVolatilityShare * 100)}% of settled stakes were in low-volatility, full-contribution games.` });
      score += 20;
    }
    if (withdrewAfterCompletion) {
      flags.push({ key: 'withdrawal', label: 'Withdrawal', description: 'A completed withdrawal followed rollover completion.' });
      score += 25;
    }
    if (sharedPattern) {
      flags.push({ key: 'shared-pattern', label: 'Shared pattern', description: 'This account shares a country, activation date, and opening game sequence with another account.' });
      score += 20;
    }
    if (score < 45 || flags.length === 0) continue;

    const userTransactions = accountTransactions.get(user.id) ?? [];
    const depositUsd = userTransactions.filter((transaction) => transaction.type === 'deposit' && transaction.status === 'completed')
      .reduce((total, transaction) => total + currency(transaction.amount, transaction.currency), 0);
    const bonusUsd = currency(enrollment.bonusAmount, user.currency);
    let runningNet = 0;
    const betTimeline = userBets.slice().sort((a, b) => a.placedAt.localeCompare(b.placedAt)).map((bet) => {
      runningNet += currency(bet.payout - bet.amount, user.currency);
      return { time: bet.placedAt, value: runningNet };
    });

    candidates.push({
      user,
      enrollment,
      depositUsd,
      bonusUsd,
      rolloverPercent,
      winRate,
      bonusWinRate,
      cashWinRate,
      observedRtp,
      expectedRtp,
      completionHours: Number.isFinite(completionHours) ? completionHours : 0,
      flags,
      score: Math.round(Math.min(score / maxReviewScore, 1) * 100),
      betTimeline,
    });
  }

  return candidates.sort((a, b) => b.score - a.score).slice(0, 12);
}

function buildProjections(
  scenario: Scenario,
  horizon: 4 | 8 | 12,
  averageDepositUsd: number,
  weightedRtp: number,
  completionRate: number,
  dailyActivationAverage: number,
): ProjectionPoint[] {
  const scenarioScale: Record<Scenario, number> = { conservative: 0.78, base: 1, optimistic: 1.22 };
  const scenarioCompletion: Record<Scenario, number> = { conservative: 0.78, base: 1, optimistic: 1.16 };
  const houseEdge = Math.max(0.005, 1 - weightedRtp);
  const points: ProjectionPoint[] = [];
  let cumulativeNet = 0;
  let cumulativeRevenue = 0;
  let cumulativeCost = 0;

  for (let week = 1; week <= horizon; week += 1) {
    const activations = Math.round(dailyActivationAverage * 7 * scenarioScale[scenario] * Math.pow(0.96, week - 1));
    const completion = Math.min(0.95, completionRate * scenarioCompletion[scenario]);
    const weeklyRevenue = activations * averageDepositUsd * promotion.rolloverMultiplier * promotion.bonusPercentage * houseEdge * completion;
    const weeklyCost = activations * averageDepositUsd * promotion.bonusPercentage * completion;
    cumulativeRevenue += weeklyRevenue;
    cumulativeCost += weeklyCost;
    cumulativeNet += weeklyRevenue - weeklyCost;
    const confidence = Math.max(Math.abs(cumulativeNet) * 0.16, activations * averageDepositUsd * 0.025);
    points.push({
      week: `W${String(week).padStart(2, '0')}`,
      activations,
      revenue: Math.round(cumulativeRevenue),
      cost: Math.round(cumulativeCost),
      net: Math.round(cumulativeNet),
      netLow: Math.round(cumulativeNet - confidence),
      netBand: Math.round(confidence * 2),
    });
  }
  return points;
}

export function selectDashboard(
  filters: DashboardFilters,
  scenario: Scenario,
  horizon: 4 | 8 | 12,
): DashboardSnapshot {
  const eligible = users.filter((user) =>
    (filters.country === 'All countries' || user.country === filters.country)
    && (asOf.getTime() - new Date(user.createdAt).getTime()) / 86400000 >= promotion.eligibleFromDays);
  const start = rangeStart(filters.dateRange);
  const filteredEnrollments = userPromotions.filter((enrollment) => {
    const user = userById.get(enrollment.userId);
    return Boolean(user)
      && (filters.country === 'All countries' || user?.country === filters.country)
      && new Date(enrollment.activatedAt).getTime() >= start.getTime()
      && new Date(enrollment.activatedAt).getTime() <= asOf.getTime();
  });
  const enrollmentIds = new Set(filteredEnrollments.map((enrollment) => enrollment.userId));
  const selectedTransactions = transactions.filter((transaction) => enrollmentIds.has(transaction.userId));
  const selectedBets = bets.filter((bet) => enrollmentIds.has(bet.userId));
  const accountBets = betsByUser(selectedBets);
  const transactionMap = new Map<string, typeof transactions>();
  for (const transaction of selectedTransactions) {
    transactionMap.set(transaction.userId, [...(transactionMap.get(transaction.userId) ?? []), transaction]);
  }

  const depositTransactions = selectedTransactions.filter((transaction) => transaction.type === 'deposit' && transaction.status === 'completed');
  const bonusTransactions = selectedTransactions.filter((transaction) => transaction.type === 'bonus_credit' && transaction.status === 'completed');
  const depositsDrivenUsd = depositTransactions.reduce((total, transaction) => total + currency(transaction.amount, transaction.currency), 0);
  const bonusCreditedUsd = bonusTransactions.reduce((total, transaction) => total + currency(transaction.amount, transaction.currency), 0);
  const averageDepositUsd = depositTransactions.length ? depositsDrivenUsd / depositTransactions.length : 0;
  let bonusLiabilityUsd = 0;
  let remainingRolloverUsd = 0;
  const bonusCostUsd = bonusCreditedUsd;
  let completedBonusCostUsd = 0;
  let forfeitedCostAvoidedUsd = 0;
  let completedCount = 0;
  let forfeitedCount = 0;
  let completionHoursTotal = 0;

  for (const enrollment of filteredEnrollments) {
    const user = userById.get(enrollment.userId)!;
    const rate = enrollment.rolloverRequirement > 0
      ? Math.min(1, enrollment.rolloverCompleted / enrollment.rolloverRequirement)
      : 0;
    const bonusUsd = currency(enrollment.bonusAmount, user.currency);
    const remainingUsd = currency(Math.max(0, enrollment.rolloverRequirement - enrollment.rolloverCompleted), user.currency);
    if (enrollment.status === 'pending' || enrollment.status === 'active') {
      bonusLiabilityUsd += bonusUsd * (1 - rate);
      remainingRolloverUsd += remainingUsd;
    } else if (enrollment.status === 'completed') {
      completedCount += 1;
      completedBonusCostUsd += bonusUsd;
      if (enrollment.completedAt) {
        completionHoursTotal += (new Date(enrollment.completedAt).getTime() - new Date(enrollment.activatedAt).getTime()) / 3600000;
      }
    } else {
      forfeitedCount += 1;
      forfeitedCostAvoidedUsd += bonusUsd;
    }
  }

  const settledBonusBets = selectedBets.filter((bet) => bet.isBonusWager && (bet.result === 'win' || bet.result === 'loss'));
  const bonusGgrUsd = settledBonusBets.reduce((total, bet) => {
    const user = userById.get(bet.userId)!;
    return total + currency(bet.amount - bet.payout, user.currency);
  }, 0);
  let rawWagerUsd = 0;
  let effectiveWagerUsd = 0;
  let weightedRtpTotal = 0;
  const categoryTotals = new Map<GameCategory, { raw: number; effective: number }>();
  const volatilityTotals = new Map<Volatility, number>();
  const gameTotals = new Map<string, { raw: number; effective: number }>();

  for (const bet of selectedBets) {
    if (bet.result !== 'win' && bet.result !== 'loss') continue;
    const user = userById.get(bet.userId)!;
    const game = gameById.get(bet.gameId)!;
    const rawUsd = currency(bet.amount, user.currency);
    const effectiveUsd = game.contributesToRollover ? rawUsd * game.rolloverContributionRate : 0;
    rawWagerUsd += rawUsd;
    effectiveWagerUsd += effectiveUsd;
    weightedRtpTotal += game.rtp * rawUsd;
    categoryTotals.set(game.category, {
      raw: (categoryTotals.get(game.category)?.raw ?? 0) + rawUsd,
      effective: (categoryTotals.get(game.category)?.effective ?? 0) + effectiveUsd,
    });
    volatilityTotals.set(game.volatility, (volatilityTotals.get(game.volatility) ?? 0) + rawUsd);
    gameTotals.set(game.id, {
      raw: (gameTotals.get(game.id)?.raw ?? 0) + rawUsd,
      effective: (gameTotals.get(game.id)?.effective ?? 0) + effectiveUsd,
    });
  }

  let expectedHouseTakeUsd = 0;
  for (const enrollment of filteredEnrollments) {
    if (enrollment.status !== 'active' && enrollment.status !== 'pending') continue;
    const user = userById.get(enrollment.userId)!;
    const userBets = accountBets.get(enrollment.userId) ?? [];
    const contributing = userBets.filter((bet) => bet.result === 'win' || bet.result === 'loss');
    const raw = contributing.reduce((total, bet) => total + bet.amount, 0);
    const qualifying = contributing.reduce((total, bet) => {
      const game = gameById.get(bet.gameId)!;
      return total + (game.contributesToRollover ? bet.amount * game.rolloverContributionRate : 0);
    }, 0);
    const rate = raw > 0 ? qualifying / raw : 1;
    const rtp = raw > 0
      ? contributing.reduce((total, bet) => total + bet.amount * gameById.get(bet.gameId)!.rtp, 0) / raw
      : 0.95;
    const remaining = Math.max(0, enrollment.rolloverRequirement - enrollment.rolloverCompleted);
    expectedHouseTakeUsd += currency(remaining / Math.max(rate, 0.01) * (1 - rtp), user.currency);
  }

  const dailyMap = new Map<string, number>();
  for (const enrollment of filteredEnrollments) {
    const day = enrollment.activatedAt.slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
  }
  const trendStart = filters.dateRange === 'campaign' ? new Date(promotion.startDate) : start;
  const activationTrend: DashboardSnapshot['activationTrend'] = [];
  let cumulative = 0;
  for (const day = new Date(trendStart); day <= asOf; day.setUTCDate(day.getUTCDate() + 1)) {
    const date = day.toISOString().slice(0, 10);
    const daily = dailyMap.get(date) ?? 0;
    cumulative += daily;
    activationTrend.push({
      date,
      label: new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(day),
      daily,
      cumulative,
    });
  }

  const statuses = statusOrder.map((status) => {
    const count = filteredEnrollments.filter((enrollment) => enrollment.status === status).length;
    return { status, count, share: filteredEnrollments.length ? count / filteredEnrollments.length : 0 };
  });
  const categoryMix = categoryOrder.map((category) => {
    const totals = categoryTotals.get(category) ?? { raw: 0, effective: 0 };
    return { category, rawUsd: totals.raw, effectiveUsd: totals.effective, rate: totals.raw ? totals.effective / totals.raw : 0 };
  });
  const volatilityMix = volatilityOrder.map((volatility) => {
    const amountUsd = volatilityTotals.get(volatility) ?? 0;
    return { volatility, amountUsd, share: rawWagerUsd ? amountUsd / rawWagerUsd : 0 };
  });
  const histogramRanges = [
    { label: '0-20%', min: 0, max: 0.2 },
    { label: '20-40%', min: 0.2, max: 0.4 },
    { label: '40-60%', min: 0.4, max: 0.6 },
    { label: '60-80%', min: 0.6, max: 0.8 },
    { label: '80-100%', min: 0.8, max: 1 },
    { label: '100%+', min: 1, max: Number.POSITIVE_INFINITY },
  ];
  const completionHistogram = histogramRanges.map(({ label, min, max }) => ({
    range: label,
    count: filteredEnrollments.filter((enrollment) => {
      const ratio = enrollment.rolloverRequirement ? enrollment.rolloverCompleted / enrollment.rolloverRequirement : 0;
      return ratio >= min && ratio < max;
    }).length,
  }));
  const topGames = games.map((game) => {
    const totals = gameTotals.get(game.id) ?? { raw: 0, effective: 0 };
    return { game, effectiveUsd: totals.effective, rawUsd: totals.raw };
  }).sort((a, b) => b.effectiveUsd - a.effectiveUsd).slice(0, 5);
  const reviewQueue = assessedReviewQueue(filteredEnrollments, accountBets, transactionMap);
  const completionRate = filteredEnrollments.length ? completedCount / filteredEnrollments.length : 0;
  const weightedRtp = rawWagerUsd ? weightedRtpTotal / rawWagerUsd : 0.95;
  const dailyActivationAverage = activationTrend.length
    ? activationTrend.reduce((total, point) => total + point.daily, 0) / activationTrend.length
    : 0;
  const netContributionUsd = bonusGgrUsd - bonusCostUsd + forfeitedCostAvoidedUsd;

  return {
    eligibleCount: eligible.length,
    activationCount: filteredEnrollments.length,
    activationRate: eligible.length ? filteredEnrollments.length / eligible.length : 0,
    averageDepositUsd,
    depositsDrivenUsd,
    bonusCreditedUsd,
    bonusLiabilityUsd,
    remainingRolloverUsd,
    expectedHouseTakeUsd,
    bonusGgrUsd,
    bonusCostUsd,
    completedBonusCostUsd,
    forfeitedCostAvoidedUsd,
    netContributionUsd,
    roiPercent: bonusCostUsd > forfeitedCostAvoidedUsd
      ? netContributionUsd / (bonusCostUsd - forfeitedCostAvoidedUsd) * 100
      : 0,
    completedCount,
    forfeitedCount,
    flaggedCount: reviewQueue.length,
    activationTrend,
    statuses,
    categoryMix,
    volatilityMix,
    completionHistogram,
    topGames,
    averageCompletionHours: completedCount ? completionHoursTotal / completedCount : 0,
    weightedRtp,
    effectiveContributionRate: rawWagerUsd ? effectiveWagerUsd / rawWagerUsd : 0,
    completionRate,
    reviewQueue,
    projections: buildProjections(scenario, horizon, averageDepositUsd, weightedRtp, completionRate, dailyActivationAverage),
    countryOptions: ['All countries', ...Array.from(new Set(users.map((user) => user.country))).sort()],
  };
}