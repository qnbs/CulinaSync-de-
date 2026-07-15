/**
 * PBKDF2-Iterations — dokumentierte Drift + Zielangleichung (Master Perfection).
 *
 * | Kontext              | Iterationen | Begründung                                      |
 * |----------------------|-------------|-------------------------------------------------|
 * | API-Key (aktuell)    | 600_000     | OWASP 2023 SHA-256 Empfehlung                   |
 * | Sync-Credentials v3  | 600_000     | angeglichen; v2-Blobs bleiben mit 250_000 lesbar |
 * | Backup CSB3 (neu)    | 600_000     | angeglichen; CSB2/Legacy weiter mit 100_000     |
 * | Backup CSB2 (alt)    | 100_000     | Rückwärtskompatibilität                         |
 */

export const PBKDF2_ITERATIONS_OWASP_2023 = 600_000;
export const PBKDF2_ITERATIONS_SYNC_CREDENTIALS_V2 = 250_000;
export const PBKDF2_ITERATIONS_BACKUP_LEGACY = 100_000;

/** Neue Verschlüsselungen (API-Key, Sync-Credentials v3, Backup CSB3). */
export const PBKDF2_ITERATIONS_CURRENT = PBKDF2_ITERATIONS_OWASP_2023;
