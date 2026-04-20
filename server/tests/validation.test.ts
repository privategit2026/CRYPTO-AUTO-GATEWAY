import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from '../src/modules/auth/auth.schemas.js';
import { createDepositSchema } from '../src/modules/deposits/deposits.schemas.js';
import { createWalletSchema } from '../src/modules/wallets/wallets.schemas.js';

describe('auth schemas', () => {
  it('rejects malformed email on login', () => {
    expect(() => loginSchema.parse({ email: 'nope', password: 'x' })).toThrow();
  });

  it('enforces minimum password length on register', () => {
    const res = registerSchema.safeParse({ email: 'a@b.co', name: 'A', password: 'short' });
    expect(res.success).toBe(false);
  });
});

describe('deposit schema', () => {
  it('rejects zero and negative amounts', () => {
    const base = {
      userDisplayName: 'Alice',
      network: 'TRC20',
      address: 'T' + 'x'.repeat(30),
    };
    expect(createDepositSchema.safeParse({ ...base, amount: '0' }).success).toBe(false);
    expect(createDepositSchema.safeParse({ ...base, amount: '-1' }).success).toBe(false);
    expect(createDepositSchema.safeParse({ ...base, amount: '10.5' }).success).toBe(true);
  });

  it('rejects too-short txids', () => {
    const base = {
      userDisplayName: 'Alice',
      network: 'TRC20',
      address: 'T' + 'x'.repeat(30),
      amount: '100',
    };
    expect(createDepositSchema.safeParse({ ...base, txid: 'short' }).success).toBe(false);
    expect(
      createDepositSchema.safeParse({ ...base, txid: '1234567890abcdef' }).success,
    ).toBe(true);
  });
});

describe('wallet schema', () => {
  it('rejects too-short addresses', () => {
    expect(
      createWalletSchema.safeParse({ address: 'short', network: 'TRC20' }).success,
    ).toBe(false);
  });

  it('accepts a realistic TRC20 address', () => {
    expect(
      createWalletSchema.safeParse({ address: 'TY8mbtR7NLwkzX9ebtQJ6bdBqWmwEd4RtP', network: 'TRC20' }).success,
    ).toBe(true);
  });
});
