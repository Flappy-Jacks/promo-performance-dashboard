import { useMemo, useState } from 'react';
import { AS_OF_DATE } from '../data/seed';
import type { ReviewAccount } from '../types/models';
import { formatDuration, formatPercent, formatUsd } from '../lib/format';
import { ActionGlyph } from './DeckGlyph';

type SortKey = 'score' | 'depositUsd' | 'rolloverPercent' | 'observedRtp';

interface ReviewTableProps {
  accounts: ReviewAccount[];
  onSelect: (account: ReviewAccount) => void;
}

const sortableColumns: Array<{ key: SortKey; label: string }> = [
  { key: 'depositUsd', label: 'Deposit' },
  { key: 'rolloverPercent', label: 'Rollover' },
  { key: 'observedRtp', label: 'Observed / expected RTP' },
  { key: 'score', label: 'Score' },
];

const signalSeverity: Record<string, number> = {
  rtp: 30,
  'win-gap': 26,
  fast: 25,
  withdrawal: 25,
  'game-mix': 20,
  'shared-pattern': 20,
};

export function ReviewTable({ accounts, onSelect }: ReviewTableProps) {
  const [signal, setSignal] = useState('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [descending, setDescending] = useState(true);

  const visibleAccounts = useMemo(() => accounts
    .filter((account) => signal === 'all' || account.flags.some((flag) => flag.key === signal))
    .filter((account) => account.user.id.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a[sortKey] - b[sortKey]) * (descending ? -1 : 1)), [accounts, descending, search, signal, sortKey]);

  function changeSort(key: SortKey) {
    if (sortKey === key) setDescending((value) => !value);
    else {
      setSortKey(key);
      setDescending(true);
    }
  }

  return (
    <div className="review-table-wrap">
      <div className="review-table-controls">
        <label className="review-search"><ActionGlyph kind="search" /><span className="sr-only">Search masked account ID</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search account ID" /></label>
        <label className="signal-filter"><span>FLAG</span><select value={signal} onChange={(event) => setSignal(event.target.value)} aria-label="Filter review accounts by signal">
          <option value="all">All signals</option><option value="rtp">RTP variance</option><option value="win-gap">Win-rate gap</option><option value="fast">Fast clear</option><option value="game-mix">Game mix</option><option value="withdrawal">Withdrawal</option><option value="shared-pattern">Shared pattern</option>
        </select></label>
      </div>
      <div className="review-table-scroll" tabIndex={0} aria-label="Review queue table; horizontally scrollable">
        <table className="review-table">
          <thead><tr>
            <th scope="col">Account / age</th>
            {sortableColumns.slice(0, 1).map((column) => <th scope="col" key={column.key} aria-sort={sortKey === column.key ? (descending ? 'descending' : 'ascending') : 'none'}><button type="button" className="sort-button" onClick={() => changeSort(column.key)}>{column.label}<ActionGlyph kind="sort" descending={descending} /></button></th>)}
            <th scope="col">Bonus</th><th scope="col">Win rate</th>
            {sortableColumns.slice(1, 2).map((column) => <th scope="col" key={column.key} aria-sort={sortKey === column.key ? (descending ? 'descending' : 'ascending') : 'none'}><button type="button" className="sort-button" onClick={() => changeSort(column.key)}>{column.label}<ActionGlyph kind="sort" descending={descending} /></button></th>)}
            <th scope="col">Time to clear</th><th scope="col">Review flags</th>
            {sortableColumns.slice(2).map((column) => <th scope="col" key={column.key} aria-sort={sortKey === column.key ? (descending ? 'descending' : 'ascending') : 'none'}><button type="button" className="sort-button" onClick={() => changeSort(column.key)}>{column.label}<ActionGlyph kind="sort" descending={descending} /></button></th>)}
            <th scope="col">Action</th>
          </tr></thead>
          <tbody>
            {visibleAccounts.map((account) => {
              const ageYears = (Date.parse(AS_OF_DATE) - Date.parse(account.user.createdAt)) / 31557600000;
              const sortedFlags = [...account.flags].sort((a, b) => (signalSeverity[b.key] ?? 0) - (signalSeverity[a.key] ?? 0));
              const visibleFlags = sortedFlags.slice(0, 2);
              const hiddenFlagCount = sortedFlags.length - visibleFlags.length;
              return (
                <tr key={account.user.id} tabIndex={0} aria-label={`Open review details for account ending ${account.user.id.slice(-4)}`} onClick={() => onSelect(account)} onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(account);
                  }
                }}>
                  <td><strong>fc•••{account.user.id.slice(-4)}</strong><small>{ageYears.toFixed(1)}y · {account.user.country}</small></td>
                  <td>{formatUsd(account.depositUsd)}</td><td>{formatUsd(account.bonusUsd)}</td>
                  <td>{formatPercent(account.winRate)}</td>
                  <td>{account.rolloverPercent.toFixed(0)}%</td>
                  <td>{account.rolloverPercent >= 100 ? formatDuration(account.completionHours) : '—'}</td>
                  <td><div className="flag-list">{visibleFlags.map((flag, index) => <span key={flag.key} className={`flag-chip${index === 0 ? ' flag-chip-primary' : ''}`}>{flag.label}</span>)}{hiddenFlagCount > 0 && <span className="flag-more">+{hiddenFlagCount}</span>}</div></td>
                  <td>{formatPercent(account.observedRtp)} <span className="expected-rtp">/ {formatPercent(account.expectedRtp)}</span></td>
                  <td><strong className={`review-score${account.score >= 80 ? ' review-score-high' : ''}`}>{account.score}</strong></td>
                  <td className="row-open-label">OPEN&nbsp; ↗</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visibleAccounts.length === 0 && <div className="review-empty">No flagged accounts match this filter.</div>}
      </div>
    </div>
  );
}