import { describe, expect, it } from 'vitest';
import { STATUS_FLOW } from '../src/modules/deposits/deposits.service.js';

describe('deposit status flow', () => {
  it('progresses pending → detected → confirming → completed', () => {
    expect(STATUS_FLOW.PENDING).toBe('DETECTED');
    expect(STATUS_FLOW.DETECTED).toBe('CONFIRMING');
    expect(STATUS_FLOW.CONFIRMING).toBe('COMPLETED');
  });

  it('treats COMPLETED as terminal', () => {
    expect(STATUS_FLOW.COMPLETED).toBe('COMPLETED');
  });

  it('leaves unhappy-path states untouched', () => {
    expect(STATUS_FLOW.FAILED).toBe('FAILED');
    expect(STATUS_FLOW.EXPIRED).toBe('EXPIRED');
  });
});
