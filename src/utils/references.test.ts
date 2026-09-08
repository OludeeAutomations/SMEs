import { describe, expect, it } from 'vitest';
import { createReference, displayReference } from './references';

describe('business document references', () => {
  it('creates readable daily sequence numbers', () => {
    const records = [{ id: 'one', createdAt: '2026-09-08T08:00:00Z', reference: 'SALE-20260908-001' }];
    expect(createReference('SALE', '2026-09-08T10:00:00Z', records)).toBe('SALE-20260908-002');
  });

  it('changes the prefix without exposing an internal id', () => {
    const record = { id: 'sale_1757332_random', createdAt: '2026-09-08T10:00:00Z', reference: 'SALE-20260908-003' };
    expect(displayReference('RCT', record)).toBe('RCT-20260908-003');
  });

  it('creates a stable numeric reference for existing records', () => {
    const record = { id: 'sale_legacy_abcd', createdAt: '2026-09-08T10:00:00Z' };
    expect(displayReference('SALE', record)).toMatch(/^SALE-20260908-\d{6}$/);
    expect(displayReference('SALE', record)).toBe(displayReference('SALE', record));
  });
});
