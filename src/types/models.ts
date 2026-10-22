export type Currency = 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD';
export type GameCategory = 'slots' | 'live_casino' | 'sportsbook' | 'table';
export type Volatility = 'low' | 'medium' | 'high';
export type TransactionType = 'deposit' | 'withdrawal' | 'bonus_credit' | 'wager' | 'win';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';
export type PromotionStatus = 'pending' | 'active' | 'completed' | 'forfeited';
export type BetResult = 'win' | 'loss' | 'void' | 'pending';
export type Scenario = 'conservative' | 'base' | 'optimistic';
export type DateRange = 'campaign' | '30d' | '90d';

export interface User {
  id: string;
  email: string;
  username: string;
  country: string;
  currency: Currency;
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
  kycVerified: boolean;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  bonusPercentage: number;
  rolloverMultiplier: number;
  eligibleFromDays: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  promotionId?: string;
  createdAt: string;
  paymentMethod: string;
}

export interface Game {
  id: string;
  name: string;
  category: GameCategory;
  provider: string;
  rtp: number;
  volatility: Volatility;
  isActive: boolean;
  contributesToRollover: boolean;
  rolloverContributionRate: number;
}

export interface Bet {
  id: string;
  userId: string;
  gameId: string;
  amount: number;
  payout: number;
  result: BetResult;
  placedAt: string;
  settledAt: string;
  isBonusWager: boolean;
}

export interface UserPromotion {
  id: string;
  userId: string;
  promotionId: string;
  activatedAt: string;
  depositAmount: number;
  bonusAmount: number;
  rolloverRequirement: number;
  rolloverCompleted: number;
  status: PromotionStatus;
  completedAt?: string;
}

export interface DashboardFilters {
  country: string;
  dateRange: DateRange;
}

export interface ReviewFlag {
  key: string;
  label: string;
  description: string;
}

export interface ReviewAccount {
  user: User;
  enrollment: UserPromotion;
  depositUsd: number;
  bonusUsd: number;
  rolloverPercent: number;
  winRate: number;
  bonusWinRate: number;
  cashWinRate: number;
  observedRtp: number;
  expectedRtp: number;
  completionHours: number;
  flags: ReviewFlag[];
  score: number;
  betTimeline: Array<{ time: string; value: number }>;
}

export interface ProjectionPoint {
  week: string;
  activations: number;
  revenue: number;
  cost: number;
  net: number;
  netLow: number;
  netBand: number;
}

export interface DashboardSnapshot {
  eligibleCount: number;
  activationCount: number;
  activationRate: number;
  averageDepositUsd: number;
  depositsDrivenUsd: number;
  bonusCreditedUsd: number;
  bonusLiabilityUsd: number;
  remainingRolloverUsd: number;
  expectedHouseTakeUsd: number;
  bonusGgrUsd: number;
  bonusCostUsd: number;
  completedBonusCostUsd: number;
  forfeitedCostAvoidedUsd: number;
  netContributionUsd: number;
  roiPercent: number;
  completedCount: number;
  forfeitedCount: number;
  flaggedCount: number;
  activationTrend: Array<{ date: string; label: string; daily: number; cumulative: number }>;
  statuses: Array<{ status: PromotionStatus; count: number; share: number }>;
  categoryMix: Array<{ category: GameCategory; rawUsd: number; effectiveUsd: number; rate: number }>;
  volatilityMix: Array<{ volatility: Volatility; amountUsd: number; share: number }>;
  completionHistogram: Array<{ range: string; count: number }>;
  topGames: Array<{ game: Game; effectiveUsd: number; rawUsd: number }>;
  averageCompletionHours: number;
  weightedRtp: number;
  effectiveContributionRate: number;
  completionRate: number;
  reviewQueue: ReviewAccount[];
  projections: ProjectionPoint[];
  countryOptions: string[];
}