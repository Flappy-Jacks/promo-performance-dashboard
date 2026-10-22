// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DashboardSnapshot } from '../types/models';
import { ScenarioChart } from './ScenarioChart';

afterEach(cleanup);

describe('ScenarioChart controls', () => {
  it('dispatches the selected scenario and horizon', () => {
    const onScenarioChange = vi.fn();
    const onHorizonChange = vi.fn();
    const snapshot = {
      completionRate: 0.3,
      averageDepositUsd: 186,
      weightedRtp: 0.95,
    } as DashboardSnapshot;
    const projections = [1, 2, 3, 4].map((week) => ({
      week: `W0${week}`,
      activations: 100 - week,
      revenue: week * 1000,
      cost: week * 800,
      net: week * 200,
      netLow: week * 160,
      netBand: week * 80,
    }));

    render(<ScenarioChart
      data={projections}
      snapshot={snapshot}
      scenario="base"
      horizon={12}
      onScenarioChange={onScenarioChange}
      onHorizonChange={onHorizonChange}
    />);
    fireEvent.click(screen.getByRole('button', { name: 'Optimistic' }));
    fireEvent.click(screen.getByRole('button', { name: '4W' }));
    expect(onScenarioChange).toHaveBeenCalledWith('optimistic');
    expect(onHorizonChange).toHaveBeenCalledWith(4);
  });
});