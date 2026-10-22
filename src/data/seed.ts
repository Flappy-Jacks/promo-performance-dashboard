import type { Bet, Currency, Game, Promotion, Transaction, User, UserPromotion } from '../types/models';

export const AS_OF_DATE = '2026-10-14T23:59:59.999Z';

export const exchangeRates: Record<Currency, number> = {
  USD: 1,
  GBP: 1.28,
  EUR: 1.08,
  CAD: 0.74,
  AUD: 0.66,
};

export const promotion: Promotion = {
  id: 'promo-veteran-50',
  name: 'Long-standing user deposit top-up',
  description: '50% bonus on the first deposit during the offer week; 20x rollover on bonus only.',
  bonusPercentage: 0.5,
  rolloverMultiplier: 20,
  eligibleFromDays: 365,
  startDate: '2026-09-01T00:00:00.000Z',
  endDate: '2026-09-07T23:59:59.999Z',
  isActive: false,
};

const countries: Array<{ name: string; currency: Currency }> = [
  { name: 'United Kingdom', currency: 'GBP' },
  { name: 'Canada', currency: 'CAD' },
  { name: 'Germany', currency: 'EUR' },
  { name: 'Australia', currency: 'AUD' },
  { name: 'Ireland', currency: 'EUR' },
  { name: 'United States', currency: 'USD' },
];

export const games: Game[] = [
  { id: 'game-slot-quiet', name: 'Quiet Reels', category: 'slots', provider: 'Northstar', rtp: 0.968, volatility: 'low', isActive: true, contributesToRollover: true, rolloverContributionRate: 1 },
  { id: 'game-slot-orbit', name: 'Orbit 9', category: 'slots', provider: 'Northstar', rtp: 0.956, volatility: 'medium', isActive: true, contributesToRollover: true, rolloverContributionRate: 1 },
  { id: 'game-slot-ember', name: 'Ember Vault', category: 'slots', provider: 'Redline', rtp: 0.941, volatility: 'high', isActive: true, contributesToRollover: true, rolloverContributionRate: 1 },
  { id: 'game-live-baccarat', name: 'Baccarat Room', category: 'live_casino', provider: 'Tableworks', rtp: 0.985, volatility: 'low', isActive: true, contributesToRollover: true, rolloverContributionRate: 0.2 },
  { id: 'game-live-wheel', name: 'Live Wheel', category: 'live_casino', provider: 'Tableworks', rtp: 0.973, volatility: 'medium', isActive: true, contributesToRollover: true, rolloverContributionRate: 0.2 },
  { id: 'game-sport-football', name: 'Football Markets', category: 'sportsbook', provider: 'Flycatcher Sports', rtp: 0.935, volatility: 'high', isActive: true, contributesToRollover: true, rolloverContributionRate: 0.1 },
  { id: 'game-sport-tennis', name: 'Tennis Markets', category: 'sportsbook', provider: 'Flycatcher Sports', rtp: 0.942, volatility: 'medium', isActive: true, contributesToRollover: true, rolloverContributionRate: 0.1 },
  { id: 'game-table-blackjack', name: 'Blackjack Basic', category: 'table', provider: 'Tableworks', rtp: 0.991, volatility: 'low', isActive: true, contributesToRollover: true, rolloverContributionRate: 0.1 },
  { id: 'game-table-poker', name: 'Three Card Table', category: 'table', provider: 'Tableworks', rtp: 0.964, volatility: 'medium', isActive: true, contributesToRollover: true, rolloverContributionRate: 0.1 },
];

const reviewPatterns: string[][] = [
  ['rtp', 'withdrawal'],
  ['rtp', 'fast'],
  ['gap', 'withdrawal'],
  ['gap', 'fast'],
  ['low-volatility', 'fast', 'gap'],
  ['low-volatility', 'withdrawal', 'rtp'],
  ['rtp', 'withdrawal'],
  ['gap', 'withdrawal'],
  ['gap', 'fast'],
  ['low-volatility', 'withdrawal'],
  ['shared-pattern', 'fast'],
  ['shared-pattern', 'withdrawal', 'low-volatility'],
];

const firstReviewIndex = 1940;
const sharedPatternIndexes = new Set([firstReviewIndex + 10, firstReviewIndex + 11]);
const activationWeights = [
  12, 14, 16, 15, 13, 11, 9,
  ...Array.from({ length: 37 }, (_, day) => Math.max(0.45, 7 * Math.exp(-day / 8))),
];

function buildActivationSchedule(total: number, weights: number[]): number[] {
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const allocations = weights.map((weight, day) => ({
    day,
    count: Math.floor(total * weight / weightTotal),
    remainder: total * weight / weightTotal % 1,
  }));
  let unassigned = total - allocations.reduce((sum, allocation) => sum + allocation.count, 0);
  const byRemainder = [...allocations].sort((a, b) => b.remainder - a.remainder);
  for (let index = 0; index < unassigned; index += 1) byRemainder[index].count += 1;
  return allocations.flatMap(({ day, count }) => Array.from({ length: count }, () => day));
}

const activationSchedule = buildActivationSchedule(3370, activationWeights);

function unit(seed: number): number {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

function isoAt(dayOffset: number, hourOffset: number, base = '2026-08-25T00:00:00.000Z'): string {
  const date = new Date(base);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  date.setUTCHours(hourOffset, (dayOffset * 13) % 60, 0, 0);
  return date.toISOString();
}

function userCountry(index: number): { name: string; currency: Currency } {
  if (sharedPatternIndexes.has(index)) return countries[1];
  return countries[index % countries.length];
}

export const users: User[] = Array.from({ length: 12480 }, (_, index) => {
  const country = userCountry(index);
  const ageDays = 390 + Math.floor(unit(index + 31) * 2300);
  const createdAt = new Date(AS_OF_DATE);
  createdAt.setUTCDate(createdAt.getUTCDate() - ageDays);
  const lastLogin = new Date(AS_OF_DATE);
  lastLogin.setUTCDate(lastLogin.getUTCDate() - Math.floor(unit(index + 87) * 60));

  return {
    id: `user-${String(index + 1).padStart(5, '0')}`,
    email: `player${String(index + 1).padStart(5, '0')}@example.test`,
    username: `player_${String(index + 1).padStart(5, '0')}`,
    country: country.name,
    currency: country.currency,
    createdAt: createdAt.toISOString(),
    lastLogin: lastLogin.toISOString(),
    isActive: true,
    kycVerified: index % 17 !== 0,
  };
});

function statusFor(index: number): UserPromotion['status'] {
  if (index < 80) return 'pending';
  if (index < 1940) return 'active';
  if (index < 2950) return 'completed';
  return 'forfeited';
}

function patternsFor(index: number): string[] {
  const offset = index - firstReviewIndex;
  return reviewPatterns[offset] ?? [];
}

function gameForBet(userIndex: number, betIndex: number, patterns: string[]): Game {
  if (patterns.includes('low-volatility')) return games[0];
  if (patterns.includes('shared-pattern')) {
    return [games[0], games[3], games[0], games[5], games[0], games[3], games[0], games[5]][betIndex];
  }
  const sequence = [games[0], games[1], games[3], games[5], games[0], games[7], games[4], games[2]];
  return sequence[(betIndex + userIndex) % sequence.length];
}

function targetCompletionRatio(index: number, status: UserPromotion['status']): number {
  if (status === 'pending') return 0.03 + unit(index + 203) * 0.12;
  if (status === 'active') return 0.18 + unit(index + 307) * 0.77;
  if (status === 'completed') return 1 + unit(index + 409) * 0.2;
  return 0.08 + unit(index + 503) * 0.62;
}

const enrollments: UserPromotion[] = [];
const transactions: Transaction[] = [];
const bets: Bet[] = [];

for (let index = 0; index < 3370; index += 1) {
  const user = users[index];
  const status = statusFor(index);
  const patterns = patternsFor(index);
  const depositUsd = 186 + ((index % 9) - 4) * 10;
  const depositAmount = depositUsd / exchangeRates[user.currency];
  const bonusAmount = depositAmount * promotion.bonusPercentage;
  const rolloverRequirement = bonusAmount * promotion.rolloverMultiplier;
  const activationDay = sharedPatternIndexes.has(index) ? 3 : activationSchedule[index];
  const activatedAt = sharedPatternIndexes.has(index)
    ? '2026-09-04T11:00:00.000Z'
    : isoAt(activationDay, 8 + (index % 10), promotion.startDate);
  const completionHours = patterns.includes('fast') ? 0.65 : 24 + unit(index + 611) * 480;
  const completedAt = status === 'completed'
    ? new Date(new Date(activatedAt).getTime() + completionHours * 3600000).toISOString()
    : undefined;
  const targetQualifiedWagering = rolloverRequirement * targetCompletionRatio(index, status);
  const enrollment: UserPromotion = {
    id: `enrollment-${String(index + 1).padStart(5, '0')}`,
    userId: user.id,
    promotionId: promotion.id,
    activatedAt,
    depositAmount,
    bonusAmount,
    rolloverRequirement,
    rolloverCompleted: 0,
    status,
    ...(completedAt ? { completedAt } : {}),
  };
  enrollments.push(enrollment);

  const depositAt = isoAt(index % 7, 10 + (index % 9), '2026-09-01T00:00:00.000Z');
  transactions.push({
    id: `txn-deposit-${index + 1}`,
    userId: user.id,
    type: 'deposit',
    amount: depositAmount,
    currency: user.currency,
    status: 'completed',
    promotionId: promotion.id,
    createdAt: depositAt,
    paymentMethod: index % 3 === 0 ? 'card' : index % 3 === 1 ? 'bank transfer' : 'wallet',
  });
  transactions.push({
    id: `txn-bonus-${index + 1}`,
    userId: user.id,
    type: 'bonus_credit',
    amount: bonusAmount,
    currency: user.currency,
    status: 'completed',
    promotionId: promotion.id,
    createdAt: activatedAt,
    paymentMethod: 'promotion',
  });

  let effectiveTotal = 0;
  for (let betIndex = 0; betIndex < 8; betIndex += 1) {
    const game = gameForBet(index, betIndex, patterns);
    const effectiveStake = targetQualifiedWagering / 8;
    const stake = effectiveStake / game.rolloverContributionRate;
    const bonusWager = patterns.includes('gap') ? betIndex < 4 : betIndex < 6;
    const forceWin = patterns.includes('rtp') || (patterns.includes('gap') && betIndex < 4);
    const won = forceWin || unit(index * 43 + betIndex * 71) < 0.46;
    const voided = !forceWin && unit(index * 17 + betIndex * 29) < 0.025;
    const result = voided ? 'void' : won ? 'win' : 'loss';
    const payout = won
      ? stake * (forceWin && patterns.includes('rtp') ? 2.9 : game.rtp / 0.46)
      : 0;
    const elapsedHours = status === 'completed' ? completionHours : Math.min(completionHours, 48);
    const placedAt = new Date(new Date(activatedAt).getTime() + (elapsedHours * (betIndex + 1) / 8) * 3600000).toISOString();
    const settledAt = new Date(new Date(placedAt).getTime() + 60000).toISOString();
    bets.push({
      id: `bet-${index + 1}-${betIndex + 1}`,
      userId: user.id,
      gameId: game.id,
      amount: stake,
      payout,
      result,
      placedAt,
      settledAt,
      isBonusWager: bonusWager,
    });
    if ((result === 'win' || result === 'loss') && game.contributesToRollover) {
      effectiveTotal += stake * game.rolloverContributionRate;
    }
  }
  enrollment.rolloverCompleted = effectiveTotal;

  if (patterns.includes('withdrawal') && completedAt) {
    transactions.push({
      id: `txn-withdrawal-${index + 1}`,
      userId: user.id,
      type: 'withdrawal',
      amount: depositAmount * 2.4,
      currency: user.currency,
      status: 'completed',
      promotionId: promotion.id,
      createdAt: new Date(new Date(completedAt).getTime() + 15 * 60000).toISOString(),
      paymentMethod: 'wallet',
    });
  }
}

export const userPromotions = enrollments;
export { transactions, bets };