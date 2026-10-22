// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReviewAccount } from '../types/models';
import { ReviewTable } from './ReviewTable';

afterEach(cleanup);

function makeAccount(id: string, depositUsd: number, score: number, signal: string): ReviewAccount {
  return {
    user: {
      id,
      email: `${id}@example.test`,
      username: id,
      country: 'United Kingdom',
      currency: 'GBP',
      createdAt: '2020-01-01T00:00:00.000Z',
      lastLogin: '2026-10-14T12:00:00.000Z',
      isActive: true,
      kycVerified: true,
    },
    enrollment: {
      id: `enrollment-${id}`,
      userId: id,
      promotionId: 'promo',
      activatedAt: '2026-09-04T00:00:00.000Z',
      depositAmount: depositUsd / 1.28,
      bonusAmount: depositUsd / 2.56,
      rolloverRequirement: depositUsd / 2.56 * 20,
      rolloverCompleted: depositUsd / 2.56 * 20,
      status: 'completed',
      completedAt: '2026-09-05T00:00:00.000Z',
    },
    depositUsd,
    bonusUsd: depositUsd / 2,
    rolloverPercent: 100,
    winRate: 0.5,
    bonusWinRate: 0.6,
    cashWinRate: 0.4,
    observedRtp: 1.12,
    expectedRtp: 0.96,
    completionHours: 24,
    flags: [{ key: signal, label: signal === 'fast' ? 'Fast clear' : 'RTP variance', description: 'Sample review reason.' }],
    score,
    betTimeline: [{ time: '2026-09-04T00:00:00.000Z', value: 10 }],
  };
}

describe('ReviewTable', () => {
  const accounts = [
    makeAccount('user-1111', 170, 84, 'rtp'),
    makeAccount('user-2222', 330, 71, 'fast'),
  ];

  it('sorts by deposit and filters on review signal', () => {
    render(<ReviewTable accounts={accounts} onSelect={vi.fn()} />);
    const table = screen.getByRole('table');
    fireEvent.click(screen.getByRole('button', { name: /deposit/i }));
    expect(table.querySelector('tbody tr')?.textContent).toContain('2222');

    fireEvent.change(screen.getByRole('combobox', { name: /filter review accounts by signal/i }), { target: { value: 'fast' } });
    expect(table.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(table.querySelector('tbody tr')?.textContent).toContain('Fast clear');
  });

  it('opens an account when its queue row is selected', () => {
    const onSelect = vi.fn();
    render(<ReviewTable accounts={accounts} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('row', { name: /1111/i }));
    expect(onSelect).toHaveBeenCalledWith(accounts[0]);
  });

  it('shows no time-to-clear until the rollover requirement is met', () => {
    const incomplete = { ...accounts[0], rolloverPercent: 78 };
    render(<ReviewTable accounts={[incomplete]} onSelect={vi.fn()} />);
    const row = screen.getByRole('row', { name: /1111/i });
    expect(row.querySelectorAll('td')[5].textContent).toBe('—');
  });

  it('caps chips at two, ranks the primary signal, and underlines high scores', () => {
    const account = {
      ...accounts[0],
      score: 88,
      flags: [
        { key: 'shared-pattern', label: 'Shared pattern', description: 'Shared behavior.' },
        { key: 'rtp', label: 'RTP variance', description: 'RTP outlier.' },
        { key: 'fast', label: 'Fast clear', description: 'Fast completion.' },
      ],
    };
    render(<ReviewTable accounts={[account]} onSelect={vi.fn()} />);
    const row = screen.getByRole('row', { name: /1111/i });
    expect(row.querySelectorAll('.flag-chip')).toHaveLength(2);
    expect(row.querySelector('.flag-chip-primary')?.textContent).toBe('RTP variance');
    expect(row.querySelector('.flag-more')?.textContent).toBe('+1');
    expect(row.querySelector('.review-score-high')?.textContent).toBe('88');
  });
});