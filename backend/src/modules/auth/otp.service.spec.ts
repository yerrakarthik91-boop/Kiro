import { OtpService } from './otp.service';

describe('OtpService', () => {
  let svc: OtpService;
  const phone = '+919812345678';

  beforeEach(() => {
    svc = new OtpService();
  });

  it('generates the dev OTP 123456 in non-production mode', async () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const code = await svc.generateAndStore(phone);
    expect(code).toBe('123456');

    process.env.NODE_ENV = previous;
  });

  it('verifies a stored OTP and rejects re-use', async () => {
    const code = await svc.generateAndStore(phone);
    expect(await svc.verify(phone, code)).toBe(true);
    // Second time should fail because the entry is consumed.
    expect(await svc.verify(phone, code)).toBe(false);
  });

  it('rejects an unknown phone', async () => {
    expect(await svc.verify('+919999999999', '123456')).toBe(false);
  });

  it('rejects an incorrect OTP', async () => {
    await svc.generateAndStore(phone);
    expect(await svc.verify(phone, '000000')).toBe(false);
  });

  it('rejects an expired OTP', async () => {
    await svc.generateAndStore(phone);
    // Force expiry on the in-memory store.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store: Map<string, { code: string; expiresAt: number }> = (svc as any).store;
    const e = store.get(phone)!;
    e.expiresAt = Date.now() - 1;

    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    expect(await svc.verify(phone, '123456')).toBe(false);
    process.env.NODE_ENV = previous;
  });
});
