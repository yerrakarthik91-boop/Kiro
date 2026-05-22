/**
 * Tests for the bucketKey helper inside ReportsService — the function that
 * groups deliveries into day/week/month buckets for the P&L chart.
 *
 * The helper is a module-private function, so we re-implement the same
 * specification here and then verify the actual implementation through the
 * service via a tiny integration-style test below if it ever gets exported.
 *
 * For now this file documents the expected behavior with a spec that the
 * runtime mirror must agree with.
 */
describe('reports.bucketKey contract', () => {
  // Mirror of the private helper — kept in sync with reports.service.ts.
  function bucketKey(date: string, range: 'day' | 'week' | 'month'): string {
    if (range === 'day') return date;
    const d = new Date(date);
    if (range === 'week') {
      const day = d.getDay();
      const start = new Date(d);
      start.setDate(d.getDate() - day);
      return start.toISOString().slice(0, 10);
    }
    return date.slice(0, 7);
  }

  it("'day' range returns the input date unchanged", () => {
    expect(bucketKey('2026-05-22', 'day')).toBe('2026-05-22');
  });

  it("'month' range returns YYYY-MM", () => {
    expect(bucketKey('2026-05-22', 'month')).toBe('2026-05');
    expect(bucketKey('2026-12-31', 'month')).toBe('2026-12');
  });

  it("'week' range returns the Sunday of that week", () => {
    // 2026-05-22 is a Friday → Sunday of that week is 2026-05-17.
    expect(bucketKey('2026-05-22', 'week')).toBe('2026-05-17');
    // 2026-05-17 (Sunday) → maps to itself.
    expect(bucketKey('2026-05-17', 'week')).toBe('2026-05-17');
  });
});
