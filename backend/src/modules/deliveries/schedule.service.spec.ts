import { BadRequestException } from '@nestjs/common';
import { ScheduleService } from './schedule.service';

describe('ScheduleService.pause', () => {
  function makeSvc(opts: { customers?: any[]; voidExecuted?: jest.Mock }) {
    const customers = opts.customers ?? [];
    const buyers = {
      findOne: jest.fn().mockResolvedValue({ id: 'buyer1' }),
    };
    const customersRepo = {
      find: jest.fn().mockResolvedValue(customers),
    };
    const changesRepo = {
      create: jest.fn((e: any) => e),
      save: jest.fn(async (e: any) => ({ ...e, id: 'change1' })),
    };
    const voidExecute = opts.voidExecuted ?? jest.fn().mockResolvedValue(undefined);
    const deliveriesRepo = {
      createQueryBuilder: () => ({
        update: () => ({
          set: () => ({
            where: () => ({
              andWhere: () => ({
                andWhere: () => ({ execute: voidExecute }),
              }),
            }),
          }),
        }),
      }),
    };

    const svc = new ScheduleService(
      changesRepo as any,
      customersRepo as any,
      deliveriesRepo as any,
      buyers as any,
    );
    return { svc, voidExecute, changesRepo };
  }

  it('rejects an inverted date range', async () => {
    const { svc } = makeSvc({
      customers: [{ id: 'c1', seller_id: 's1' }],
    });
    await expect(
      svc.pause(
        'user1',
        { from_date: '2026-06-10', to_date: '2026-06-01' },
        'pause',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('records the pause and voids overlapping pending deliveries', async () => {
    const { svc, voidExecute, changesRepo } = makeSvc({
      customers: [
        { id: 'c1', seller_id: 's1' },
        { id: 'c2', seller_id: 's1' },
      ],
    });

    const result = await svc.pause(
      'user1',
      { from_date: '2026-06-01', to_date: '2026-06-07', reason: 'travel' },
      'pause',
    );

    expect(result.id).toBe('change1');
    expect(changesRepo.save).toHaveBeenCalledTimes(1);
    // One execute() per linked customer.
    expect(voidExecute).toHaveBeenCalledTimes(2);
  });

  it('extra request creates both a schedule_change and a delivery row', async () => {
    const buyers = { findOne: jest.fn().mockResolvedValue({ id: 'b1' }) };
    const customers = {
      find: jest.fn().mockResolvedValue([
        {
          id: 'c1',
          seller_id: 's1',
          milk_rate: 70,
          product_id: 'p1',
        },
      ]),
    };
    const changesRepo = {
      create: jest.fn((e) => e),
      save: jest.fn(async (e) => ({ ...e, id: 'change99' })),
    };
    const deliveriesRepo = {
      create: jest.fn((e) => e),
      save: jest.fn(async (e) => ({ ...e, id: 'd99' })),
    };

    const svc = new ScheduleService(
      changesRepo as any,
      customers as any,
      deliveriesRepo as any,
      buyers as any,
    );

    const out = await svc.extraRequest('user1', {
      date: '2026-06-10',
      slot: 'morning',
      quantity: 0.5,
    });

    expect(out.schedule_change.id).toBe('change99');
    expect(out.delivery.id).toBe('d99');
    expect(deliveriesRepo.save).toHaveBeenCalledTimes(1);
    expect(changesRepo.save).toHaveBeenCalledTimes(1);
    // Snapshotted rate from customer override.
    expect(deliveriesRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ unit_rate: 70, status: 'extra' }),
    );
  });
});
