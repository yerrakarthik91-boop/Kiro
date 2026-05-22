import { DeliveryGeneratorService } from './delivery-generator.service';

/**
 * Tests for rate resolution and idempotent generation. The full generator
 * touches multiple repositories; we use lightweight fakes.
 */
describe('DeliveryGeneratorService', () => {
  function fakeRepo(initial: unknown[] = []) {
    const rows = [...initial];
    return {
      rows,
      find: jest.fn().mockImplementation(async (opts?: any) => {
        if (!opts?.where) return [...rows];
        return rows.filter((r: any) => {
          return Object.entries(opts.where as Record<string, unknown>).every(
            ([k, v]) => (r as Record<string, unknown>)[k] === v,
          );
        });
      }),
      findOne: jest.fn().mockImplementation(async (opts: any) => {
        return (
          rows.find((r: any) =>
            Object.entries(opts.where as Record<string, unknown>).every(
              ([k, v]) => (r as Record<string, unknown>)[k] === v,
            ),
          ) ?? null
        );
      }),
      save: jest.fn().mockImplementation(async (e: any) => {
        rows.push(e);
        return e;
      }),
      create: jest.fn().mockImplementation((e: any) => ({ ...e })),
    };
  }

  it('resolves rate from customer override > product > seller default', async () => {
    const customers = fakeRepo();
    const deliveries = fakeRepo();
    const sellers = fakeRepo([
      { id: 's1', default_milk_rate: 50 },
    ]);
    const products = fakeRepo([
      { id: 'p-cow', default_rate: 60 },
    ]);

    const svc = new DeliveryGeneratorService(
      customers as any,
      deliveries as any,
      sellers as any,
      products as any,
    );

    // 1) Customer with override
    let r = await (svc as any).resolveRate(
      { milk_rate: 75, product_id: 'p-cow' },
      's1',
    );
    expect(Number(r)).toBe(75);

    // 2) No override → product default
    r = await (svc as any).resolveRate(
      { milk_rate: null, product_id: 'p-cow' },
      's1',
    );
    expect(Number(r)).toBe(60);

    // 3) Neither → seller default
    r = await (svc as any).resolveRate(
      { milk_rate: null, product_id: null },
      's1',
    );
    expect(Number(r)).toBe(50);
  });

  it('generates a row per slot, skipping when quantity is 0', async () => {
    const sellerId = 's1';
    const customers = fakeRepo([
      {
        id: 'c1',
        seller_id: sellerId,
        status: 'active',
        delivery_type: 'both',
        morning_quantity: 1,
        evening_quantity: 0, // should be skipped
        milk_rate: 60,
        product_id: null,
      },
    ]);
    const deliveries = fakeRepo();
    const sellers = fakeRepo([{ id: sellerId, default_milk_rate: 60 }]);
    const products = fakeRepo();

    const svc = new DeliveryGeneratorService(
      customers as any,
      deliveries as any,
      sellers as any,
      products as any,
    );

    const count = await (svc as any).generateForSeller(sellerId, '2026-06-01');
    expect(count).toBe(1);
    expect((deliveries as any).rows).toHaveLength(1);
    expect((deliveries as any).rows[0].slot).toBe('morning');
  });

  it('is idempotent — running twice does not duplicate rows', async () => {
    const sellerId = 's1';
    const customers = fakeRepo([
      {
        id: 'c1',
        seller_id: sellerId,
        status: 'active',
        delivery_type: 'morning',
        morning_quantity: 1,
        evening_quantity: 0,
        milk_rate: 60,
        product_id: null,
      },
    ]);
    const deliveries = fakeRepo();
    const sellers = fakeRepo([{ id: sellerId, default_milk_rate: 60 }]);
    const products = fakeRepo();

    const svc = new DeliveryGeneratorService(
      customers as any,
      deliveries as any,
      sellers as any,
      products as any,
    );

    await (svc as any).generateForSeller(sellerId, '2026-06-01');
    await (svc as any).generateForSeller(sellerId, '2026-06-01');

    expect((deliveries as any).rows).toHaveLength(1);
  });
});
