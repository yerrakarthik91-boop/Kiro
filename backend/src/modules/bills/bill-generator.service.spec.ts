import { BillGeneratorService } from './bill-generator.service';

/**
 * Tests for the bill-number sequence and due-date computation in
 * BillGeneratorService. Database interactions are bypassed; we exercise the
 * pure helpers via casting.
 */
describe('BillGeneratorService — pure helpers', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let svc: any;
  beforeEach(() => {
    svc = new BillGeneratorService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
  });

  it('dueDate adds 7 days to period_end', () => {
    expect(svc.dueDate('2026-05-31')).toBe('2026-06-07');
    expect(svc.dueDate('2026-12-31')).toBe('2027-01-07');
  });

  it('nextBillNumber returns INV-<YYYYMM>-0001 when no bills exist', async () => {
    const billsRepo = {
      createQueryBuilder: () => ({
        where: () => ({
          getCount: jest.fn().mockResolvedValue(0),
        }),
      }),
    };
    const result = await svc.nextBillNumber(billsRepo);
    const ym = new Date().toISOString().slice(0, 7).replace('-', '');
    expect(result).toBe(`INV-${ym}-0001`);
  });

  it('nextBillNumber increments sequence', async () => {
    const billsRepo = {
      createQueryBuilder: () => ({
        where: () => ({
          getCount: jest.fn().mockResolvedValue(42),
        }),
      }),
    };
    const result = await svc.nextBillNumber(billsRepo);
    expect(result).toMatch(/INV-\d{6}-0043/);
  });
});
