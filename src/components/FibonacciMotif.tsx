interface FibonacciMotifProps {
  className?: string;
}

export function FibonacciMotif({ className = '' }: FibonacciMotifProps) {
  return (
    <svg className={`fibonacci-motif ${className}`} viewBox="0 0 13 8" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke">
        <rect x="5" y="0" width="8" height="8" />
        <rect x="0" y="3" width="5" height="5" />
        <rect x="2" y="0" width="3" height="3" />
        <rect x="0" y="1" width="2" height="2" />
        <rect x="0" y="0" width="1" height="1" />
        <rect x="1" y="0" width="1" height="1" />
        <path d="M5 8A8 8 0 0 1 13 0" />
        <path d="M0 3A5 5 0 0 1 5 8" />
        <path d="M2 3A3 3 0 0 1 5 0" />
        <path d="M2 3A2 2 0 0 1 0 1" />
        <path d="M0 1A1 1 0 0 1 1 0" />
        <path d="M1 0A1 1 0 0 1 2 1" />
      </g>
    </svg>
  );
}