import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AS_OF_DATE } from '../data/seed';
import { formatDate } from '../lib/format';
import type { DashboardSnapshot, DateRange, Scenario } from '../types/models';
import { formatNumber, formatPercent, formatUsd } from '../lib/format';
import { KpiStat } from './KpiStat';
import { ActionGlyph } from './DeckGlyph';
import { FibonacciMotif } from './FibonacciMotif';

const AdoptionSection = lazy(() => import('./sections/AdoptionSection').then((module) => ({ default: module.AdoptionSection })));
const FinanceSection = lazy(() => import('./sections/FinanceSection').then((module) => ({ default: module.FinanceSection })));
const ProjectionSection = lazy(() => import('./sections/ProjectionSection').then((module) => ({ default: module.ProjectionSection })));
const RolloverSection = lazy(() => import('./sections/RolloverSection').then((module) => ({ default: module.RolloverSection })));
const ReviewSection = lazy(() => import('./sections/ReviewSection').then((module) => ({ default: module.ReviewSection })));

interface DashboardProps {
  snapshot: DashboardSnapshot;
  country: string;
  dateRange: DateRange;
  scenario: Scenario;
  horizon: 4 | 8 | 12;
  onCountryChange: (country: string) => void;
  onDateRangeChange: (range: DateRange) => void;
  onScenarioChange: (scenario: Scenario) => void;
  onHorizonChange: (horizon: 4 | 8 | 12) => void;
}

const navigation = [
  ['01.', 'Adoption', 'section-01'],
  ['02.', 'Financial return', 'section-02'],
  ['03.', 'Projections', 'section-03'],
  ['04.', 'Rollover behaviour', 'section-04'],
  ['05.', 'Review queue', 'section-05'],
];

function SectionLoading({ label }: { label: string }) {
  return (
    <section className="section-loading" aria-label={`Loading ${label}`} aria-busy="true">
      <div className="loading-heading"><i /></div>
      <div className="loading-panels"><i /><i /><i /></div>
      <span className="sr-only">Loading {label} charts</span>
    </section>
  );
}

export function Dashboard({
  snapshot,
  country,
  dateRange,
  scenario,
  horizon,
  onCountryChange,
  onDateRangeChange,
  onScenarioChange,
  onHorizonChange,
}: DashboardProps) {
  const mainContent = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState(navigation[0][2]);

  useEffect(() => {
    const root = mainContent.current;
    if (!root || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActiveSection((visible.target as HTMLElement).id);
    }, { rootMargin: '-18% 0px -62% 0px', threshold: 0 });
    const observed = new Set<Element>();
    const observeSections = () => {
      for (const [, , target] of navigation) {
        const section = document.getElementById(target);
        if (section && !observed.has(section)) {
          observed.add(section);
          observer.observe(section);
        }
      }
    };
    observeSections();
    const mutationObserver = new MutationObserver(observeSections);
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <div className="dashboard-shell grid grid-cols-12 gap-4 px-4">
      {/* SIDEBAR */}
      
      <aside className="sidebar col-span-2 top-0 h-screen sticky">
        <a href="#top" className="brand-lockup" aria-label="Flycatcher dashboard home">
          <span className="wordmark">Flycatcher</span>
          {/* REMOVED */}
          {/* <span className="brand-subline"><span>Intelligent</span><span>Design</span></span> */}
          <span className="brand-since"><span>Operating Since</span><span>11.07.23</span></span>
        </a>
        <p className="sidebar-label">[ PROMOTION MONITOR ]</p>
        <nav className="sidebar-nav" aria-label="Dashboard sections">
          {navigation.map(([number, label, target]) => (
            <a key={number} href={`#${target}`} className={activeSection === target ? 'active' : undefined} aria-current={activeSection === target ? 'location' : undefined}>{label}</a>
          ))}
        </nav>
        
        <div className="sidebar-campaign">
          <span className="sidebar-label">CURRENT CAMPAIGN</span>
          <strong>Long-standing users</strong>
          <span>50% DEPOSIT TOP-UP</span>
          <span>20× BONUS ROLLOVER</span>
        </div>
        <div className="sidebar-foot">
          <span className="illustrative-mark" />
          <span>Illustrative data</span>
          <small>USD reporting · FX applied</small>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main id="top" ref={mainContent} className="main-content col-span-10">
        
        {/* HEADER */}
        <header className="topline">
          <span>Promotion performance</span>
          <span className="topline-wordmark">FLYCATCHER</span>
          <span>Sync Verified&nbsp; / &nbsp;{formatDate(AS_OF_DATE)}</span>
        </header>

        {/* TOP SECTION */}
        {/* <div className="page-intro">
          <FibonacciMotif className="title-motif" />
          <div>
            <p className="eyebrow">CAMPAIGN&nbsp; / &nbsp;LONG-STANDING USERS</p>
            <h1>Promotion<br className="mobile-break" /> performance</h1>
          </div>
          <aside className="campaign-summary" aria-label="Promotion details">
            <span>50% deposit top-up</span>
            <span>20× rollover on bonus</span>
            <span>First deposit · 01—07 Sep 2026</span>
            <span>Account age ≥ 365 days</span>
          </aside>
          <span className="illustrative-tag">ILLUSTRATIVE DATA</span>
        </div> */}
        <div className="global-controls" aria-label="Dashboard filters">
          <label>
            <span>DATE WINDOW</span>
            <select value={dateRange} onChange={(event) => onDateRangeChange(event.target.value as DateRange)}>
              <option value="campaign">Campaign + tail</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </label>
          <label>
            <span>COUNTRY</span>
            <select value={country} onChange={(event) => onCountryChange(event.target.value)}>
              {snapshot.countryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <div className="filter-note"><span>AS OF</span>{formatDate(AS_OF_DATE).toUpperCase()}</div>
          <button type="button" className="export-button" onClick={() => window.print()} aria-label="Print or save dashboard report">
            <ActionGlyph kind="export" /><span>Export view</span>
          </button>
        </div>

        <section className="kpi-strip" aria-label="Promotion five-second summary">
          <KpiStat label="ACTIVATION RATE" value={snapshot.activationRate * 100} format={(value) => `${value.toFixed(1)}%`} detail={`${formatNumber(snapshot.activationCount)} / ${formatNumber(snapshot.eligibleCount)} eligible`} index={0} />
          <KpiStat label="DEPOSITS DRIVEN" value={snapshot.depositsDrivenUsd} format={(value) => formatUsd(value, true)} detail={`${formatNumber(snapshot.activationCount)} qualifying deposits`} index={1} />
          <KpiStat label="BONUS LIABILITY" value={snapshot.bonusLiabilityUsd} format={(value) => formatUsd(value, true)} detail="Outstanding at current progress" index={2} />
          <KpiStat label="NET CONTRIBUTION" value={snapshot.netContributionUsd} format={(value) => formatUsd(value, true)} detail={`ROI ${formatPercent(snapshot.roiPercent / 100, 1)}`} index={3} alert={snapshot.netContributionUsd < 0} />
          <KpiStat label="ACCOUNTS FLAGGED" value={snapshot.flaggedCount} format={formatNumber} detail="For review · not a finding" index={4} alert={snapshot.flaggedCount > 0} />
        </section>

        {/* REMOVED */}

        <Suspense fallback={<SectionLoading label="Popularity and adoption" />}><AdoptionSection snapshot={snapshot} /></Suspense>
        <Suspense fallback={<SectionLoading label="Financial exposure and return" />}><FinanceSection snapshot={snapshot} /></Suspense>
        <Suspense fallback={<SectionLoading label="Projections" />}><ProjectionSection snapshot={snapshot} scenario={scenario} horizon={horizon} onScenarioChange={onScenarioChange} onHorizonChange={onHorizonChange} /></Suspense>
        <Suspense fallback={<SectionLoading label="Rollover fulfilment behaviour" />}><RolloverSection snapshot={snapshot} /></Suspense>
        <Suspense fallback={<SectionLoading label="Irregular winning patterns" />}><ReviewSection snapshot={snapshot} /></Suspense>

        {/* FOOTER */}
        <footer className="page-footer">
          <span>FX ASSUMPTION&nbsp; / &nbsp;FIXED SEED CONVERSION TO USD</span>
          <a href="#assumptions-note">Assumptions</a>
          <span>DATASET&nbsp; / &nbsp;ILLUSTRATIVE · NO BACKEND</span>
        </footer>
      </main>
    </div>
  );
}