/**
 * Locale-safe Indian number formatter.
 * Always uses 'en-IN' locale with a fixed grouping so server and client
 * produce identical output regardless of the host OS locale.
 */
export function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(value);
}

export function formatINRCurrency(value: number): string {
  return `₹${formatINR(value)}`;
}
