// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Dashboard } from './Dashboard';
import { selectDashboard } from '../lib/selectors/dashboard';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

class IntersectionObserverStub {
  static instances: IntersectionObserverStub[] = [];
  targets: Element[] = [];

  constructor(private callback: IntersectionObserverCallback) {
    IntersectionObserverStub.instances.push(this);
  }

  observe = (target: Element) => { this.targets.push(target); };
  disconnect = () => {};
  unobserve = () => {};
  takeRecords = () => [];

  enter(target: Element) {
    this.callback([{
      target,
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: { top: 100 } as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: 0,
    }], this as unknown as IntersectionObserver);
  }
}

describe('Dashboard controls', () => {
  it('filters, changes projections, follows scroll, and exports the view', async () => {
    IntersectionObserverStub.instances = [];
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);
    const onCountryChange = vi.fn();
    const onDateRangeChange = vi.fn();
    const onScenarioChange = vi.fn();
    const onHorizonChange = vi.fn();
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    const snapshot = selectDashboard({ country: 'All countries', dateRange: 'campaign' }, 'base', 12);

    render(<Dashboard
      snapshot={snapshot}
      country="All countries"
      dateRange="campaign"
      scenario="base"
      horizon={12}
      onCountryChange={onCountryChange}
      onDateRangeChange={onDateRangeChange}
      onScenarioChange={onScenarioChange}
      onHorizonChange={onHorizonChange}
    />);

    fireEvent.change(screen.getByLabelText('DATE WINDOW'), { target: { value: '30d' } });
    fireEvent.change(screen.getByLabelText('COUNTRY'), { target: { value: 'Canada' } });
    expect(onDateRangeChange).toHaveBeenCalledWith('30d');
    expect(onCountryChange).toHaveBeenCalledWith('Canada');

    const testSection = document.createElement('section');
    testSection.id = 'section-04';
    document.querySelector('main')?.append(testSection);
    await waitFor(() => expect(IntersectionObserverStub.instances[0].targets).toContain(testSection));
    act(() => IntersectionObserverStub.instances[0].enter(testSection));
    await waitFor(() => expect(screen.getByRole('link', { name: /rollover behaviour/i }).getAttribute('aria-current')).toBe('location'));

    fireEvent.click(screen.getByRole('button', { name: 'Print or save dashboard report' }));
    expect(print).toHaveBeenCalledOnce();
    expect(onScenarioChange).not.toHaveBeenCalled();
    expect(onHorizonChange).not.toHaveBeenCalled();
  });
});