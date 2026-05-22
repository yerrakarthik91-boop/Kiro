import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { Bill } from '../bills/entities/bill.entity';

/**
 * Unit tests for the FIFO bill-allocation logic, exposed via the private
 * `allocate` method. We bypass the @Injectable wiring and exercise the
 * algorithm with a fake repository.
 */
describe('PaymentsService.allocate (FIFO)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let svc: any;
  let saved: Bill[];
  let billsRepo: any;

  beforeEach(() => {
    svc = new (PaymentsService as any)(
      {} /* payments */,
      {} /* bills */,
      {} /* customers */,
      {} /* sellers */,
      {} /* buyers */,
      {} /* dataSource */,
    );

    saved = [];
    billsRepo = {
      find: jest.fn(),
      save: jest.fn(async (b: Bill) => {
        saved.push(b);
        return b;
      }),
      createQueryBuilder: () => {
        const qb = {
          where: () => qb,
          andWhere: () => qb,
          orderBy: () => qb,
          getMany: jest.fn(),
        };
        return qb;
      },
    };
  });

  function makeBill(id: string, total: number, paid = 0): Bill {
    return {
      id,
      total_amount: total,
      paid_amount: paid,
      status: 'pending',
    } as unknown as Bill;
  }

  it('applies a payment to a single explicitly-targeted bill', async () => {
    const bill = makeBill('b1', 100);
    billsRepo.find.mockResolvedValue([bill]);

    await svc.allocate(billsRepo, 'cust', 60, 'b1');

    expect(saved).toHaveLength(1);
    expect(saved[0].paid_amount).toBe(60);
    expect(saved[0].status).toBe('partial');
  });

  it('marks bill paid when paid_amount >= total', async () => {
    const bill = makeBill('b1', 100);
    billsRepo.find.mockResolvedValue([bill]);

    await svc.allocate(billsRepo, 'cust', 100, 'b1');

    expect(saved[0].paid_amount).toBe(100);
    expect(saved[0].status).toBe('paid');
  });

  it('FIFO across multiple bills when no bill_id specified', async () => {
    const oldBill = makeBill('old', 50);
    const newBill = makeBill('new', 200);

    const qb = {
      where: () => qb,
      andWhere: () => qb,
      orderBy: () => qb,
      getMany: jest.fn().mockResolvedValue([oldBill, newBill]),
    };
    billsRepo.createQueryBuilder = () => qb;

    await svc.allocate(billsRepo, 'cust', 120, null);

    expect(oldBill.paid_amount).toBe(50);
    expect(oldBill.status).toBe('paid');
    expect(newBill.paid_amount).toBe(70);
    expect(newBill.status).toBe('partial');
  });

  it('does nothing once all balance is consumed', async () => {
    const oldBill = makeBill('old', 50);
    const newBill = makeBill('new', 200);

    const qb = {
      where: () => qb,
      andWhere: () => qb,
      orderBy: () => qb,
      getMany: jest.fn().mockResolvedValue([oldBill, newBill]),
    };
    billsRepo.createQueryBuilder = () => qb;

    await svc.allocate(billsRepo, 'cust', 30, null);

    expect(oldBill.paid_amount).toBe(30);
    expect(oldBill.status).toBe('partial');
    expect(newBill.paid_amount).toBe(0);
  });

  it('skips bills already paid in full', async () => {
    const fullyPaid = makeBill('done', 100, 100);
    const open = makeBill('open', 100);

    const qb = {
      where: () => qb,
      andWhere: () => qb,
      orderBy: () => qb,
      getMany: jest.fn().mockResolvedValue([fullyPaid, open]),
    };
    billsRepo.createQueryBuilder = () => qb;

    await svc.allocate(billsRepo, 'cust', 100, null);

    expect(fullyPaid.paid_amount).toBe(100); // unchanged
    expect(open.paid_amount).toBe(100);
    expect(open.status).toBe('paid');
  });
});
