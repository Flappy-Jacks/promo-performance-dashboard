type TokenColors = Record<
  'canvas' | 'surface' | 'raised' | 'line' | 'line-soft' | 'muted' | 'tertiary' | 'paper' | 'stone' | 'burgundy' | 'burgundy-soft' | 'grid' | 'band',
  string
>;

export declare const tokens: {
  colors: TokenColors;
  fontFamily: Record<'display' | 'mono', string[]>;
  fontSize: Record<string, [string, { lineHeight: string; fontWeight?: string; letterSpacing?: string }]>
  spacing: Record<'fib1' | 'fib2' | 'fib3' | 'fib4' | 'fib5' | 'fib6', string>;
};