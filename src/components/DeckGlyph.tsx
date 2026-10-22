type MetricKind = 'adoption' | 'deposit' | 'liability' | 'return' | 'review';
type ActionKind = 'export' | 'search' | 'sort';

const metricKinds: MetricKind[] = ['adoption', 'deposit', 'liability', 'return', 'review'];

export function MetricGlyph({ index }: { index: number }) {
  const kind = metricKinds[index % metricKinds.length];
  return (
    <svg className="metric-glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {kind === 'adoption' && <><circle cx="12" cy="12" r="8.5" /><path d="M6 18 18 6" /></>}
      {kind === 'deposit' && <><rect x="3.5" y="3.5" width="17" height="17" /><path d="M4 12h16M12 4v16" /></>}
      {kind === 'liability' && <><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5v17M3.5 12h17" /><circle cx="12" cy="12" r="2.25" /></>}
      {kind === 'return' && <><rect x="3.5" y="3.5" width="17" height="17" /><path d="M6 15a6 6 0 0 1 12 0M12 3.5v3" /></>}
      {kind === 'review' && <><circle cx="12" cy="12" r="8.5" /><path d="M4 12h5m6 0h5M12 4v5m0 6v5" /></>}
    </svg>
  );
}

export function ActionGlyph({ kind, descending = true }: { kind: ActionKind; descending?: boolean }) {
  return (
    <svg className={`action-glyph action-glyph-${kind}`} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {kind === 'export' && <><path d="M3 1.5h7l3 3v10H3z" /><path d="M10 1.5v3h3M8 6v5m-2-2 2 2 2-2" /></>}
      {kind === 'search' && <><circle cx="6.5" cy="6.5" r="4.25" /><path d="m9.6 9.6 4.2 4.2M6.5 4.5v4M4.5 6.5h4" /></>}
      {kind === 'sort' && <><path d="M2 3h12M4 7h8M6 11h4M7 14h2" /><path d={descending ? 'M13 5v7m-2-2 2 2 2-2' : 'M13 12V5m-2 2 2-2 2 2'} /></>}
    </svg>
  );
}