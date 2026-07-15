import { describe, expect, it } from 'vitest';
import {
  PBKDF2_ITERATIONS_BACKUP_LEGACY,
  PBKDF2_ITERATIONS_CURRENT,
  PBKDF2_ITERATIONS_OWASP_2023,
  PBKDF2_ITERATIONS_SYNC_CREDENTIALS_V2,
} from '../cryptoConstants';

describe('cryptoConstants', () => {
  it('hält OWASP-aktuell und Legacy-Werte auseinander', () => {
    expect(PBKDF2_ITERATIONS_CURRENT).toBe(PBKDF2_ITERATIONS_OWASP_2023);
    expect(PBKDF2_ITERATIONS_CURRENT).toBe(600_000);
    expect(PBKDF2_ITERATIONS_SYNC_CREDENTIALS_V2).toBe(250_000);
    expect(PBKDF2_ITERATIONS_BACKUP_LEGACY).toBe(100_000);
  });
});
